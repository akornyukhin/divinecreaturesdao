import { ethers, waffle } from 'hardhat'
import { BigNumberish, ContractFactory } from 'ethers'
import { DeployedContract } from './types'
import {
    DeployValues,
    DeployMimParams,
 } from './types'
import {
    Egis__factory,
    AEgis__factory,
    MagicInternetMoneyV1__factory,
    Treasury__factory,
    BondDepository__factory,
    BondCalculator__factory,
    UniswapV2Pair__factory,
    BlessingHub__factory,
    DivineCreature__factory,
    Distributor__factory,
    MockBandMover__factory,
    Staking__factory,
    Crowdsale__factory,
    NFTCrowdsale__factory,
    Auction__factory,
    DivineCreature,
    FundsReturn__factory
} from "../src/typechain"

const rates: BigNumberish[] = [ 5400, 5535, 5670, 5805, 5940, 6075, 6210, 6345, 6480, 6615, 6750 ]
const rateBase = 1_000_000

// Unix time first epoch occurs
const firstEpochTime = Math.round(Date.now() / 1000) + 35

export async function deployContracts({
    production=false,
    mintTreasury=false,
    mintNFT=false,
    epochLength=60,
    deployMIMParams,
    initialStackingIndex=0,
    contractEpochTime=firstEpochTime,
    overrideAddresses={}
}:DeployValues):Promise<DeployedContract> {

    // Deployer and MockDAO adddresses
    const [deployer, signer] = await ethers.getSigners()
    // Initial MIM amount
    const mimAmount = '10000000000000000000000000'
    // Large number for approval for MIM
    const largeApproval = '100000000000000000000000000000000'
    // Ethereum 0 address, used when toggling changes in treasury
    const zeroAddress = '0x0000000000000000000000000000000000000000'
    // Initial EGIS amount
    const egisAmount = '10000000000000000'
    // Initial LP amount
    const lpAmount = '500000000000000000000000'
    // MIM bond BCV. Variable for Bond price scaling
    const mimBondBCV = '369'
    // MIM LP bond BCV. Variable for Bond price scaling
    const minLPBondBCV = '50000'
    // Bond vesting length in seconds. 60 = 1 minute. For testing purpose only
    const bondVestingLength = '10'
    // Min bond price (5000 = 5)
    const minBondPrice = '2000'
    // Min bond price (5000 = 5)
    const minLPBondPrice = '2000'
    // Max bond payout. 1000 = 1%
    const maxBondPayout = '1000'
    // MIM fee for bond. 100 = 1%
    const bondFee = '100'
    // Max debt bond can take on
    const maxBondDebt = '100000000000000000000000000'
    // Auction length
    // const auctionLength = 300
    // Global Auction End Time
    // const globalAuctionEndTime = 300(await firstSigner.provider.getBlock()).timestamp() + auctionLength
    // Global Auction End Time
    // const globalAuctionEndTime = 1643644799

    const init = async () => {
        // Deploy MIM
        const mim = await initContract(MagicInternetMoneyV1__factory,overrideAddresses.mim!)
        // overrideAddresses.mim?.length! > 0 ?
        //         (MagicInternetMoneyV1__factory.connect(overrideAddresses.mim!,deployer)):
        //         (await (new MagicInternetMoneyV1__factory(deployer).deploy()))
        // Deploy 10,000,000 mock MIM
        if (mintTreasury) {
            await mim.mint(deployer.address, mimAmount)
        }

        // await mim.mint(deployer.address, mimAmount)

        const lp = await initContract(UniswapV2Pair__factory,overrideAddresses.mimEgisReserve!,egis.address, mim.address, egisAmount, mimAmount, 0)
        // overrideAddresses.mimEgisReserve?.length! > 0 ?
        //         (UniswapV2Pair__factory.connect(overrideAddresses.mimEgisReserve!,deployer)):
        //         (await (new UniswapV2Pair__factory(deployer).deploy(egis.address, mim.address, egisAmount, mimAmount, 0)))
        // Deploy 500,000 mock LP
        // console.log("TRYING TO MINT LP")
        if (mintTreasury) {
            await lp.mint(deployer.address, lpAmount)
        }

        const ftm = await initContract(MagicInternetMoneyV1__factory, overrideAddresses.ftm!)

        return { mim, lp, ftm }
    }

    const initMintNFT= async (nft:DivineCreature) => {
        const firstQualityArr:string[] = [
            'QmefhQYshP4XvMvsub9dg4exKDfzEp8iM5pZJbcgu6DvPp',
            'QmbgZ3pksNQD5YxRWRXzBBuXWQPnHgouTxXDjKTGSZaUaW',
            'QmPdpfW9iyKYniWSTZNyJFebhenbSpTRNbNgEjZ87ypfj1']
        const secondQualityArr:string[] = [
            'QmU2pjnx75jxbbFWQ32HwcpuumT5z4AphEkypCMKLr8SPn'
        ]
        const thirdQualityArr:string[] = [
            'QmbZiAtNQ1mrjD79YH1o6cm83QukVbcutZGTBwx8M695KB'
        ]
        await nft.safeMintBatch(deployer.address,1,firstQualityArr)
        await nft.safeMintBatch(deployer.address,2,secondQualityArr)
        await nft.safeMintBatch(deployer.address,3,thirdQualityArr)
    }

    const initContract = async (factory:any,overrideAddress:string|string[]|undefined,...args:any[]):Promise<any> => {
        const contract = overrideAddress?.length! > 0 ?
            (await factory.connect(overrideAddress,deployer)) :
            (await (new factory(deployer).deploy(...args)))
        return contract;
    }


    // Deploy EGIS
    // console.log("Deploying EGIS")
    const egis = await initContract(Egis__factory, overrideAddresses.egis!)

    // Deploy aEgis
    // console.log("Deploying AEGIS")
    const aegis = await initContract(AEgis__factory,overrideAddresses.aegis!)

    // Deploy NFT contractc
    // console.log("Deploying NFT")
    const nft = await initContract(DivineCreature__factory,overrideAddresses.nft!)
    if (mintNFT) {
        initMintNFT(nft)
    }

    // Deploy Blessing Hub
    // console.log("Deploying Blessing Hub")
    const blessingHub = await (new BlessingHub__factory(deployer)
        .deploy(aegis.address, nft.address, 11, [0, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250]))

    // Adding blessable
    // console.log("Adding blessable")
    if (production) {
        await nft.addBlessable(blessingHub.address)
    }

    // Deploy mockBandMover
    const mockBandMover = await (new MockBandMover__factory(deployer).deploy())
    const blessingHub2 = await (new BlessingHub__factory(deployer)
        .deploy(mockBandMover.address, nft.address, 11, [0, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250]))
    await nft.addBlessable(blessingHub2.address)

    // console.log("Deploying BondCalculator")
    const calculator = await initContract(BondCalculator__factory,overrideAddresses.bondingCalculator!,egis.address)

    const { mim, lp, ftm } : DeployMimParams = deployMIMParams ?? (await init())

    // Deploy Treasury
    // console.log("Deploying Treasury")
    const treasury = await initContract(Treasury__factory, overrideAddresses.treasury!, egis.address, mim.address, 0, 0)

    // console.log("Deploying DAI Bond")
    const mimBond = await initContract(BondDepository__factory, overrideAddresses.mimBond!, egis.address, mim.address, treasury.address, deployer.address, zeroAddress)

    // console.log("Deploying LP Bond")
    const lpBond = await initContract(BondDepository__factory,overrideAddresses.mimEgisBond!,egis.address, lp.address, treasury.address, deployer.address, calculator.address)

    // Deploy Staking
    // console.log("Deploying Staking")
    const staking = await initContract(Staking__factory,overrideAddresses.staking!,egis.address, aegis.address, epochLength, "0", contractEpochTime)

    // Deploy Staking Distributor
    // console.log("Deploying Distributor")
    const distributor = await (new Distributor__factory(deployer).deploy(treasury.address, egis.address, epochLength, contractEpochTime))

    // Configuring Treasury
    if (production) {
        // console.log("Configuring Treasury")
        // console.log("===Deployer depositor===")
        await treasury.queue('0', deployer.address)
        await treasury.toggle('0', deployer.address, zeroAddress)
        // // console.log("===Reward manager===")
        await treasury.queue('8', distributor.address);
        await treasury.toggle('8', distributor.address, zeroAddress);
        // console.log("===LP token===")
        await treasury.queue('5', lp.address)
        await treasury.toggle('5', lp.address, calculator.address)
        // console.log("===LP Bond===")
        await treasury.queue('4', lpBond.address)
        await treasury.toggle('4', lpBond.address, calculator.address)
    }

    // Configuring Staking
    // console.log("Configuring Staking")
    await staking.setDistributor(distributor.address)
    await distributor.addRecipient(staking.address)

    // Initilize aEgis
    if (overrideAddresses.aegis?.length === 0 || overrideAddresses.aegis === undefined) {
        await aegis.initialize(staking.address, rateBase, rates)
    }

    if (overrideAddresses.mimBond?.length === 0 || overrideAddresses.mimBond === undefined) {
        // await mimBond.initializeBondTerms(mimBondBCV, minBondPrice, maxBondPayout, bondFee, maxBondDebt, bondVestingLength)
        await mimBond.setDiscountMaster(blessingHub.address)

        if (production) {
            await treasury.queue('0', mimBond.address)
            await treasury.toggle('0', mimBond.address, zeroAddress)
        }
    }

    // Approve the treasury to spend MIM
    await mim.approve(treasury.address, largeApproval)
    // Set treasury for EGIS token
    await egis.setVault(treasury.address)

    if (mintTreasury) {
        if (overrideAddresses.treasury?.length === 0 || overrideAddresses.treasury === undefined) {
            // queue and toggle deployer reserve depositor
            await treasury.queue('0', deployer.address)
            await treasury.toggle('0', deployer.address, zeroAddress)
            await treasury.deposit('9000000000000000000000000', mim.address, '80000000000000000')
        }
    }

    const openTime = Math.ceil(Date.now() / 1000) + 3000000
    const closeTime = openTime + 900000

    // console.log("Deploying Sale utils")
    const crowdsale = await initContract(Crowdsale__factory,overrideAddresses.crowdsale!, 1, deployer.address, mim.address, egis.address, openTime, closeTime)

    await egis.approve(crowdsale.address, largeApproval )

    const nftCrowdsale = await initContract(NFTCrowdsale__factory,overrideAddresses.nftCrowdsale!,deployer.address, mim.address, nft.address, openTime, closeTime)

    const auction = await initContract(Auction__factory,overrideAddresses.auction?.[0]!,deployer.address, mim.address, nft.address)

    const refundFtm = await (new FundsReturn__factory(deployer).deploy('0x0Bc9455347598c51D0d605aeBE316Af41df94FfC', ftm.address))
    const refundDai = await (new FundsReturn__factory(deployer).deploy('0x0Bc9455347598c51D0d605aeBE316Af41df94FfC', mim.address))

    const deployedValues:DeployedContract = {
        treasury,
        egis,
        aegis,
        nft,
        blessingHub,
        blessingHub2,
        mockBandMover,
        mim,
        distributor,
        staking,
        firstSigner: deployer,
        secondSigner: signer,
        mimAmount,
        largeApproval,
        zeroAddress,
        initialStackingIndex,
        contractEpochTime,
        mimBond,
        lpBond,
        calculator,
        lp,
        egisAmount,
        lpAmount,
        mimBondBCV,
        minLPBondBCV,
        bondVestingLength,
        minBondPrice,
        minLPBondPrice,
        maxBondPayout,
        bondFee,
        maxBondDebt,
        crowdsale,
        nftCrowdsale,
        auction,
        ftm,
        refundFtm,
        refundDai
    }

    return deployedValues
}
