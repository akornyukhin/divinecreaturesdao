import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
    Egis,
    AEgis,
    MagicInternetMoneyV1,
    Treasury,
    Distributor,
    Staking,
    BondDepository,
    BondCalculator,
    UniswapV2Pair,
    DivineCreature,
    BlessingHub,
    MockBandMover,
    Crowdsale,
    NFTCrowdsale,
    Auction,
    IERC20,
    FundsReturn
} from "../src/typechain"

export interface DeployMimParams {
    mim: MagicInternetMoneyV1
    lp: UniswapV2Pair
    ftm: IERC20
}

export type OverridedAddresses = {
    egis?: string,
    aegis?: string,
    treasury?: string,
    staking?: string,
    mim?: string,
    mimBond?: string,
    mimEgisReserve?: string,
    mimEgisBond?: string,
    bondingCalculator?: string,
    nft?: string,
    crowdsale?: string,
    nftCrowdsale?: string,
    auction?: string[],
    ftm?: string,
}

export interface DeployValues {
    contractType?: string,
    epochLength?: number,
    deployToProd?: boolean,
    initialStackingIndex?: number,
    contractEpochTime?: number,
    deployMIMParams?: DeployMimParams,
    mintTreasury?: boolean,
    production?: boolean,
    mintNFT?: boolean,
    overrideAddresses?: OverridedAddresses
}

export type DeployedContract = {
    treasury: Treasury,
    egis: Egis,
    aegis: AEgis,
    mockBandMover: MockBandMover,
    nft: DivineCreature,
    blessingHub: BlessingHub,
    blessingHub2: BlessingHub,
    mim: MagicInternetMoneyV1,
    distributor: Distributor,
    staking: Staking,
    lp: UniswapV2Pair,
    calculator: BondCalculator,
    lpBond: BondDepository,
    mimBond: BondDepository,
    firstSigner: SignerWithAddress,
    secondSigner: SignerWithAddress,
    mimAmount: string,
    largeApproval: string,
    zeroAddress: string,
    initialStackingIndex: number,
    contractEpochTime: number,
    egisAmount: string,
    lpAmount: string,
    mimBondBCV: string,
    minLPBondBCV: string,
    bondVestingLength: string,
    minBondPrice: string,
    minLPBondPrice: string,
    maxBondPayout: string,
    bondFee: string,
    maxBondDebt: string,
    crowdsale: Crowdsale,
    nftCrowdsale: NFTCrowdsale,
    refundFtm: FundsReturn,
    refundDai: FundsReturn,
    auction: Auction,
    ftm: IERC20
}
