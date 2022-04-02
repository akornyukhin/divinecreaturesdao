import * as React from "react"
import Main from "../../components/Main"
import { InputBox } from "../../components/InputBox"
import { AppContextData } from "../../components/AppContext"
import { NotConnected } from "./components/NotConnected"
import { IaEgis__factory, IEgis__factory, MagicInternetMoneyV1__factory } from "../../typechain"
import UIkit from "uikit"
import { friendlyMsg } from "../../helpers/utils"

interface ICrowdsaleProps {
    appContextData: AppContextData
    rate: number
}
const Crowdsale = ({ appContextData, rate }: ICrowdsaleProps) => {
    const [amount, setAmount] = React.useState(1)
    const [mim, setMim] = React.useState(1 * rate)

    const connected = !!(appContextData.providerState?.address) && !!(appContextData.contracts)
    const providerState = appContextData.providerState
    const contracts = appContextData.contracts

    const buy = async () => {
        if (!!providerState && !!contracts) {
            try {
                const signingMim = MagicInternetMoneyV1__factory.connect(contracts.mim.reserve.address, providerState.signer)
                const txnApprove = await signingMim.approve(contracts.staking.address, amount)
                await txnApprove.wait(1)

                const signingCrowdsale = contracts.crowdsale.connect(providerState.signer)
                const txn = await signingCrowdsale.buyTokens(providerState?.address!, amount)
                await txn.wait(1)
            } catch (e: any) {
                console.log(`error: ${e}`)
                await UIkit.modal.alert(`error: ${friendlyMsg(e?.data?.message ?? e?.message)}`)
            }
        } else {
            await UIkit.modal.alert(`error: Please Connect Wallet`)
        }
    }

    return connected ? <Main>
                <div className="uk-width-2-3 uk-align-center">
                    <div className="uk-grid-small uk-flex-column uk-card uk-card-secondary uk-card-body uk-padding"
                         data-uk-grid="first-column: uk-padding-remove-left">
                        <div>
                            <h3 className="uk-card-title">EGIS token pre-sale</h3>
                            <div className="uk-flex-column uk-margin-top">
                                <div className="uk-flex uk-flex-right">
                                    <h3 className="uk-card-secondary">1 EGIS = {rate.toFixed(2)} DAI</h3>
                                </div>

                                {/*<div className="uk-flex uk-flex-right">*/}
                                {/*    <div>Balance: 0 EGIS</div>*/}
                                {/*</div>*/}
                            </div>

                            <div
                                className="uk-margin  uk-flex-center uk-grid-small uk-child-width-auto uk-grid uk-child-width-1-2@m">
                                <div className="uk-form-stacked">
                                    <InputBox label="" value={amount} onChange={v => { setAmount(v); setMim(v * rate) }} buttonText="EGIS" onButtonClick={() => {}} />
                                    <InputBox label="" value={mim} onChange={v => { setAmount(v / rate); setMim(v) }} buttonText="MIM" onButtonClick={() => {}} />

                                    <div className="uk-flex uk-flex-center">
                                        <button className="uk-button uk-button-primary nav-button-inverted" onClick={() => buy()}>Join sale</button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </Main>
        : <div className="uk-flex uk-flex-column uk-flex-center" data-uk-height-viewport="offset-top: true">
            <NotConnected appContextData={appContextData} />
        </div>
}
export default Crowdsale
