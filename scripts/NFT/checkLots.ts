import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import * as fs from 'fs'
import {
    DivineCreature,
    DivineCreature__factory,
    Auction,
    Auction__factory } from '../../src/typechain'

var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

const addresses = {
    nft: '0xD6D5A37C7CBd401210B8Aa81133966Ca9B9236E8',
    auction: '0xEe87b523A432A2d813343384D3cf500AD35C762f',
    godAuction: '0x380ce5238C4742398Cc1b1A7c516C0D51C98E5a7'

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

const csvFile = '../src/static/aucStat.csv'
const godCsvFile = '../src/static/godStat.csv'

const lots = new Map<number, number>()

async function checkLoop(csvFile:any,auction:Auction,nft:DivineCreature) {
    fs.writeFileSync(csvFile,'')
    const headerStr = 'lotID,tokenID,aucEnded,highestBidder,highestBid,startTime,endTime,endTimePassed,currentOwner\n'
    fs.appendFileSync(csvFile, headerStr)
    const auctionLength = (await auction.auctionLength()).toNumber()
    for (let i = 0; i < (auctionLength-1); i++) { 
        try {
            const aucData = await auction.auctionLots(i)
            if (!aucData[6]) {
                lots.set(i,aucData[1].toNumber())
            }
            // if (!(aucData[6] && aucData[0] === "0x0000000000000000000000000000000000000000")) {
                const now = dayjs.unix(Math.ceil((new Date().getTime()) / 1000))
                const nftOwner = await nft.ownerOf(aucData[1])
                const hDateStart = (dayjs.unix(aucData[2])).format('YYYY-MM-DD HH:mm:ss')
                const hDateEnd = (dayjs.unix(aucData[3])).format('YYYY-MM-DD HH:mm:ss')
                const endTimePassed = (now).isAfter(dayjs.unix(aucData[3])) ? true : false
                let highestBid:any
                if (aucData[0] === '0x0000000000000000000000000000000000000000' && !aucData[6]) {
                    highestBid = `0\\${aucData[4].div(ethers.BigNumber.from(10).pow(18))}`
                } else {
                    highestBid = (aucData[4].div(ethers.BigNumber.from(10).pow(18)))
                }
                const templatedStr = `${i},${aucData[1]},${aucData[6]},${aucData[0]},${highestBid},${hDateStart},${hDateEnd},${endTimePassed},${nftOwner}\n`
                fs.appendFileSync(csvFile, templatedStr)
            // }
        
        } catch (e) {
            console.log(e)
            break;
        }
    }


}

async function main() {

    console.log("START")
    const [deployer]:SignerWithAddress[] = await ethers.getSigners()

    const nft = DivineCreature__factory.connect(addresses.nft, deployer)
    const auction = Auction__factory.connect(addresses.auction, deployer)
    const god = Auction__factory.connect(addresses.godAuction, deployer)

    await checkLoop(csvFile,auction,nft) // Checking OLD auction 
    await checkLoop(godCsvFile,god,nft)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
});