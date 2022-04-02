import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { DivineCreature__factory } from '../../src/typechain'
import { NonceManager } from "@ethersproject/experimental";

const fs = require('fs');

const nftJson = "/mnt/c/Users/ommzzZ/git/Valhalla/scripts/CSVs/wl_json.csv"

const addresses = {
    nft: '0xD6D5A37C7CBd401210B8Aa81133966Ca9B9236E8'
}

async function main() {

    console.log("START")
    
    const [deployer]: SignerWithAddress[] = await ethers.getSigners()
    // const nft = await new DivineCreature__factory(deployer).deploy()
    const nft = DivineCreature__factory.connect(addresses.nft, deployer)

    console.log('NFT address: %s', nft.address)

    let baseNonce = ethers.provider.getTransactionCount(deployer.address)
    let nonceOffset = 0;

    const nonceManager = new NonceManager(deployer)
    nonceManager.setTransactionCount(1)

    function getNonce() {
        return baseNonce.then((nonce:number) => (nonce + (nonceOffset++)));
    }

    const jsonStr:string = fs.readFileSync(nftJson).toString()
    const nftsToMint:string[] = jsonStr.split("\n").map((s:string) => s.trim())
    const arr = nftsToMint
    function sliceIntoChunks(arr: string[], chunkSize: number) {
        const res = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            const chunk = arr.slice(i, i + chunkSize);
            res.push(chunk);
        }
        return res;
    }

    console.log("Minting NFTs")
    const chunkSize = 10
    for (let chunk of sliceIntoChunks(arr, chunkSize)) {
        console.log(chunk)
        const tx = await nft.safeMintBatch(deployer.address, 1, chunk, {nonce: getNonce()})
        await tx.wait()
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
});