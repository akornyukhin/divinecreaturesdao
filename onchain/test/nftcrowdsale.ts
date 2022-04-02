import { ethers, waffle } from 'hardhat'
import chai from 'chai'

import { MagicInternetMoneyV1__factory, DivineCreature__factory, NFTCrowdsale__factory } from '../../src/typechain'
import { mintNft } from "../../src/helpers/state"

const { expect } = chai

describe('NFT Crowdsale', async () => {
    describe("NFT crowdsale function check", async() => {
        it("should receive mim and return nft", async() => {

            // Deployer and MockDAO adddresses
            const [deployer, firstBuyer, secondBuyer] = await ethers.getSigners()

            // Initial MIM amount
            const mimAmount = '250000000000000000000'

            // Large number for approval for MIM
            const largeApproval = '100000000000000000000000000000000'

            // Deploy MIM
            // Need to check what is the Fantom StableCoin we are going to use
            const mim = await new MagicInternetMoneyV1__factory(deployer).deploy()

            // Deploy 10,000,000 mock MIM
            await mim.mint(deployer.address, mimAmount)

            // Deploy MIM to buyes
            await mim.transfer(firstBuyer.address, "125000000000000000000")
            // // Deploy MIM to buyes
            await mim.transfer(secondBuyer.address, "125000000000000000000")

            // Deploy NFT contractc
            const nft = await (new DivineCreature__factory(deployer).deploy())

            // Mint NFTs to deployer
            for (let i = 0; i < 2; i++) {
                const tokenId = await mintNft(nft, deployer.address, 1, "QmZz2rCY6gNdZidYBtyM69JyZbGEg1yNTyn5ZBm4A61m3S")
                console.log( `nft minted, tokenId: ${tokenId}`)
            }

            const openTime = Math.floor(Date.now() / 1000) + 6000
            const closeTime = openTime + 60

            // Deploy Crowdsale (will be using MIM instead of FTM for simpicity)
            const nftCrowdsale = await new NFTCrowdsale__factory(deployer).deploy(deployer.address, mim.address, nft.address, openTime, closeTime)

            // Approve NFT send from holder wallet
            let deployerNFTNumber = await nft.balanceOf(deployer.address)

            const tokensToCrowdsale = []
            // Send NFTs to Crowdsale
            for (let i=0; i < deployerNFTNumber.toNumber(); i++) {
                const tokenID = await nft.tokenOfOwnerByIndex(deployer.address, i)
                tokensToCrowdsale.push(tokenID)
            }

            for (let tokenID of tokensToCrowdsale) {
                await nft.transferFrom(deployer.address, nftCrowdsale.address, tokenID)
            }

            // Add buyers to whitelist
            await nftCrowdsale.addBatchAddress([firstBuyer.address, secondBuyer.address])

            // Connect buyers to NFT Crowdsale contract
            const nftCrowdsale1 = NFTCrowdsale__factory.connect(nftCrowdsale.address, firstBuyer)
            const nftCrowdsale2 = NFTCrowdsale__factory.connect(nftCrowdsale.address, secondBuyer)

            // Connect buyers to MIM contract
            const mim1 = MagicInternetMoneyV1__factory.connect(mim.address, firstBuyer)
            const mim2 = MagicInternetMoneyV1__factory.connect(mim.address, secondBuyer)

            // Approve MIM spending for both buyers
            await mim1.approve(nftCrowdsale1.address, "125000000000000000000")
            await mim2.approve(nftCrowdsale2.address, "125000000000000000000")

            console.log("firstBuyer MIM balance: %s", await mim.balanceOf(firstBuyer.address))
            console.log("secondBuyer MIM balance: %s", await mim.balanceOf(secondBuyer.address))

            expect(await mim.balanceOf(firstBuyer.address)).to.eq("125000000000000000000")
            expect(await mim.balanceOf(secondBuyer.address)).to.eq("125000000000000000000")

            await nftCrowdsale1.buyNFT(firstBuyer.address, "125000000000000000000")
            await nftCrowdsale2.buyNFT(secondBuyer.address, "125000000000000000000")

            console.log("firstBuyer MIM balance: %s", await mim.balanceOf(firstBuyer.address))
            console.log("secondBuyer MIM balance: %s", await mim.balanceOf(secondBuyer.address))
            console.log("firstBuyer NFT balance: %s", await nft.balanceOf(firstBuyer.address))
            console.log("secondBuyer NFT balance: %s", await nft.balanceOf(secondBuyer.address))

            expect(await mim.balanceOf(firstBuyer.address)).to.eq(0)
            expect(await mim.balanceOf(secondBuyer.address)).to.eq(0)
            expect(await nft.balanceOf(firstBuyer.address)).to.eq(1)
            expect(await nft.balanceOf(secondBuyer.address)).to.eq(1)

        })
    })
})
