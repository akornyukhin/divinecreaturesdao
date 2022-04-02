import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import * as fs from 'fs'
import {
    DivineCreature,
    DivineCreature__factory } from '../../src/typechain'

const addresses = {
    nft: '0xD6D5A37C7CBd401210B8Aa81133966Ca9B9236E8'

}

const csvFile = './nftOwners.csv'

async function checkLoop(csvFile:any,nft:DivineCreature) {
    fs.writeFileSync(csvFile,'')
    const headerStr = 'tokenID,currentOwner,quality\n'
    fs.appendFileSync(csvFile, headerStr)

    const nftTotalSupply = (await nft.totalSupply()).toNumber()

    console.log(`Total number of NFT: ${nftTotalSupply}`)
    
    for (let i = 0; i < 1000; i++) { 

        console.log("Processing %s token", i)
        try {
            const nftOwner = await nft.ownerOf(i)
            const nftQuality = await nft.quality(i)

            const templatedStr = `${i},${nftOwner},${nftQuality}\n`
            fs.appendFileSync(csvFile, templatedStr)
        
        } catch (e) {
            // console.log(e)
            // break;
        }
    }
}

async function main() {

    console.log("START")
    const [deployer]:SignerWithAddress[] = await ethers.getSigners()

    const nft = DivineCreature__factory.connect(addresses.nft, deployer)

    await checkLoop(csvFile,nft)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
});