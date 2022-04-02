import { INftData } from "../pages/presale/utils/nftDataLoader"

export enum LotStatus {
    NOT_LOADED,
    NOT_STARTED,
    STARTED,
    FINISHED,
    UNSOLD,
    SOLD,
    SOLD_HAS_FUNDS,
    WINNER,
}

export interface LotId {
    auctionIndex: number
    lotId: number
}

export interface LotStatic extends LotId {
    tokenId: number
    nftData: INftData
    completed: boolean
    localOpenTime?: number
    localAuctionEndTime?: number
    minIncrement?: number
}

export interface LotDynamic {
    loaded?: boolean
    address: string
    liveUpdates: boolean
    highestBid: number
    ended: boolean
    noBids: boolean
    highestBidder: string
    isHighestBidder: boolean
    status: LotStatus
    withdrawFunds: number
}

export interface LotOverride {
    explorerCompletionUri?: string
    overrideAuctionIndex?: number
    overrideLotId?: number
    overrideTokenId?: number
    overrideOwner?: string
}

export type Lot = [LotStatic & LotOverride, LotDynamic | undefined]


export enum DivineTiers {
    DEMIGOD = 1,
    DEITY = 2,
    GOD = 3
}
