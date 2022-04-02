import { INftData, loadNftData } from "./utils/nftDataLoader"
import * as React from "react"
import { IERC20__factory, NFTCrowdsale__factory } from "../../typechain"
import { addDecimals, buyNftCrowdsale} from "../../helpers/state"
import { UIKitUtil } from "./utils/UIKitUtil"
import UIkit from "uikit"
import { buttonClass, friendlyMsg, sectionClass } from "../../helpers/utils"
import { WhitelistMessage } from "./components/WhitelistMessage"
import { Loading } from "./components/Loading"
import { IConnectedPageChildProps } from "./ConnectedPage"
import { LoadedCard } from "./components/LoadedCard"


export const Sale = ({ own, contracts, connectedState, reload }: IConnectedPageChildProps) => {
    interface State {
        tokenId: number
        nftData: INftData | undefined
    }

    const [state, setState] = React.useState<State | undefined>(undefined)

    const processSale = async () => {
        const signingNftCrowdsale = NFTCrowdsale__factory.connect(contracts.nftCrowdsale.address, own.signer)
        try {
            const tokenId = await buyNftCrowdsale(signingNftCrowdsale, own.address ?? "")
            const nftData = await loadNftData(contracts.nft, tokenId)
            setState({ tokenId, nftData })

            UIKitUtil.on("#modal-nft", "beforehide", async () => {
                await reload()
            })
            UIkit.modal("#modal-nft", { container: false }).show()
        } catch (e: any) {
            console.log(`error: ${e}`)
            UIkit.modal.alert(`error: ${friendlyMsg(e?.data?.message ?? e?.message)}`).finally(reload)
        }
    }

    const approveSale = async () => {
        const signingFtm = IERC20__factory.connect(contracts.ftm.address, own.signer)
        try {
            const txn = await signingFtm.approve(contracts.nftCrowdsale.address, addDecimals(connectedState.nftPriceAdjusted, 18))
            await txn.wait()
        } catch (e) {
            const eAny = e as any
            console.log(`error: ${e}`)
            UIkit.modal.alert(`error: ${friendlyMsg(eAny.data.message)}`).finally(reload)
        }
    }

    return <div>

        {connectedState.presaleIsOpen
            ? <div>
                <div className={sectionClass + "uk-margin-medium-top uk-padding-small uk-padding-remove-top"}>
                    <h1 className="uk-h1">Whitelist Mint Started</h1>
                </div>
                <div className="uk-flex uk-flex-center uk-padding-small">
                    {connectedState.allowance >= connectedState.nftPriceAdjusted
                        ? <button type="button" className={buttonClass} onClick={() => {
                            processSale().finally(() => {
                            })
                        }}>Mint for {connectedState.nftPriceAdjusted} FTM</button>
                        : <button type="button" className={buttonClass} onClick={() => {
                            approveSale().finally(() => {
                                reload()
                            })
                        }}>Allow for {connectedState.nftPriceAdjusted} FTM</button>

                    }
                </div>
            </div>
            : <WhitelistMessage nftPriceAdjusted={connectedState.nftPriceAdjusted} />
        }

        <div
            className={sectionClass + "uk-text-small uk-grid-small uk-child-width-1-2 uk-flex-center uk-text-center uk-grid-match uk-padding-small our-darker"}
            data-uk-grid>
            <div>We are dedicating 10% of all funds raised in our auction and presale to Global Heritage Fund to support
                cultural preservation.
            </div>
        </div>

        {/* This is the modal */}
        <div id="modal-nft" className="uk-flex-top uk-animation-scale-up" data-uk-modal>
            <div
                className="uk-modal-dialog uk-margin-auto-vertical uk-width-medium uk-width-medium@s uk-width-medium@m uk-width-large@l uk-width-large@xl ">
                <button className="uk-modal-close-outside" type="button" data-uk-close></button>
                {!!(state?.nftData)
                    ? <LoadedCard nftData={state.nftData} />
                    : <Loading />
                }
            </div>
        </div>
    </div>
}
