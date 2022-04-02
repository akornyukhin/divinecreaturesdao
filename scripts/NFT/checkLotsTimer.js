const { ethers } = require("ethers");
const TelegramBot = require('node-telegram-bot-api')

const telegramToken = ''
const bot = new TelegramBot(telegramToken, {polling: true});
const chatID = []

const addresses = {
  auction: '0xEe87b523A432A2d813343384D3cf500AD35C762f',
  godAuction: '0x380ce5238C4742398Cc1b1A7c516C0D51C98E5a7',
}

const walletPrivateKey = ''

const RPC_URL = 'https://rpc.ftm.tools/'

const auctionABI = '[ { "inputs": [ { "internalType": "address", "name": "_beneficiary", "type": "address" }, { "internalType": "address", "name": "_ftm", "type": "address" }, { "internalType": "address", "name": "_divineCreatures", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "lotId", "type": "uint256" } ], "name": "AuctionEndedNoBidder", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "lotId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "AuctionEndedRetrieve", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "lotId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "winner", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "AuctionEndedSuccess", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "lotId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "newEndTime", "type": "uint256" } ], "name": "AuctionExtended", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "lotId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bidder", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "FundsWithdrawFailed", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "lotId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bidder", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "FundsWithdrawn", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "lotId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "bidder", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "HighestBidIncreased", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "lotId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "updateIncrement", "type": "uint256" } ], "name": "LotIncrementUpdated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "startPrice", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "openTime", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "auctionLength", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "minIncrement", "type": "uint256" } ], "name": "LotPlaced", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "lotId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "updatePrice", "type": "uint256" } ], "name": "LotStartPriceUpdated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [ { "internalType": "uint256", "name": "lotId", "type": "uint256" }, { "internalType": "bool", "name": "_force", "type": "bool" } ], "name": "auctionEnd", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "auctionLength", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "auctionLots", "outputs": [ { "internalType": "address", "name": "highestBidder", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "uint256", "name": "localOpenTime", "type": "uint256" }, { "internalType": "uint256", "name": "localAuctionEndTime", "type": "uint256" }, { "internalType": "uint256", "name": "highestBid", "type": "uint256" }, { "internalType": "uint256", "name": "minIncrement", "type": "uint256" }, { "internalType": "bool", "name": "ended", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "tokenIds", "type": "uint256[]" }, { "internalType": "uint256", "name": "_startPrice", "type": "uint256" }, { "internalType": "uint256", "name": "_openTime", "type": "uint256" }, { "internalType": "uint256", "name": "_auctionLength", "type": "uint256" }, { "internalType": "uint256", "name": "_minIncrement", "type": "uint256" } ], "name": "batchPlaceLot", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "lotIds", "type": "uint256[]" }, { "internalType": "address", "name": "_addressTo", "type": "address" } ], "name": "batchRetrieveLot", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "lotIds", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "minIncrements", "type": "uint256[]" } ], "name": "batchUpdateLot", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "beneficiary", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "lotId", "type": "uint256" }, { "internalType": "uint256", "name": "bidAmount", "type": "uint256" } ], "name": "bid", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "divineCreatures", "outputs": [ { "internalType": "contract IERC721Enumerable", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "ftm", "outputs": [ { "internalType": "contract IERC20WithDecimals", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "lotId", "type": "uint256" }, { "internalType": "address", "name": "address_", "type": "address" } ], "name": "pendingReturnsFor", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_tokenId", "type": "uint256" }, { "internalType": "uint256", "name": "_startPrice", "type": "uint256" }, { "internalType": "uint256", "name": "_openTime", "type": "uint256" }, { "internalType": "uint256", "name": "_auctionLength", "type": "uint256" }, { "internalType": "uint256", "name": "_minIncrement", "type": "uint256" } ], "name": "placeLot", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "lotId", "type": "uint256" }, { "internalType": "address", "name": "_addressTo", "type": "address" } ], "name": "retrieveLot", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_divineCreatures", "type": "address" } ], "name": "setDevineCreature", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_lotId", "type": "uint256" }, { "internalType": "uint256", "name": "_minIncrement", "type": "uint256" } ], "name": "updateLotIncrement", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_lotId", "type": "uint256" }, { "internalType": "uint256", "name": "_startPrice", "type": "uint256" } ], "name": "updateLotMinPrice", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "lotId", "type": "uint256" } ], "name": "withdrawFunds", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]'

async function sendToChats(bot,chatIDs,message) {
  for (let chat of chatIDs) {
    // console.log("CHAT ID: %s",chat)
    try { 
      await bot.sendMessage(chat,message)
    } catch (e) {
      console.log("ERROR SENDING: %s",e)
    }
  }
}

async function main() {
    const walletFromPriv = new ethers.Wallet(walletPrivateKey)
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
    
    const wallet = walletFromPriv.connect(provider)
    
    const auctionCont = new ethers.Contract(addresses.godAuction,auctionABI,wallet)

    const date = new Date()

    const auctionLength = auctionCont.auctionLength()

    let lotsArray = []

    for (let lotID = 0; lotID < (auctionLength - 1); lotID++) { 
      try {
        const lot = await auctionCont.auctionLots(lotID)
        if (!lot[6]) {
          const now = Math.ceil(date.getTime() / 1000)
          if (now > lot[3]) {
            let lotsObj = {}
            const endDate = new Date(lot[3]*1000)
            lotsObj['lotID'] = lotID
            lotsObj['tokenID'] = lot[1].toNumber()
            lotsObj['endTime'] = endDate.toUTCString()
            lotsObj['highestBidder'] = lot[0]
            lotsArray.push(lotsObj)
          }
        }
      } catch (e) {
        console.log(e)
        break
      }
    }


    let message = 'List of ended lots:\n'
    if (lotsArray.length > 0) {
      for (let ll of lotsArray) {
        message += `----------------------\nLot ID: ${ll['lotID']}\nToken ID: ${ll['tokenID']}\nHighest Bidder: ${ll['highestBidder']}\nEnd Time: ${ll['endTime']}\n`
      }
      await sendToChats(bot,chatID,message)
    } else {
      message += 'Empty'
      // await sendToChats(bot,chatID,message)
    }

    
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
});