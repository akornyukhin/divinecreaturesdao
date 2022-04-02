import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import {
    DivineCreature,
    DivineCreature__factory, 
    NFTCrowdsale__factory} from '../../src/typechain'
import { deployContracts } from '../deploy';
import { NonceManager } from "@ethersproject/experimental";
import axios from 'axios'

// const csv = require('csv-parse');
const fs = require('fs');

const whitelist = '/mnt/c/Users/ommzzZ/git/Valhalla/scripts/CSVs/whitelist.csv'

const addresses = {
    nft: '0xD6D5A37C7CBd401210B8Aa81133966Ca9B9236E8',
    crowdsale: '0x06E476535716ee6c574FeB09D086E1B3dF9E8eB0',
    multiSigAddress: '0x0Bc9455347598c51D0d605aeBE316Af41df94FfC',
    wFtmAddress: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
}

const openTime = ''
const endTime = ''

async function main() {

    const [deployer]: SignerWithAddress[] = await ethers.getSigners()

    const nft = DivineCreature__factory.connect(addresses.nft, deployer)
    // const nftCrowdsale = await (new NFTCrowdsale__factory(deployer).deploy(addresses.multiSigAddress, addresses.wFtmAddress, nft.address, openTime, endTime))
    const nftCrowdsale = NFTCrowdsale__factory.connect(addresses.crowdsale, deployer)

    console.log("NFT address: %s", nft.address)
    console.log("Crowdsale address: %s", nftCrowdsale.address)
    console.log("Divine Creatures address in Crowdsale: %s", await nftCrowdsale.divineCreatures())
    let baseNonce = ethers.provider.getTransactionCount(deployer.address)
    let nonceOffset = 0;
    function getNonce() {
        return baseNonce.then((nonce:number) => (nonce + (nonceOffset++)));
    }

    const wlString:string = fs.readFileSync(whitelist).toString()
    const wlArray:string[] = wlString.split("\n").map((s:string) => s.trim())

    console.log("Adding addresses")

    function sliceIntoChunks(arr: string[], chunkSize: number) {
        const res = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            const chunk = arr.slice(i, i + chunkSize);
            res.push(chunk);
        }
        return res;
    }

    const chunkSize = 10
    for (let chunk of sliceIntoChunks(wlArray, chunkSize)) {
        console.log(chunk)
        const tx = await nftCrowdsale.addBatchAddress(chunk, {nonce: getNonce()})
        await tx.wait()
    }

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
        const tx = await nft.transferFromBatch(deployer.address, nftCrowdsale.address, ownTokenIds, {nonce: getNonce()})
        await tx.wait()
    }
    while (true)

    console.log(await nft.balanceOf(nftCrowdsale.address))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
});