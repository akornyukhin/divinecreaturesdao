import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { createContracts, mintNft } from '../src/helpers/state'
import { DivineCreature, DivineCreature__factory, MagicInternetMoneyV1, MagicInternetMoneyV1__factory, NFTCrowdsale__factory } from '../src/typechain'
import axios from "axios"
import * as fs from 'fs'

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
    // loadedData: INftLoadedData
}

const loadNftData = async (nft: DivineCreature, tokenId: number): Promise<INftData> => {
    const tokenUri = (await nft.tokenURI(tokenId))
    // const { data } = await axios.get(tokenUri)

    // const l = data as INftLoadedData2

    const nftLoaded = {
        tokenId,
        tokenUri,
        // loadedData: { ...l, preview: l.preview750 }
    }

    return nftLoaded
}

async function main() {

    const [deployer, firstSigner, secondSigner]: SignerWithAddress[] = await ethers.getSigners() 

    console.log( `deployer: ${deployer.address} `)
    console.log( `1st: ${firstSigner.address} `)
 
    console.log( `2st: ${secondSigner.address} `)

    // const contracts = createContracts(deployer)

    const nft = DivineCreature__factory.connect("0x6CA47aFb5AB4FB992ff1aAF27b3597F3f8CfC8c7", deployer)
    const nftCrowdsale = NFTCrowdsale__factory.connect("", deployer)

    const batchSize = 10
    do {
        const ownTokenIds = []
        const ownNftCount = (await nft.balanceOf(deployer.address)).toNumber()

        for (let i = 0; i < ownNftCount && i < batchSize; i++) {
            const tokenId = (await nft.tokenOfOwnerByIndex(deployer.address, i)).toNumber()
            ownTokenIds.push(tokenId)
        }
        console.log(ownTokenIds)
        if (ownTokenIds.length == 0) break;
        await (await nft.transferFromBatch(deployer.address, nftCrowdsale.address, ownTokenIds)).wait(3)
    }
    while (true)


    const nftCount = (await nft.totalSupply()).toNumber()

    const toDelete = [150, 151, 152, 153, 154, 155, 156, 157, 158, 159]
    toDelete.forEach(tid => { nft.burn(tid) });

    for (let tid of [150, 151, 152, 153, 154, 155, 156, 157, 158, 159]) {
        await (await nft.burn(tid)).wait(5)
    }

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
        // if (i % 10 == 0) 
            console.log("i: " + i)
    }

    console.log("tokenIds: " + tokenIds.length)
    console.log("addrs.length: " + addrs.size)

    const str = JSON.stringify(Object.fromEntries(addrs.entries()), null, 4)
    console.log( "All tokens done ");

    const addressesFile = `../src/static/tokensMap.json`
    fs.writeFileSync(addressesFile, str, 'utf8')

    const str2 = JSON.stringify(tokenIds, null, 4)
    const addressesFile2 = `../src/static/tokens.json`
    fs.writeFileSync(addressesFile2, str, 'utf8')

    const str3 = JSON.stringify(nftDatas, null, 4)
    console.log( "All tokens done ");

    const addressesFile3 = `../src/static/nftData.json`


    fs.writeFileSync(addressesFile3, str, 'utf8')
 
    // for (let tokenID of tokensToCrowdsale) {
    //     // await contracts.nft.transferFrom(deployer.address, contracts.nftCrowdsale.address, tokenID)
    // }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
});
