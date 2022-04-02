import { ConnectedState } from "../ConnectedPage"
import { adjustDecimals, IContracts } from "../../../helpers/state"
import { DivineTiers, Lot, LotDynamic, LotId, LotOverride, LotStatic, LotStatus } from "../../../helpers/types"
import { useLocalStorage } from "@rehooks/local-storage"
import { readLocalStorage, timeDiff, writeLocalStorage } from "../../../helpers/utils"
import * as React from "react"
import { ReactNode, useEffect, useState } from "react"
import { Loading } from "./Loading"

// import { LazyLoadComponent } from 'react-lazy-load-image-component'

interface IExtendedSlot {
    endTime: number
}

export interface IStoredLotProps {
    connectedState: ConnectedState
    contracts: IContracts
    lotId: LotId
    key: string
    // needsDynamics: boolean
    override?: LotOverride
    childrenClassName: string
    updateLoadedLots: (lot: Lot) => void
    filter: (lot: Lot) => boolean
    children: (lot: Lot) => ReactNode
}

export const StoredLot = ({
                       connectedState,
                       contracts,
                       lotId,
                       override,
                       childrenClassName,
                       updateLoadedLots,
                       filter,
                       children
                   }: IStoredLotProps) => {

    const [storedLotS, setStoredLotS] = useLocalStorage<LotStatic & LotOverride | undefined>(`lot-S-${JSON.stringify(lotId)}`, undefined)
    const [storedLotD, setStoredLotD] = useLocalStorage<LotDynamic[]>(`lot-D-${JSON.stringify(lotId)}`, [])

    const ownLotD = storedLotD.find(sl => sl.address === connectedState.beneficiary)

    if (!!storedLotS?.localAuctionEndTime && timeDiff(storedLotS.localAuctionEndTime) <= 0) {
        const key = `c-${lotId.auctionIndex}-${lotId.lotId}`
        const newTime = Math.ceil((new Date().getTime()) / 1000  + 3000 + Math.random() * 1200)
        let { endTime } = readLocalStorage<IExtendedSlot>(key, { endTime: newTime })
        if (endTime === newTime || timeDiff(endTime) <= 0) {
            endTime = newTime
            writeLocalStorage(key, { endTime })
        }
        const localAuctionEndTime = endTime
        setStoredLotS({...storedLotS, localAuctionEndTime})
    }

    interface IRefresher {
        intervalKillSwitch: NodeJS.Timeout
    }
    const [refresher, setRefresher] = useState<IRefresher | undefined>(undefined)

    const createLot = async (): Promise<Lot> => {
        if (override?.overrideAuctionIndex === -1) {
            const tokenId = override.overrideTokenId!
            const nftData = await connectedState.getNftData(tokenId)
            const lot: LotStatic & LotOverride = {
                ...override,
                auctionIndex: lotId.auctionIndex,
                lotId: override.overrideLotId!,
                tokenId: tokenId,
                completed: true,
                nftData
            }
            const newLotD: LotDynamic = {
                address: connectedState.beneficiary,
                loaded: true,
                liveUpdates: false,
                highestBid: nftData.loadedData.quality === DivineTiers.GOD ? 4200
                    : nftData.loadedData.quality === DivineTiers.DEITY ? 420
                    : 125,
                ended: true,
                noBids: false,
                highestBidder: override?.overrideOwner ?? "",
                isHighestBidder: override?.overrideOwner === connectedState.beneficiary,
                status: LotStatus.SOLD,
                withdrawFunds: 0
            }

            return [lot, newLotD]
        }

        const [
            highestBidder,
            tokenIdBN,
            localOpenTime,
            localAuctionEndTimeBN,
            highestBid,
            minIncrement,
            ended
        ] = await contracts.auction[lotId.auctionIndex].auctionLots(lotId.lotId)

        const tokenId = tokenIdBN.toNumber()
        const withdrawFunds = connectedState.connected && ended
            ? adjustDecimals(await contracts.auction[lotId.auctionIndex].pendingReturnsFor(lotId.lotId, connectedState.beneficiary), 18)
            : 0
        const noBids = highestBidder.startsWith("0x00000000000000000")
        let localAuctionEndTime = localAuctionEndTimeBN.toNumber()
        if (timeDiff(localAuctionEndTime) <= 0) {
            interface IExtendedSlot {
                endTime: number
            }
            const key = `c-${lotId.auctionIndex}-${lotId.lotId}`
            const newTime = Math.ceil((new Date().getTime()) / 1000  + 3000 + Math.random() * 1200)
            let { endTime } = readLocalStorage<IExtendedSlot>(key, { endTime: newTime })

            if (endTime === newTime || timeDiff(endTime) <= 0) {
                endTime = newTime
                writeLocalStorage(key, { endTime })
            }
            localAuctionEndTime = endTime
        }

        const calculateStatus = (): LotStatus => {
            if (!connectedState.connected) return LotStatus.NOT_LOADED

            if (timeDiff(localOpenTime.toNumber()) > 0) return LotStatus.NOT_STARTED

            if (ended) {
                if (noBids) return LotStatus.UNSOLD
                if (highestBidder === connectedState.beneficiary) return LotStatus.WINNER
                if (withdrawFunds > 0) return LotStatus.SOLD_HAS_FUNDS
                return LotStatus.SOLD
            } else {
                if (timeDiff(localAuctionEndTime) > 0) return LotStatus.STARTED
                return LotStatus.FINISHED
            }
        }

        const nftData = await connectedState.getNftData(tokenId)
        const status = calculateStatus()

        const newLotS: LotStatic & LotOverride = {
            ...override,
            ...lotId,
            tokenId,
            completed: ended,
            localOpenTime: localOpenTime.toNumber(),
            localAuctionEndTime,
            minIncrement: adjustDecimals(minIncrement, 18),
            nftData
        }

        const newLotD: LotDynamic = {
            address: connectedState.beneficiary,
            loaded: true,
            liveUpdates: [LotStatus.STARTED, LotStatus.FINISHED, LotStatus.SOLD_HAS_FUNDS].indexOf(status) >= 0,
            highestBid: adjustDecimals(highestBid, 18),
            ended,
            noBids,
            highestBidder,
            isHighestBidder: highestBidder === connectedState.beneficiary,
            status,
            withdrawFunds
        }

        return [newLotS, newLotD]
    }

    const refresh = async function() {
        if (!storedLotS?.localOpenTime) {
            if (!!refresher?.intervalKillSwitch) clearInterval(refresher.intervalKillSwitch)
        }
        else {
            if (timeDiff(storedLotS?.localOpenTime) <= 0) { // Auction started
                const [lotS, lotD] = await createLot()
                if (JSON.stringify(lotS) !== JSON.stringify(storedLotS) || JSON.stringify(lotD) !== JSON.stringify(ownLotD) || lotD?.status === LotStatus.FINISHED) {
                    const stripped = [...storedLotD?.filter(ld => ld.address !== connectedState.beneficiary) ?? []]
                    if (!!lotD) {
                        setStoredLotD([...stripped, lotD])
                    }
                    else {
                        setStoredLotD([...stripped])
                    }
                    if (JSON.stringify(lotS) !== JSON.stringify(storedLotS)) {
                        setStoredLotS(lotS)
                    }
                    updateLoadedLots([storedLotS, lotD])
                }

                if ([LotStatus.SOLD, LotStatus.UNSOLD, LotStatus.WINNER].indexOf(ownLotD?.status ?? LotStatus.NOT_LOADED) >= 0) {
                    if (!!refresher?.intervalKillSwitch) clearInterval(refresher.intervalKillSwitch)
                }
            }
        }
    }

    useEffect(() => {
        const handleRefresh = () => {
            if (!refresher?.intervalKillSwitch) {
                const intervalKillSwitch = setInterval(() => { refresh() }, 4500 + Math.random() * 1000)
                setRefresher({ intervalKillSwitch })
            }
        }
        const updateLot = async (first: boolean) => {
            let lotS: LotStatic & LotOverride
            let lotD: LotDynamic | undefined
            if (!!storedLotS) {
                lotS = storedLotS
                lotD = ownLotD

                if (!lotD) {
                    [lotS, lotD] = await createLot()
                    if (JSON.stringify(lotS) !== JSON.stringify(storedLotS)) {
                        setStoredLotS(lotS)
                    }
                    if (!!lotD) {
                        const ld = storedLotD ?? []
                        ld.push(lotD)
                        setStoredLotD(ld)
                    }
                }
            } else {
                [lotS, lotD] = await createLot()
                setStoredLotS(lotS)
                if (!!lotD) {
                    setStoredLotD([lotD])
                }
            }
            if (first) {
                updateLoadedLots([lotS, lotD])
            }
            handleRefresh()

            // console.log(lotS)
            // console.log(lotD)
        }
        updateLot(true)
        return () => {
            if (!!refresher?.intervalKillSwitch) clearInterval(refresher.intervalKillSwitch)
        }

    }, [connectedState, contracts, lotId])

    const key=`${lotId.auctionIndex}-${lotId.lotId}`

    if (!storedLotS || !filter([storedLotS, ownLotD])) {
        return null
    }

    return <div className={childrenClassName} key={key}>
        {
            !!storedLotS
                ? children([storedLotS, ownLotD])
                : <Loading/>
        }
        </div>
}
