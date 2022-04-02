import { deployContracts } from "./deploy";
import { DeployedContract, OverridedAddresses } from './types'
import * as fs from 'fs';
import { IAddresses } from '../src/helpers/state'

const addressesFile = `../src/static/addresses.json`

const mimDeployedContract:string = ''
const lpDeployedContract:string = ''

const overrideAddressesTestnet:OverridedAddresses = {
    mim: '0x2a51299e55a816cdb4d20fc80da673359ac587a1', // TESTNET DAI stablecoin
    ftm: '0x15c34d8b356f21112c07ca1811d84101f480a3f1' // TESTNET wFtm
}

const overrideAddressesMainnet:OverridedAddresses = {
    egis: '',
    aegis: '',
    treasury: '',
    staking: '',
    mim: '',
    mimBond: '',
    mimEgisReserve: '',
    mimEgisBond: '',
    bondingCalculator: '',
    nft: '',
    crowdsale: '',
    nftCrowdsale: '',
    auction: [''],
    ftm: ''
}

async function main() {

    // if (mimDeployedContract === '' && lpDeployedContract === '') {
    //     // throw new Error("Deployed MIM or LP contracts addresses are empty");
    // } else {
    //     const mim = await ethers.getContractAt('MagicInternetMoneyV1', mimDeployedContract)
    //     const lp = await ethers.getContractAt('UniswapV2Pair', lpDeployedContract)
    // }

    const DC:DeployedContract = await deployContracts({
        // overrideAddresses: overrideAddressesTestnet,
        production: true,
        mintNFT: false,
        mintTreasury: false
        // deployMIMParams: {
        //     mim: mim,
        //     lp: lp
        // }
    })

    const out: IAddresses = {
        egis: DC.egis.address,
        aegis: DC.aegis.address,
        treasury: DC.treasury.address,
        staking: DC.staking.address,
        mim: {
            reserve: DC.mim.address, 
            bond: DC.mimBond.address,     
        },
        mimEgis: {
            reserve: DC.lp.address, 
            bond: DC.lpBond.address,  
        },
        bondingCalculator: DC.calculator.address,
        nft: DC.nft.address,
        crowdsale: DC.crowdsale.address,
        nftCrowdsale: DC.nftCrowdsale.address,
        auction: [DC.auction.address],
        refundFtm: DC.refundFtm.address,
        refundDai: DC.refundDai.address,
        ftm: DC.ftm.address,
        rpc: "http://127.0.0.1:7545",
        chainId: 1337
    }

    const str = JSON.stringify(out, null, 4)
    console.log( "All Addresses: " + str);

    // write JSON string to a file
    fs.writeFileSync(addressesFile, str, 'utf8')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});
