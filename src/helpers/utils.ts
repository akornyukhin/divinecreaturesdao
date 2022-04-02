import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"

import { INftData, loadNftData } from "../pages/presale/utils/nftDataLoader"
import { AppContextData } from "../components/AppContext"

dayjs.extend(duration)

export const buttonClass = "uk-button uk-button-default uk-margin-left uk-margin-right "
export const sectionClass = "uk-flex uk-flex-center uk-light "

export const friendlyMsg = (m: string): string => {
    if (m.includes("NFT already bought")) return "Reverted: NFT already bought."
    if (m.includes("ERC20: balance too low")) return "Reverted: Your ERC20 balance is too low for the purchase."
    if (m.includes("ERC20: allowance too low")) return "Reverted: Your ERC20 allowance is too low. Try to increase it."
    if (m.includes("NFT already bought")) return "Reverted: NFT already bought."
    return m
}


export function timeDiff(endTime: number): number {
    const now = dayjs.unix(Math.ceil((new Date().getTime()) / 1000))
    const localEndTime = dayjs.unix(endTime)
    const diff = localEndTime.diff(now)
    return diff > 0 ? diff : 0
}

export const timeDiffFormat = (endTime: number): string => {
    const diff = timeDiff(endTime)
    if (diff > 0) {
        const dur = dayjs.duration(diff)
        const hours = (dur.days() * 24) + dur.hours()
        const templatedTime = `${hours}h ${dur.minutes()}m ${dur.seconds()}s`

        return templatedTime
    }

    return ""
}

export const readLocalStorage = <T>(key: string, defaultValue: T): T => {
    const str = window.localStorage.getItem(key)
    if (!!str) {
        return JSON.parse(str)
    }
    return defaultValue
}

export const writeLocalStorage = <T>(key: string, value: T) => {
    window.localStorage.setItem(key, JSON.stringify(value)) // TODO: Add dealing with the LocalStorage
}

export const prettifySeconds = (seconds: number) => {
    const dur = dayjs.duration(seconds)
    const hours = (dur.days() * 24) + dur.hours()
    const templatedTime = `${hours}h ${dur.minutes()}m`

    return templatedTime
}

export const chainName = (appContextData:AppContextData) =>
    appContextData.contracts!.chainID === 4002 ? 'Fantom Testnet' : 'Fantom Opera'

export const addFantomToMetamask = async (appContextData:AppContextData) => {
    console.log(appContextData.providerState?.provider)
    const currentProvider = appContextData.providerState?.provider
    let chainParams: {
        hex: string,
        name: string,
        rpcUrls: string[],
        blockExplorerUrls: string[]
    }
    if (appContextData.contracts!.chainID === 4002) {
        chainParams = {
            hex: appContextData.contracts!.chainID.toString(16),
            name: chainName(appContextData),
            rpcUrls: ['https://rpc.testnet.fantom.network/'],
            blockExplorerUrls: ['https://testnet.ftmscan.com/']
        }
    } else {
        chainParams = {
            hex: appContextData.contracts!.chainID.toString(16),
            name: chainName(appContextData),
            rpcUrls: ['https://rpc.ftm.tools/'],
            blockExplorerUrls: ['https://ftmscan.com/']
        }
    }

    try {
        await currentProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x' + chainParams.hex }], // Hexadecimal version of chainId, prefixed with 0x
        })
    } catch (e) {
        try {
            await currentProvider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x' + chainParams.hex, // Hexadecimal version of chainId, prefixed with 0x
                    chainName: chainParams.name,
                    nativeCurrency: {
                        name: "FTM",
                        symbol: "FTM",
                        decimals: 18,
                    },
                    rpcUrls: chainParams.rpcUrls,
                    blockExplorerUrls: chainParams.blockExplorerUrls,
                    iconUrls: [""],
                }],
            })
        } catch (e) {
            console.log(e)
        }
    }
}
