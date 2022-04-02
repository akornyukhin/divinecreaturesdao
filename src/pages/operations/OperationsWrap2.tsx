import * as React from "react"
import Main from "../../components/Main"
import { InputBox } from "../../components/InputBox"


const OperationWrap2 = () => {
    const [amount, setAmount] = React.useState(0)
    const [apy, setApy] = React.useState(0)
    const [pap, setPap] = React.useState(0)
    const [fmp, setFmp] = React.useState(0)
    const [days, setDays] = React.useState(1)

    return <Main>
        <div className="uk-width-2-3 uk-align-center">
            <div className="uk-grid-small uk-flex-column uk-card uk-card-secondary uk-card-body uk-padding"
                 data-uk-grid="first-column: uk-padding-remove-left">
                <div>
                    <h3 className="uk-card-title">WRAP</h3>
                    <div className="uk-flex-column uk-margin-top">
                        <div className="uk-flex uk-flex-right">
                            <h3 className="uk-card-secondary">1 EGIS = 0.13 aEGIS</h3>
                        </div>

                        <div className="uk-flex uk-flex-right">
                            <div>Balance: 0 EGIS</div>
                        </div>
                    </div>

                    <div
                        className="uk-margin  uk-flex-center uk-grid-small uk-child-width-auto uk-grid uk-child-width-1-2@m">
                        <div className="uk-form-stacked">
                            <InputBox label="EGIS Amount" value={amount} onChange={setAmount} buttonText="Max" onButtonClick={() => {}} />
                            <InputBox label="aEGIS Amount" value={apy} onChange={setApy} buttonText="Max" onButtonClick={() => {}} />

                            <div className="uk-flex uk-flex-center">
                                <button className="uk-button uk-button-default">Approve</button>
                            </div>
                        </div>
                    </div>

                    <div className="uk-flex-column uk-margin-top">
                        <div className="uk-flex uk-flex-center">
                            <div>Note: The "Approve" transaction is only needed when</div>
                        </div>
                        <div className="uk-flex uk-flex-center">
                            <div>wrapping for the first time; subsequent wrapping only</div>
                        </div>
                        <div className="uk-flex uk-flex-center">
                            <div>requires you to perform the "Wrap" transaction.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Main>
}
export default OperationWrap2
