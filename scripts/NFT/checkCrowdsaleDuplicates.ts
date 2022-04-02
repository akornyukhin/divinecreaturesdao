import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import {
    DivineCreature,
    DivineCreature__factory,
    NFTCrowdsale__factory } from '../../src/typechain'

import axios from "axios"
import * as fs from 'fs'

const addresses = {
    nft: '0xD6D5A37C7CBd401210B8Aa81133966Ca9B9236E8',
    crowdsale: '0x06E476535716ee6c574FeB09D086E1B3dF9E8eB0'
}

interface INftLoadedData2 {
    collection: string,
    name: string,
    quality: number,
    image: string,
    preview750: string,
    preview450: string,
    preview300: string,
}

interface INftLoadedData {
    collection: string,
    name: string,
    quality: number,
    image: string,
    preview: string
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
    const nftCrowdsale = NFTCrowdsale__factory.connect(addresses.crowdsale, deployer)

    const nftCount = (await nft.totalSupply()).toNumber()

    console.log("Count: " + nftCount)

    const nftDatas = []
    const tokenIds = []
    const addrs = new Map<string, number[]>()

    for (let i = 0; i < nftCount; i++) {
        
        const tokenId = (await nft.tokenByIndex(i)).toNumber()
        tokenIds.push(tokenId)
        const nftData = await loadNftData(nft, tokenId)
        nftDatas.push(nftData)
        
        if (addrs.has(nftData.tokenUri)) {
            addrs.get(nftData.tokenUri)!.push(tokenId)
        } 
        else {
            addrs.set(nftData.tokenUri, [tokenId])
        }
            console.log("i: " + i)
    }

    const str = JSON.stringify(Object.fromEntries(addrs.entries()), null, 4)

    const addressesFile = '../src/static/tokensMap.json'
    fs.writeFileSync(addressesFile, str, 'utf8')

    const str2 = JSON.stringify(tokenIds, null, 4)
    const addressesFile2 = '../src/static/tokens.json'
    fs.writeFileSync(addressesFile2, str2, 'utf8')

    const str3 = JSON.stringify(nftDatas, null, 4)
    const addressesFile3 = '../src/static/nftData.json'
    fs.writeFileSync(addressesFile3, str3, 'utf8')

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
});