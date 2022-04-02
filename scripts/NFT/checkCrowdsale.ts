import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import * as fs from 'fs'
import {
    DivineCreature__factory,
    NFTCrowdsale__factory } from '../../src/typechain'

const csvFile = '../src/static/crowdsaleStat.csv'

const addresses = {
    nft: '0xD6D5A37C7CBd401210B8Aa81133966Ca9B9236E8',
    crowdsale: '0x06E476535716ee6c574FeB09D086E1B3dF9E8eB0'
}

async function main() {

    console.log("START")
    const [deployer]:SignerWithAddress[] = await ethers.getSigners()

    const nft = DivineCreature__factory.connect(addresses.nft, deployer)
    const crowdsale = NFTCrowdsale__factory.connect(addresses.crowdsale,deployer)
    
    fs.writeFileSync(csvFile,'')
    const headerStr = 'tokenID,currentOwner\n'
    fs.appendFileSync(csvFile, headerStr)

    const buyers = await crowdsale.buyersAddresses()

    for (let address of buyers) {
        try {
            const tokenId = await nft.tokenOfOwnerByIndex(address, 0)
            const templatedStr = `${tokenId},${address}\n`
            fs.appendFileSync(csvFile, templatedStr)
        } catch (e) {
            console.log(e)
        }
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
});