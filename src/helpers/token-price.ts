import axios from "axios"

const cache: { [key: string]: number } = {}

export const loadTokenPrices = async () => {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=hector-dao,avalanche-2,olympus,magic-internet-money&vs_currencies=usd"
    const { data } = await axios.get(url)

    // cache["EGIS"] = data["egis"].usd
    cache["HEC"] = data["hector-dao"].usd
    cache["AVAX"] = data["avalanche-2"].usd
    cache["MIM"] = data["magic-internet-money"].usd
    cache["OHM"] = data["olympus"].usd

};

export const getTokenPrice = (symbol: string): number => Number(cache[symbol])
 