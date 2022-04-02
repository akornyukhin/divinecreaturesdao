import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "ethers";
import { IContracts, ILpBondContracts, IStableBondContracts } from "./state";
import { IEgis, ITreasury} from "../typechain";
import { loadTokenPrices } from "./token-price";

export interface IMetrics {
	price: number
	marketCap: number
	stakingTVL: number
	stakingAPY: number
	fiveDayRate: Number
	currentIndex: Number
	currentBlock: Number
	currentBlockTime: number
	treasuryBalance: BigNumber
	treasuryDebt: BigNumber
	runway: Number
	nextRebase: number
	stakingRebase: number
}

export const getMarketPrice = async (contracts: IContracts): Promise<BigNumber> => {
    const reserves = await contracts.mimEgis.reserve.getReserves()
    return reserves[0].div(reserves[1])
}

export const getStableTreasuryBalance =  async (treasury: ITreasury, bondContracts: IStableBondContracts) => {
	let tokenAmount = await bondContracts.reserve.balanceOf(treasury.address)
	return tokenAmount.add(BigNumber.from(bondContracts.tokensInStrategy)).div(BigNumber.from(10).pow(18));
}

export const getLpTreasuryBalance =  async (treasury: ITreasury, bondContracts: ILpBondContracts) => {
	const tokenAmount = await bondContracts.reserve.balanceOf(treasury.address)
	const valuation = await bondContracts.bondingCalculator.valuation(bondContracts.reserve.address, tokenAmount)
	const markdown = await bondContracts.bondingCalculator.markdown(bondContracts.reserve.address);
	const tokenUSD = (valuation.div(BigNumber.from(10).pow(9))).mul(markdown.div(BigNumber.from(10).pow(18)));

	return tokenUSD;
}

export const getLpReserves = async (egis: IEgis, bondContracts: ILpBondContracts) => {
	const reserves = await bondContracts.reserve.getReserves();
	const needFlip = (await bondContracts.reserve.token0()).toLowerCase() === egis.address.toLowerCase();
	if (needFlip) {
		[...reserves].reverse()
	}
	const [tokenReserve, timeReserve] = reserves

	return [tokenReserve.div(BigNumber.from(10).pow(18)), timeReserve.div(BigNumber.from(10).pow(9))]
}

export const loadState = async(contracts: IContracts, provider: ethers.providers.Provider): Promise<IMetrics> => {
	// await loadTokenPrices() // TODO: uncomment

	const mimPrice = 1 // getTokenPrice("MIM"); // TODO: uncomment
	const currentBlock = await provider.getBlockNumber();
	const currentBlockTime = (await provider.getBlock(currentBlock)).timestamp;

	const price = 1 //getTokenPrice("HEC") // EGIS Prics from coingecko // TODO: uncomment
	// const marketPrice = (await getMarketPrice(contracts)).div(BigNumber.from(10).pow(9)).mul(mimPrice); // This crashes node, didn't have time to fix, sorry :(

	const totalSupply = (await contracts.egis.totalSupply()).div(BigNumber.from(10).pow(9)); // Egis Total Supply
	const circSupply = (await contracts.aegis.circulatingSupply()).div(BigNumber.from(10).pow(9)); // AEgis Circulating Supply (or number of staked Egis)

	const marketCap = Math.trunc(totalSupply.toNumber() * price) // Egis Market Cap
	const stakingTVL = Math.trunc(circSupply.toNumber() * price) // The total sum of the value staked in the Divine Creatures DAO in Dollars

	const mimTreasuryBalance = await getStableTreasuryBalance(contracts.treasury, contracts.mim)
	const treasuryBalance = mimTreasuryBalance.add(await getLpTreasuryBalance(contracts.treasury, contracts.mimEgis)).div(BigNumber.from(10).pow(18))

	const [tokenAmount, timeAmount] = await getLpReserves(contracts.egis, contracts.mimEgis)
	const rfvTreasury = mimTreasuryBalance.add(tokenAmount)

	const timeSupply = totalSupply.sub(timeAmount);

	const rfv = rfvTreasury.div(timeSupply);

	const epoch = await contracts.staking.epoch();
	const stakingReward = epoch.distribute;

	let stakingRebase: number
	if (circSupply.eq(0)) {
		stakingRebase = 0;
	} else {
		stakingRebase = stakingReward.div(circSupply).toNumber()
	}

	const fiveDayRate = Math.pow(1 + stakingRebase, 5 * 3) - 1;
	// TODO: add user interest rate to APY?
	stakingRebase = 0.003
	const stakingAPY = Math.pow(1 + stakingRebase, 365 * 3) + 1;

	const currentIndexStacking = await contracts.aegis.index();
	const currentIndex = BigNumber.from(currentIndexStacking).toNumber() / 4.5;

	const nextRebase = epoch.endTime;

	let treasuryRunway: BigNumber
	if (circSupply.eq(0)) {
		treasuryRunway = BigNumber.from(0);
	} else {
		treasuryRunway = rfvTreasury.div(circSupply);
	}
	const runway = Math.log(treasuryRunway.toNumber()) / Math.log(1 + stakingRebase) / 3;


	return {
		price,
		marketCap,
		stakingTVL,
		stakingAPY,
		fiveDayRate,
		currentIndex,
		currentBlock,
		currentBlockTime,
		treasuryBalance,
		treasuryDebt: rfv, // TODO: Validate assumption
		runway,
		nextRebase,
		stakingRebase
	}
}
