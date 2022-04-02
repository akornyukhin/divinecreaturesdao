import * as React from "react"
import { useEffect } from "react"
import { adjustDecimals, IContracts } from "../../helpers/state"
import { INftData, loadNftData } from "./utils/nftDataLoader"
import UIkit from "uikit"
import { friendlyMsg, writeLocalStorage } from "../../helpers/utils"
import { BigNumber } from "ethers"
import { OwnProviderState } from "../../helpers/provider"

export interface IConnectedPageChildProps {
    own: OwnProviderState
    contracts: IContracts
    connectedState: ConnectedState
    reload: () => Promise<void>
}

export interface IConnectedPageProps {
    own: OwnProviderState
    contracts: IContracts
    children: (props: IConnectedPageChildProps) => JSX.Element
}

export interface ConnectedState {
    readonly beneficiary: string
    readonly connected: boolean
    readonly presaleIsOpen: boolean
    readonly eligible: boolean
    readonly nftPrice: BigNumber
    readonly nftPriceAdjusted: number
    readonly ownTokenIds: [number, INftData][]
    readonly tokenIds: number[]
    readonly getNftData: (tokenId: number) => Promise<INftData>
    readonly balance: number
    readonly allowance: number
    readonly children?: (nftData: INftData) => JSX.Element;
}

export const ConnectedPage = ({ own, contracts, children }: IConnectedPageProps): JSX.Element => {
    const nftDatas = React.useMemo(() => new Map<number, INftData>(), [own, contracts])

    const getNftData = async (tokenId: number): Promise<INftData> => {
        const cached = nftDatas.get(tokenId)
        if (!!cached) return cached

        const key = `nft-${tokenId}`
        const str = window.localStorage.getItem(key)
        if (!!str) {
            return JSON.parse(str)
        }

        const nftData = (await loadNftData(contracts.nft, tokenId))! // Add error handling
        writeLocalStorage(key, nftData)
        nftDatas.set(tokenId, nftData)

        return nftData
    }

    const load = async (state: ConnectedState, setState: React.Dispatch<React.SetStateAction<ConnectedState>>) => {
        try {
            const beneficiary = own.address ?? ""

            const nftPrice = await contracts.nftCrowdsale.nftPrice()
            const nftPriceAdjusted = adjustDecimals(nftPrice, 18)
            const eligible = await contracts.nftCrowdsale.checkApproved(beneficiary)
            const presaleIsOpen = await contracts.nftCrowdsale.isOpen()
            // console.log("presale: " + presaleIsOpen)
            // const openingTime = await contracts.nftCrowdsale.openingTime()
            // console.log("openingTime: " + openingTime)
            // const closingTime = await contracts.nftCrowdsale.closingTime()
            // console.log("closingTime: " + closingTime)


            // const nftCount = (await contracts.nft.totalSupply()).toNumber()
            const ownNftCount = (await contracts.nft.balanceOf(beneficiary)).toNumber()

            let tokenIds: number[] = []

            const ownTokenIds: [number, INftData][] = []
            for (let i = 0; i < ownNftCount; i++) {
                const tokenId = (await contracts.nft.tokenOfOwnerByIndex(beneficiary, i)).toNumber()
                const nftData = await getNftData(tokenId)
                ownTokenIds.push([tokenId, nftData])
            }

            const balance = adjustDecimals(await contracts.ftm.balanceOf(beneficiary), 18)
            const allowance = adjustDecimals(await contracts.ftm.allowance(beneficiary, contracts.nftCrowdsale.address), 18)

            const newState: ConnectedState = {
                beneficiary,
                connected: true,
                presaleIsOpen,
                eligible,
                nftPrice,
                nftPriceAdjusted,
                ownTokenIds,
                tokenIds,
                getNftData,
                balance,
                allowance
            }

            // console.log(newState)
            setState(newState)
        } catch (e: any) {
            console.log(`error: ${e}`)
            UIkit.modal.alert(`error: ${friendlyMsg(e?.data?.message ?? e?.message)}`)
                .finally(() => {} /*setInterval(() => load(state, setState), 1000)*/    )
        }
    }

    const [state, setState]: [ConnectedState, React.Dispatch<React.SetStateAction<ConnectedState>>] = React.useState<ConnectedState>({
        beneficiary: "",
        connected: false,
        presaleIsOpen: false,
        eligible: false,
        nftPrice: BigNumber.from(0),
        nftPriceAdjusted: 0,
        ownTokenIds: [],
        tokenIds: [],
        getNftData,
        balance: 0,
        allowance: 0
    })

    useEffect(() => {
            load(state, setState)
        },
        [own]
    )

    return children({own, contracts, connectedState: state, reload: async () => await load(state, setState)})
}
