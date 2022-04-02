import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import {
    DivineCreature,
    DivineCreature__factory } from '../../src/typechain'
import * as fs from 'fs'

const addresses = {
    nft: '0xD6D5A37C7CBd401210B8Aa81133966Ca9B9236E8',
    mainNFTOwner: '0x86f597fd9e894fa7ee491e5f365c88f95cb08574'
}

interface INftData {
    tokenId: number,
    tokenUri: string,
}

const loadNftData = async (nft: DivineCreature, tokenId: number): Promise<INftData> => {
    const tokenUri = (await nft.tokenURI(tokenId))

    const nftLoaded = {
        tokenId,
        tokenUri,
    }

    return nftLoaded
}

async function main() {

    const [deployer]: SignerWithAddress[] = await ethers.getSigners()
    const nft = DivineCreature__factory.connect(addresses.nft, deployer)

    const nftCount = (await nft.balanceOf(addresses.mainNFTOwner)).toNumber()

    console.log("Count: " + nftCount)

    for (let i = 0; i < nftCount; i++) {
        
        const tokenId = (await nft.tokenOfOwnerByIndex(addresses.mainNFTOwner, i)).toNumber()
        const nftData = (await loadNftData(nft, tokenId))
        const nftUriArr = nftData.tokenUri.split('/')
        const nftQuality = await nft.quality(tokenId)
        console.log("Loaded NFT data ID: %s", nftData.tokenId)
        console.log("Loaded NFT data URI: %s", nftUriArr[nftUriArr.length - 1])

        console.log("Concatenated: %s", `${nftData.tokenId},${nftUriArr[nftUriArr.length - 1]},${nftQuality}`)
        const dataToAppend = `${nftData.tokenId},${nftUriArr[nftUriArr.length - 1]},${nftQuality}\n`

        fs.appendFileSync('../src/static/tokenList.csv', dataToAppend)

    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
});