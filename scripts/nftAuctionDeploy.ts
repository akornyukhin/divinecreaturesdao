import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { createContracts, mintNft } from '../src/helpers/state'
import {
    Auction__factory,
    DivineCreature__factory,
    MagicInternetMoneyV1,
    MagicInternetMoneyV1__factory,
    NFTCrowdsale__factory
} from '../src/typechain'


async function main() {

    const [deployer, firstSigner, secondSigner]: SignerWithAddress[] = await ethers.getSigners()

    console.log( `deployer: ${deployer.address} `)
    console.log( `1st: ${firstSigner.address} `)
    console.log( `2st: ${secondSigner.address} `)

    // const str = JSON.stringify(loadedAddresses, null, 4)
    // console.log( "All Addresses: " + str)

    const contracts = createContracts(deployer)

    // Initial ftm amount
    const ftmAmount = '2000000000000000000000'

    // Large number for approval for ftm
    const largeApproval = '100000000000000000000000000000000'

    // Deploy ftm
    // Need to check what is the Fantom StableCoin we are going to use
    const ftm = await new MagicInternetMoneyV1__factory(deployer).deploy()

    // Deploy 10,000,000 mock ftm
    await ftm.mint(deployer.address, ftmAmount)

    // Deploy ftm to buyes
    await ftm.transfer(firstSigner.address, "1000000000000000000000")
    // // Deploy ftm to buyes
    await ftm.transfer(secondSigner.address, "1000000000000000000000")

    // Deploy NFT contractc
    const nft = await (new DivineCreature__factory(deployer).deploy())

    // Mint NFTs to deployer
    for (let i = 0; i < 3; i++) {
        const tokenId = await mintNft(nft, deployer.address, 1, "QmZz2rCY6gNdZidYBtyM69JyZbGEg1yNTyn5ZBm4A61m3S")
        console.log( `nft minted, tokenId: ${tokenId}`)
    }

    const openTime = Math.floor(Date.now() / 1000) + 25
    const globalCloseTime = openTime + 7200

    // Deploy nftAuction (will be using ftm instead of FTM for simpicity)
    const nftAuction = await new Auction__factory(deployer).deploy(deployer.address, ftm.address, nft.address, globalCloseTime)

    // Approve NFT send from holder wallet
    let deployerNFTNumber = await nft.balanceOf(deployer.address)

    const tokensToCrowdsale = []
    // Send NFTs to nftAuction
    for (let i=0; i < deployerNFTNumber.toNumber(); i++) {
        const tokenID = await nft.tokenOfOwnerByIndex(deployer.address, i)
        tokensToCrowdsale.push(tokenID)
    }

    for (let tokenID of tokensToCrowdsale) {
        await nft.transferFrom(deployer.address, nftAuction.address, tokenID)
    }

    await nftAuction.placeLot(0, "125000000000000000000", openTime + 15, 3600, 5);
    await nftAuction.placeLot(1, "125000000000000000000", openTime + 15, 3600, 5);
    await nftAuction.placeLot(2, "125000000000000000000", openTime + 15, 3600, 5);

    // Connect buyers to NFT Crowdsale contract
    const nftAuction1 = Auction__factory.connect(nftAuction.address, firstSigner)
    const nftAuction2 = Auction__factory.connect(nftAuction.address, secondSigner)

    // Connect buyers to ftm contract
    const ftm1 = MagicInternetMoneyV1__factory.connect(ftm.address, firstSigner)
    const ftm2 = MagicInternetMoneyV1__factory.connect(ftm.address, secondSigner)

    // Approve ftm spending for both buyers
    await ftm1.approve(nftAuction1.address, "500000000000000000000")
    await ftm2.approve(nftAuction2.address, "200000000000000000000")

    await nftAuction1.bid(0, "130000000000000000000")
    await nftAuction1.bid(1, "130000000000000000000")
    await nftAuction2.bid(1, "150000000000000000000")
    
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
})};
