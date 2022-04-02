import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { createContracts, mintNft } from '../src/helpers/state'
import { Auction__factory, MagicInternetMoneyV1, MagicInternetMoneyV1__factory, NFTCrowdsale__factory } from '../src/typechain'


async function main() {

    const [deployer, firstSigner, secondSigner]: SignerWithAddress[] = await ethers.getSigners() 

    console.log( `deployer: ${deployer.address} `)
    console.log( `1st: ${firstSigner.address} `)
    console.log( `2st: ${secondSigner.address} `)

    // const str = JSON.stringify(loadedAddresses, null, 4)
    // console.log( "All Addresses: " + str)

    const contracts = createContracts(deployer)
    const mimAmount = '250000000000000000000000'
    console.log( "Mim minting")
    // const mim = MagicInternetMoneyV1__factory.connect(contracts.mim.reserve.address, deployer)
    const mim = contracts.mim.reserve
    await mim.mint(deployer.address, mimAmount)
    console.log( "Mim minted")
    await mim.transfer(firstSigner.address, "12500000000000000000000")
    await mim.transfer(secondSigner.address, "12500000000000000000000")
    console.log( "Mim transferred")
    const mim1 = MagicInternetMoneyV1__factory.connect(contracts.mim.reserve.address, firstSigner)
    const mim2 = MagicInternetMoneyV1__factory.connect(contracts.mim.reserve.address, secondSigner)
    console.log( "Mim12 connected")
    const nftCrowdsale1 = NFTCrowdsale__factory.connect(contracts.nftCrowdsale.address, firstSigner)
    const nftCrowdsale2 = NFTCrowdsale__factory.connect(contracts.nftCrowdsale.address, secondSigner)
    console.log( "crowdsale connected")
    // await mim1.approve(nftCrowdsale1.address, "1250000000000000000000")
    // await mim2.approve(nftCrowdsale2.address, "1250000000000000000000")
    // console.log( "crowdsale approved")

    console.log( "Nft : " + (await contracts.nft.name()))

  
    const isApprovedFirst = await contracts.nftCrowdsale.checkApproved(firstSigner.address)
    console.log( `is 1st approved: ${isApprovedFirst} `)
    const isApprovedSecond = await contracts.nftCrowdsale.checkApproved(secondSigner.address)
    console.log( `is 2st approved: ${isApprovedSecond} `)
    if (!isApprovedSecond) {
        await contracts.nftCrowdsale.addAddress(secondSigner.address)
        const isApprovedSecond2 = await contracts.nftCrowdsale.checkApproved(secondSigner.address)
        console.log( `is 2st approved: ${isApprovedSecond2} `)
    }
    
    console.log( `nft totalSupply: ${await contracts.nft.totalSupply()}`)
    const tokenId = await mintNft(contracts.nft, deployer.address, 1, "QmPW7yiF7qjhwtjvx2Y7tLuUQGC7a4EKg7eke1R6nXub2P")
    console.log( `nft tokenId: ${tokenId}`)
    // // Gods
    // await mintNft(contracts.nft, deployer.address, 3, "QmbZiAtNQ1mrjD79YH1o6cm83QukVbcutZGTBwx8M695KB")
    // await mintNft(contracts.nft, deployer.address, 3, "QmbcNqE2HQnjA4pjHZkoGXgPkr63BdfnLHm4efiHr3XppW")
    // await mintNft(contracts.nft, deployer.address, 3, "QmShZyjsoZN3CJMRgWEbuYAyuHS2Q4D3Zxcimq3NEU3wQP")
    // await mintNft(contracts.nft, deployer.address, 3, "Qmbci5EkDsDf4jFwrvZroCQwQ6vzvK3osATFkXENvwqpXg")
    // await mintNft(contracts.nft, deployer.address, 3, "QmdUXHxq2CFvPBSzFnCHKbKJNZpmRfpCK26Uo87e3e7ePz")
    // // Deity
    // await mintNft(contracts.nft, deployer.address, 2, "QmYAmCuqhkkqYp1mHrpux5XJpVHVccfcuDHcLFw7CHtCHB")
    // await mintNft(contracts.nft, deployer.address, 2, "QmacvrqbDWBUt3iGeyYZ6xRGMoJNadjvAciyn59jBTJBc7")
    // await mintNft(contracts.nft, deployer.address, 2, "QmZJ5ADokuXsqFz6vB4eNp96p6pjwcqrV9n6B8KkrpLp8T")
    // await mintNft(contracts.nft, deployer.address, 2, "QmckWJ39TCjfVwCDRzSLdYM17yK5QpVGnAzbGdRaHwzFdW")
    // await mintNft(contracts.nft, deployer.address, 2, "Qmde1NzjASNNg6zDsdrbh7LyQ6LvZ2VCAsH5yTYvfs2Ngd")
    // Demi
    await mintNft(contracts.nft, deployer.address, 1, "QmefhQYshP4XvMvsub9dg4exKDfzEp8iM5pZJbcgu6DvPp")
    await mintNft(contracts.nft, deployer.address, 1, "QmbgZ3pksNQD5YxRWRXzBBuXWQPnHgouTxXDjKTGSZaUaW")
    await mintNft(contracts.nft, deployer.address, 1, "QmPdpfW9iyKYniWSTZNyJFebhenbSpTRNbNgEjZ87ypfj1")
    await mintNft(contracts.nft, deployer.address, 1, "QmQRgWqLKUuRT81MDnWmxEhAnrmEmQm4zJfENX9gxqiJG9")
    await mintNft(contracts.nft, deployer.address, 1, "QmWG97StJVZCDAAXqpkhJobeLMmJqLr2zsuVKQLxZK5FEc")

    const totalSupply = await contracts.nft.totalSupply()
    console.log( `nft totalSupply: ${totalSupply}`)


    // const arr = ["1", 
    //     "2", "3",
    //     "4", "5"]

    // function sliceIntoChunks(arr: string[], chunkSize: number) {
    //     const res = [];
    //     for (let i = 0; i < arr.length; i += chunkSize) {
    //         const chunk = arr.slice(i, i + chunkSize);
    //         res.push(chunk);
    //     }
    //     return res;
    // }
    
    // const chunkSize = 2
    // for (let chunk of sliceIntoChunks(arr, chunkSize)) {
    //     console.log(chunk)

    //     await contracts.nft.safeMintBatch(deployer.address, 1, chunk)
    // }

    // Get number of NFTs
    let deployerNFTNumber = await contracts.nft.balanceOf(deployer.address)
    console.log(`deployerNFTNumber: ${deployerNFTNumber}`)
    
    // // Send NFTs to Crowdsale
    // const tokensToCrowdsale = []
    // // Send NFTs to Crowdsale
    // for (let i=0; i < deployerNFTNumber.toNumber(); i++) {
    //     const tokenID = await contracts.nft.tokenOfOwnerByIndex(deployer.address, i)
    //     tokensToCrowdsale.push(tokenID)
    // }

    // for (let tokenID of tokensToCrowdsale) {
    //     await contracts.nft.transferFrom(deployer.address, contracts.nftCrowdsale.address, tokenID)
    // }

    const ftm = mim1
    
    const nft = contracts.nft
    
    const openTime = Math.floor(Date.now() / 1000) + 25
    const globalCloseTime = openTime + 7200

    // Deploy nftAuction (will be using ftm instead of FTM for simpicity)
    // const nftAuction = await new Auction__factory(deployer).deploy(deployer.address, ftm.address, contracts.nft.address, globalCloseTime)
    const nftAuction = contracts.auction

    const tokensToCrowdsale = []
    // Send NFTs to nftAuction
    for (let i=0; i < deployerNFTNumber.toNumber(); i++) {
        const tokenID = await nft.tokenOfOwnerByIndex(deployer.address, i)
        tokensToCrowdsale.push(tokenID)
    }

    for (let tokenID of tokensToCrowdsale) {
        await nft.transferFrom(deployer.address, nftAuction[0].address, tokenID)
    }

    await nftAuction[0].placeLot(0, "125000000000000000000", openTime + 15, 3600, "5000000000000000000");
    await nftAuction[0].placeLot(1, "125000000000000000000", openTime + 15, 3600, "5000000000000000000");
    await nftAuction[0].placeLot(2, "125000000000000000000", openTime + 15, 3600, "5000000000000000000");

    // // Connect buyers to NFT Crowdsale contract
    // const nftAuction1 = Auction__factory.connect(nftAuction.address, firstSigner)
    // const nftAuction2 = Auction__factory.connect(nftAuction.address, secondSigner)

    // // Connect buyers to ftm contract
    // const ftm1 = MagicInternetMoneyV1__factory.connect(ftm.address, firstSigner)
    // const ftm2 = MagicInternetMoneyV1__factory.connect(ftm.address, secondSigner)

    // // Approve ftm spending for both buyers
    // await ftm1.approve(nftAuction1.address, "500000000000000000000")
    // await ftm2.approve(nftAuction2.address, "200000000000000000000")

    // await nftAuction1.bid(0, "130000000000000000000")
    // await nftAuction1.bid(1, "130000000000000000000")
    // await nftAuction2.bid(1, "150000000000000000000")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
});
