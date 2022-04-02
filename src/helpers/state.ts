import { BigNumber, ethers } from "ethers"
import addresses from '../static/addresses.json'
import {
    Auction,
    Auction__factory,
    BondCalculator,
    BondCalculator__factory,
    BondDepository,
    BondDepository__factory,
    Crowdsale,
    Crowdsale__factory,
    DivineCreature,
    DivineCreature__factory,
    IaEgis,
    IaEgis__factory, IEgis, IEgis__factory, IERC20, IERC20__factory,
    ITreasury,
    ITreasury__factory,
    IUniswapV2Pair,
    IUniswapV2Pair__factory,
    MagicInternetMoneyV1,
    MagicInternetMoneyV1__factory,
    NFTCrowdsale,
    NFTCrowdsale__factory,
    Staking,
    Staking__factory,
} from "../typechain"

export interface IBondAccounts {
    readonly reserve: string
    readonly bond: string
}

export interface IAddresses {
    readonly egis: string
    readonly aegis: string
    readonly treasury: string
    readonly staking: string,
    readonly mim: IBondAccounts
    readonly mimEgis: IBondAccounts
    readonly bondingCalculator: string
    readonly nft: string
    readonly crowdsale: string
    readonly nftCrowdsale: string
    readonly auction: string[]
    readonly ftm: string
    readonly rpc: string
    readonly chainId: number
    readonly refundFtm: string
    readonly refundDai: string
}

export interface IStableBondContracts {
    readonly bond: BondDepository
    readonly reserve: MagicInternetMoneyV1
    readonly tokensInStrategy: string
}

export interface ILpBondContracts {
    readonly bond: BondDepository
    readonly reserve: IUniswapV2Pair
    readonly bondingCalculator: BondCalculator
    readonly lpUrl: string
}

export interface IContracts {
    readonly egis: IEgis
    readonly aegis: IaEgis
    readonly treasury: ITreasury
    readonly staking: Staking
    readonly mim: IStableBondContracts
    readonly mimEgis: ILpBondContracts
    readonly nft: DivineCreature
    readonly crowdsale: Crowdsale
    readonly nftCrowdsale: NFTCrowdsale
    readonly auction: Auction[]
    readonly ftm: IERC20
    readonly chainID: number
}

export const loadedAddresses: IAddresses = addresses

export const createContracts = (provider: ethers.providers.Provider | ethers.Signer, addressOverrides?: IAddresses): IContracts => {
    const addresses = addressOverrides ?? loadedAddresses
    return {
        egis: IEgis__factory.connect(addresses.egis, provider),
        aegis: IaEgis__factory.connect(addresses.aegis, provider),
        treasury: ITreasury__factory.connect(addresses.treasury, provider),
        staking: Staking__factory.connect(addresses.staking, provider),
        mim: {
            bond: BondDepository__factory.connect(addresses.mim.bond, provider),
            reserve: MagicInternetMoneyV1__factory.connect(addresses.mim.reserve, provider),
            tokensInStrategy: "60500000000000000000000000"
        },
        mimEgis: {
            bond: BondDepository__factory.connect(addresses.mimEgis.bond, provider),
            reserve: IUniswapV2Pair__factory.connect(addresses.mimEgis.reserve, provider),
            bondingCalculator: BondCalculator__factory.connect(addresses.bondingCalculator, provider),
            lpUrl: "https://www.traderjoexyz.com/#/pool/0x130966628846BFd36ff31a822705796e8cb8C18D/0xb54f16fB19478766A268F172C9480f8da1a7c9C3",
        },
        nft: DivineCreature__factory.connect(addresses.nft, provider),
        crowdsale: Crowdsale__factory.connect(addresses.crowdsale, provider),
        nftCrowdsale: NFTCrowdsale__factory.connect(addresses.nftCrowdsale, provider),
        auction: addresses.auction.map(auction => Auction__factory.connect(auction, provider)),
        ftm: IERC20__factory.connect(addresses.ftm, provider),
        chainID: addresses.chainId
    }
}

export const adjustDecimals = (v: BigNumber, decimals: number) => v.div(BigNumber.from(10).pow(decimals)).toNumber()
export const addDecimals = (v: Number, decimals: number) => BigNumber.from(v).mul(BigNumber.from(10).pow(decimals))

export const mintNft = async (nft: DivineCreature, to: string, quality_: ethers.BigNumberish, uri: string): Promise<number> => {
    const transaction = await nft.safeMint(to, quality_, uri)
    const receipt = await transaction.wait()
    return (receipt.events ?? []).filter(e => e.event === "Transfer")[0].args![2].toNumber()
}

export const buyNftCrowdsale = async (nftCrowdsale: NFTCrowdsale, to: string): Promise<number> => {
    const transaction = await nftCrowdsale.buyNFT(to, await nftCrowdsale.nftPrice())
    const receipt = await transaction.wait()
    return (receipt.events ?? []).filter(e => e.event === "NFTPurchased")[0].args![2].toNumber()
}
