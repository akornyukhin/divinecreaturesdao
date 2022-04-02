import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import {
    DivineCreature,
    DivineCreature__factory, 
    NFTCrowdsale__factory} from '../../src/typechain'
import { deployContracts } from '../deploy';
import { NonceManager } from "@ethersproject/experimental";
import axios from 'axios'

const fs = require('fs');

const multiSigSaveAddress = '0x0Bc9455347598c51D0d605aeBE316Af41df94FfC'
const wFtmAddress = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'

const openTime = ''
const endTime = ''

const listFile = '' // use file with array of IDs to burn
const toBurn = []  // or use array of IDs

async function main() {
    
    const [deployer]: SignerWithAddress[] = await ethers.getSigners()

    const nft = DivineCreature__factory.connect('', deployer)
    const nftCrowdsale = await (new NFTCrowdsale__factory(deployer).deploy(deployer.address, multiSigSaveAddress, wFtmAddress, openTime, endTime))
    
    const nonceManager = new NonceManager(deployer)
    nonceManager.setTransactionCount(1)

    let baseNonce = ethers.provider.getTransactionCount(deployer.address)
    let nonceOffset = 0;
    function getNonce() {
        return baseNonce.then((nonce:number) => (nonce + (nonceOffset++)));
    }

    function sliceIntoChunks(arr: string[], chunkSize: number) {
        const res = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            const chunk = arr.slice(i, i + chunkSize);
            res.push(chunk);
        }
        return res;
    }

    console.log("STARTING BURN")
    const batchSize = 5
    for (let chunk of sliceIntoChunks(toBurn, batchSize)) { 
        console.log("Burning chunk: %s", chunk)
        const tx = await nft.burnBatch(chunk)
        tx.wait()
    }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
});