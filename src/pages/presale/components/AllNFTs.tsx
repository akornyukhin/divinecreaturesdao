import * as React from "react"
import { useEffect } from "react"
import { IContracts } from "../../../helpers/state"
import { ConnectedState } from "../ConnectedPage"
import { NftGrid } from "./NftGrid"
import { OwnProviderState } from "../../../helpers/provider"
import { TierImage } from "./QualitySection"
import { DivineTiers, Lot, LotId, LotOverride, LotStatus } from "../../../helpers/types"
import { LoadedCard } from "./LoadedCard"
import { NftGridWhitelist } from "./NftGridWhitelist"
import { readLocalStorage, writeLocalStorage } from "../../../helpers/utils"
import { StoredLot } from "./StoredLot"
import { AuctionCardExtra } from "./AuctionCardExtra"
import { Loading } from "./Loading"
import GodsOverview from "../../overview/GodsOverview"

export const textBannerClass = "uk-text-center uk-padding-small uk-text-lead uk-text-bottom "

interface IIgnore {
    "auctionIndex": number
    "lotId": number
    "tokenId": number
}

export interface IAllNFTsProps {
    own: OwnProviderState
    contracts: IContracts
    connectedState: ConnectedState
    overrides: LotOverride[]
    ignores: IIgnore[]
    reload: () => Promise<void>
}

export const AllNFTs = ({ own, contracts, connectedState, overrides, ignores, reload }: IAllNFTsProps) => {
    const overridesLength = overrides.filter(o => o.overrideAuctionIndex == -1).length

    enum PageIndex {
        GODS,
        OWN,
        ACTIVE,
        WITH_BIDS,
        FINISHED,
        ALL
    }

    const [loading, setLoading] = React.useState(true)
    const [pageIndex, setPageIndex] = React.useState(PageIndex.ACTIVE)
    const [tierFilter, setTierFilter] = React.useState([new Set<DivineTiers>([DivineTiers.GOD, DivineTiers.DEITY, DivineTiers.DEMIGOD])])
    const [auctionSizes, setAuctionSizes] = React.useState<number[]>([overridesLength])

    interface ILoadedLots {
        lots: Map<string, Lot>
    }

    const [loadedLots, setLoadedLots] = React.useState({ lots: new Map<string, Lot>() })
    const updateLoadedLots = (lot: Lot) => {
        loadedLots.lots.set(JSON.stringify({ auctionIndex: lot[0].auctionIndex,  lot: lot[0].lotId }), lot)
        // setLoadedLots({...loadedLots})
    }

    interface IFilterButtonProps {
        tier: DivineTiers
    }
    const FilterButton = ({ tier }: IFilterButtonProps) => {
        const updateFilter = (tier: number) => {
            tierFilter[0].has(tier) ? tierFilter[0].delete(tier) : tierFilter[0].add(tier)
            setTierFilter([...tierFilter])
        }
        const borderStyle = tier === DivineTiers.GOD ? "extra-border border-gold"
            : tier === DivineTiers.DEITY ? "extra-border border-silver"
            : "extra-border border-bronze"
        return <a className={"uk-link-reset" + (tierFilter[0].has(tier) ? " uk-background-primary " + borderStyle: "")} onClick={() => updateFilter(tier)} >
            <TierImage tier={tier} />
        </a>
    }

    const FilterButtons = () =>
        <div className="uk-grid-small uk-flex-center" data-uk-grid="first-column: uk-padding-remove-left">
            <div className="uk-flex uk-flex-row">
                <FilterButton tier={DivineTiers.GOD} />
                <FilterButton tier={DivineTiers.DEITY} />
                <FilterButton tier={DivineTiers.DEMIGOD} />
            </div>
        </div>

    interface IStoredAuctionInfo {
        size?: number
    }
    useEffect(() => {
        const loadAll = async(firstLoad: boolean) => {
            // if (!firstLoad && loading) return

            try {
                let resetAuctionSizes = firstLoad
                const auctionSizesNew = [overridesLength]
                for (let auctionIndex = 0; auctionIndex < contracts.auction.length; auctionIndex++) {
                    const storedInfo = readLocalStorage<IStoredAuctionInfo>(`auction-${auctionIndex}`, {})
                    auctionSizesNew.push(storedInfo.size ?? 0)
                }
                if (JSON.stringify(auctionSizesNew) != JSON.stringify(auctionSizes)) {
                    resetAuctionSizes = true
                }
                const actualSizes = [overridesLength]
                for (let auctionIndex = 0; auctionIndex < contracts.auction.length; auctionIndex++){
                    const lotCount = (await contracts.auction[auctionIndex].auctionLength()).toNumber()
                    actualSizes.push(lotCount)
                }
                if (JSON.stringify(auctionSizesNew) != JSON.stringify(actualSizes)) {
                    for (let auctionIndex = 0; auctionIndex < contracts.auction.length; auctionIndex++) {
                        writeLocalStorage(`auction-${auctionIndex}`, { size: actualSizes[auctionIndex + 1]})
                    }
                    resetAuctionSizes = true
                }
                if (resetAuctionSizes) {
                    setAuctionSizes(actualSizes)
                }
            }
            catch (e: any) {
                console.log(`error: ${e}`)
                // UIkit.modal.alert(`error: ${friendlyMsg(e?.data?.message ?? e?.message)}`).finally(reload)
            }

            if (loading) setLoading(false)
        }

        loadAll(true)

        const interval = setInterval(() => loadAll(false), 5000)
        return () => clearInterval(interval)
    }, [own, contracts, connectedState])

    const auctionStatuses = [ LotStatus.STARTED, LotStatus.SOLD_HAS_FUNDS, LotStatus.FINISHED ]
    const finishedStatuses = [ LotStatus.SOLD, LotStatus.UNSOLD, LotStatus.WINNER ]

    const lotIds: LotId[] = auctionSizes.
        flatMap((an, auctionIndex) => {
            return [...Array(an).keys()].map(k => ({ auctionIndex: auctionIndex - 1, lotId: k }))
        }) //.reverse() // reverse for loading most relevant first

    const filterIgnores = ([lotS, lotD]: Lot) => !ignores.find(i => i.auctionIndex == lotS.auctionIndex && i.lotId == lotS.lotId && i.tokenId == lotS.tokenId)
    const filterActive = ([lotS, lotD]: Lot) => filterIgnores([lotS, lotD]) && auctionStatuses.includes(lotD?.status ?? LotStatus.NOT_STARTED)
    const filterWithBids = ([lotS, lotD]: Lot) => filterIgnores([lotS, lotD]) && auctionStatuses.includes(lotD?.status ?? LotStatus.NOT_STARTED) && !!lotD && !lotD.noBids
    const filterFinished = ([lotS, lotD]: Lot) => filterIgnores([lotS, lotD]) && finishedStatuses.includes(lotD?.status ?? LotStatus.NOT_STARTED)
    const filterAll = filterIgnores

    const formatOverZero = (n: number) => n > 0 ? ` (${n})` : ""

    interface ICountBadgeProps {
        filter: (lot: Lot) => boolean
    }
    const CountBadge = ({filter}: ICountBadgeProps) => {
        const count = () => [...loadedLots.lots.values()].filter(filter).length

        const [state, setState] = React.useState(count())

        useEffect(() => {
            const interval = setInterval(() => {
                const c = count()
                if (c != state)
                    setState(c)
            }, 500)

            return () => clearInterval(interval)
        })
        return <span>{formatOverZero(state)}</span>
    }

    const PageTabs = () =>
        <div className="uk-grid-small uk-flex-center" data-uk-grid="first-column: uk-padding-remove-left">
            <ul data-uk-tab="animation: true" data-active={pageIndex} className="uk-flex-center nft-tab">
                <li><a onClick={() => setPageIndex(PageIndex.GODS)}>Gods</a></li>
                <li><a onClick={() => setPageIndex(PageIndex.OWN)}>My NFTs{formatOverZero(connectedState.ownTokenIds.length)}</a></li>
                <li><a onClick={() => setPageIndex(PageIndex.ACTIVE)}>Auction<CountBadge filter={filterActive}/></a></li>
                <li><a onClick={() => setPageIndex(PageIndex.WITH_BIDS)}>With Bids<CountBadge filter={filterWithBids}/></a></li>
                <li><a onClick={() => setPageIndex(PageIndex.FINISHED)}>Finished<CountBadge filter={filterFinished}/></a></li>
                <li><a onClick={() => setPageIndex(PageIndex.ALL)}>All NFTs<CountBadge filter={filterAll}/></a></li>
            </ul>
        </div>

    const filter = (lot: Lot) => {
        const [lotS, lotD] = lot
        const page = () => {
            if (pageIndex === PageIndex.ALL) return filterIgnores(lot)
            if (pageIndex === PageIndex.ACTIVE) return filterActive(lot)
            if (pageIndex === PageIndex.WITH_BIDS) return filterWithBids(lot)
            if (pageIndex === PageIndex.FINISHED) return filterFinished(lot)

            return false
        }
        const tier = tierFilter[0].has(lotS.nftData.loadedData.quality)
        return page() && tier
    }

    return <div className="">
        <FilterButtons />
        <PageTabs />
        <div>
            { loading ? <Loading />
                : pageIndex == PageIndex.GODS ? <GodsOverview /> 
                : pageIndex == PageIndex.OWN
                    ?   <NftGridWhitelist tokenIds={connectedState.ownTokenIds.filter(([tokenId, nftData]) => tierFilter[0].has(nftData.loadedData.quality))}>
                            {props => <LoadedCard nftData={props.tokenId[1]} />}
                        </NftGridWhitelist>
                    :   <NftGrid lotIds={lotIds}>
                                {({lotId, childrenClassName}) => <StoredLot
                                        connectedState={connectedState}
                                        contracts={contracts}
                                        lotId={lotId}
                                        key={`${lotId.auctionIndex}-${lotId.lotId}`}
                                        override={overrides.find(o => o.overrideAuctionIndex == lotId.auctionIndex && o.overrideLotId == lotId.lotId)}
                                        filter={filter}
                                        childrenClassName={childrenClassName}
                                        updateLoadedLots={updateLoadedLots}
                                    >
                                        {([lotStatic, lotDynamic]) => <LoadedCard nftData={lotStatic.nftData}>
                                            <AuctionCardExtra lotStatic={lotStatic} lotDynamic={lotDynamic!} own={own} contracts={contracts} reload={reload}/>
                                        </LoadedCard>}
                                    </StoredLot>
                                }
                            </NftGrid>
            }
        </div>
    </div>
}

export default AllNFTs
