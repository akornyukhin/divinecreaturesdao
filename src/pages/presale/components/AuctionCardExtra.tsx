import { OwnProviderState } from "../../../helpers/provider"
import { LotDynamic, LotOverride, LotStatic, LotStatus } from "../../../helpers/types"
import { addDecimals, adjustDecimals, IContracts } from "../../../helpers/state"
import * as React from "react"
import { BigNumber } from "ethers"
import { Auction__factory, IERC20__factory } from "../../../typechain"
import UIkit from "uikit"
import { friendlyMsg } from "../../../helpers/utils"
import { TimeCountdown } from "./TimeCountdown"
import { textBannerClass } from "./AllNFTs"

interface IAuctionCardExtraProps {
    own: OwnProviderState
    lotStatic: LotStatic & LotOverride
    lotDynamic: LotDynamic
    contracts: IContracts
    reload: () => Promise<void>
}

export const AuctionCardExtra = ({
                                     lotStatic,
                                     lotDynamic,
                                     contracts,
                                     own,
                                     reload
                                 }: IAuctionCardExtraProps) => {
    interface State {
        bidToPlace: number
    }

    const newMinBid = lotDynamic.noBids ? lotDynamic.highestBid : lotDynamic.highestBid + (lotStatic.minIncrement ?? 0)
    const [state, setState] = React.useState<State>({ bidToPlace: newMinBid })
    const minBid = Math.max(state.bidToPlace, newMinBid)

    if (state.bidToPlace < minBid) {
        setState({ ...state, bidToPlace: minBid })
    }

    const processSale = async (bid: BigNumber) => {
        try {
            if (lotStatic.auctionIndex < 0) {
                // Shouldn't happen
                console.log("unreachable code - processSale")
                return
            }
            const signingFtm = IERC20__factory.connect(contracts.ftm.address, own.signer)
            const txnApprove = await signingFtm.approve(contracts.auction[lotStatic.auctionIndex].address, bid)
            await txnApprove.wait(1)

            const signingAuction = Auction__factory.connect(contracts.auction[lotStatic.auctionIndex].address, own.signer)
            const txn = await signingAuction.bid(lotStatic.lotId, bid)
            await txn.wait(1)

            UIkit.modal
                .alert(`Your bid of ${adjustDecimals(bid, 18)} wFTM has been placed for ${lotStatic.nftData.loadedData.name} #${lotStatic.tokenId}`)
                .finally(reload)
        } catch (e: any) {
            console.log(`error: ${e}`)
            UIkit.modal.alert(`error: ${friendlyMsg(e?.data?.message ?? e?.message)}`).finally(reload)
        }
    }

    const processWithdraw = async () => {
        try {
            if (lotStatic.auctionIndex < 0) {
                // Shouldn't happen
                console.log("unreachable code - processSale")
                return
            }
            const signingAuction = Auction__factory.connect(contracts.auction[lotStatic.auctionIndex].address, own.signer)
            const txn = await signingAuction.withdrawFunds(lotStatic.lotId)
            await txn.wait(1)

            UIkit.modal
                .alert(`Your wFTM funds have been returned back to your account`)
                .finally(reload)
        } catch (e: any) {
            console.log(`error: ${e}`)
            UIkit.modal.alert(`error: ${friendlyMsg(e?.data?.message ?? e?.message)}`).finally(reload)
        }
    }

    return <div>
        <div className={"uk-text-bolder " + (lotDynamic.noBids ? "" : "uk-text-primary")}>
            {lotDynamic.noBids ? "Starting " : "Highest "}Bid: {lotDynamic.highestBid} wFTM {lotDynamic.isHighestBidder ?
            <span className="uk-text-success"> (you)</span> : ""}</div>
        {!!lotStatic.minIncrement ? <div>Minimum increment: {lotStatic.minIncrement} wFTM</div> : <div />}
        {lotStatic.completed || lotDynamic.ended
            ? <div>
                <div className="uk-text-small uk-text-light">Auction has ended</div>
                {lotStatic.explorerCompletionUri ? <div><a className="uk-text-small uk-text-light" rel="noopener noreferrer" href={lotStatic.explorerCompletionUri}
                                                           target="_blank">Confirmation Transaction</a></div> : null}
                {lotDynamic.isHighestBidder ? <div>You WON this item!</div> : <div />}
                {lotDynamic.status === LotStatus.WINNER ?
                    <div className={textBannerClass + "uk-text-success uk-text-bold"}>Winner</div>
                    : lotDynamic.status === LotStatus.SOLD || lotDynamic.status == LotStatus.SOLD_HAS_FUNDS
                        ? <div className={textBannerClass + "uk-text-danger uk-text-bolder"}>Sold Out</div>
                        : lotDynamic.status === LotStatus.UNSOLD ?
                            <div className={textBannerClass + "uk-text-bolder"}>Unsold</div>
                            : lotDynamic.status === LotStatus.FINISHED ?
                                <div className={textBannerClass + "uk-text-muted uk-text-italic"}>Pending ...</div>
                                : <div />
                }
                {lotDynamic.status === LotStatus.SOLD_HAS_FUNDS
                    ? <div className="uk-grid-small uk-flex-center" data-uk-grid="first-column: uk-padding-remove-left">
                        <div className="uk-inline">
                            <button className="uk-button uk-button-secondary" onClick={() => {
                                processWithdraw().finally(() => {
                                })
                            }}>Withdraw Funds: {lotDynamic.withdrawFunds} wFTM
                            </button>
                        </div>
                    </div>
                    : <div />
                }
            </div>
            : !!lotStatic.localAuctionEndTime
                ? <div>
                    <div className="uk-text-small uk-text-light">Auction is ending in:</div>
                    <TimeCountdown timeToEnd={lotStatic.localAuctionEndTime}>
                        <div className="uk-grid-small uk-flex-center"
                             data-uk-grid="first-column: uk-padding-remove-left">
                            <div className="uk-inline">
                                <a className="uk-form-icon uk-form-icon-flip in-input-button" href="#">wFTM</a>
                                <input className="uk-input uk-width-auto" type="number" min="0" value={state.bidToPlace}
                                       placeholder={`Minimum Bid: ${minBid} wFTM`}
                                       onChange={event => {
                                           setState({ ...state, bidToPlace: +event.target.value })
                                       }
                                       }
                                />
                            </div>
                            <div className="uk-inline">
                                <button className="uk-button uk-button-default" onClick={() => {
                                    processSale(addDecimals(state.bidToPlace, 18)).finally(() => {
                                    })
                                }}>Bid Now
                                </button>
                            </div>
                        </div>
                    </TimeCountdown>
                </div>
                : <div />
        }
    </div>
}
