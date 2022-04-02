import * as React from "react"
import Main from "../../components/Main"
import { MetricValue } from "../../components/MetricCard"
import { IMetrics } from "../../helpers/stateLoader"
import { OwnProviderState } from "../../helpers/provider"
import { IContracts } from "../../helpers/state"
import { InputBox } from "../../components/InputBox"

interface ICalculatorProps {
    metrics: IMetrics | undefined
    providerState: OwnProviderState | undefined
    contracts: IContracts | undefined
}

type IButtonProps = {
    text: string,
    setFunc: React.Dispatch<React.SetStateAction<number>>,
    value: number
}

export const Button = ({ text, setFunc, value }: IButtonProps) => <button className="uk-button uk-button-default" onClick={() => setFunc(value)}>
        {text}
    </button>

const getUserBandRate = async (connected:boolean, contracts:any, providerAddress:string) => {
    let userBandRate: number
    if (connected) {
        userBandRate = (await contracts.aegis.getUserBand(providerAddress)).toNumber() / 1000000
    } else {
        userBandRate = 0.003 // TODO: change to 0.0047 before deploy
    }
    return userBandRate
}

// TODO: add user band rates
const calcNewBalance = async (apy:number, amount:number, days:number) => {
    // const userBandRate = await getUserBandRate()
    let value = apy / 100
    value = Math.pow(value + 1, 1 / (365 * 3)) - 1 || 0
    let balance = amount
    for (let i = 0; i < days * 3; i++) {
        balance += balance * value
    }
    return balance - amount
}

export const calcRoi = async (connected:boolean, contracts:any, providerAddress:string) => {
    const userBandRate = await getUserBandRate(connected, contracts, providerAddress)
    const roi = (((1 + userBandRate) ** 15) - 1) * 100
    return roi
}

const OperationCalculator = ({ metrics, providerState, contracts }: ICalculatorProps) => {
    const [amount, setAmount] = React.useState(1)
    const [apy, setApy] = React.useState(0)
    const [pap, setPap] = React.useState(1)
    const [fmp, setFmp] = React.useState(1)
    const [days, setDays] = React.useState(1)

    const [egisBalance, setEgisBalance] = React.useState(0)
    const [aegisBalance, setAegisBalance] = React.useState(0)

    const [rewardAmount, setRewardAmount] = React.useState(0)
    const [potentialReturn, setPotentialReturn] = React.useState(0)
    const [roi, setRoi] = React.useState(0)

    const connected = !!(providerState?.address) && !!(contracts) && !!(metrics)

    React.useEffect(() => {
            const fetchBalances = async () => {
                if (connected) {
                    const currentEgisBalance = await contracts.egis.balanceOf(providerState.address!)
                    const currentaEgisBalance = await contracts.aegis.balanceOf(providerState.address!)
                    setEgisBalance(currentEgisBalance.toNumber()!)
                    setAegisBalance(currentaEgisBalance.toNumber()!)
                }
            }
            fetchBalances()
        },
        [providerState]
    )



    React.useEffect(() => {
            const calcReturnValues = async () => {
                const newBalance = await calcNewBalance(apy, amount, days)
                calcRoi(connected, contracts, providerState?.address!)
                setRewardAmount(newBalance)
                const newBalanceValue = (newBalance * fmp || 0)
                setPotentialReturn(newBalanceValue)
                const roi = await calcRoi(connected, contracts, providerState?.address!)
                setRoi(roi)
            }
            calcReturnValues()
        },
        [days, amount, apy, pap, fmp]
    )

    console.log(metrics)

    return <Main>
        <div className="uk-width-2-3 uk-align-center">
            <div className="uk-grid-small uk-flex-column uk-card uk-card-secondary uk-card-body uk-padding"
                 data-uk-grid="first-column: uk-padding-remove-left">
                <div>
                    <h3 className="uk-card-title">Calculator</h3>
                    <div className="uk-grid uk-flex-center">
                        <MetricValue title="EGIS Price" value={metrics} format={v => `$${v.price}`} />
                        <MetricValue title="Current APY" value={metrics} format={v => `${v.stakingAPY.toPrecision(6)}%`} />
                        <MetricValue title="Your aEGIS Balance" value={metrics} format={_v => `$0 aEGIS`} />
                    </div>
                    <div className="uk-margin uk-grid-small uk-child-width-auto uk-grid uk-child-width-1-2@m">
                        <div className="uk-form-stacked">
                            <InputBox
                                label="EGIS Amount"
                                value={amount}
                                onChange={setAmount}
                                buttonText="Max"
                                onButtonClick={() => { setAmount(egisBalance) }} />
                            <InputBox
                                label="EGIS price at purchase ($)"
                                value={pap}
                                onChange={setPap}
                                buttonText="Current"
                                onButtonClick={() => { setPap(metrics?.price ?? 1) }} />
                        </div>
                        <div className="uk-form-stacked">
                            <InputBox
                                label="APY (%)"
                                value={apy}
                                onChange={setApy}
                                buttonText="Current"
                                onButtonClick={() => { setApy(metrics?.stakingAPY ?? 1) }} />
                            <InputBox
                                label="Future EGIS market price ($)"
                                value={fmp}
                                onChange={setFmp}
                                buttonText="Current"
                                onButtonClick={() => { setFmp(metrics?.price ?? 1) }} />
                        </div>
                    </div>
                    <div className="uk-margin">
                        <label><input className="uk-range" type="range" value={days} min="1" max="365" step="1"
                                      onChange={event => setDays(Number(event.target.value))} />{days} {days == 1 ? "day" : "days"}
                        </label>
                    </div>

                    <div className="uk-flex-column uk-margin-top">
                        <div className="uk-flex uk-flex-between">
                            <div>Your Balance</div>
                            {providerState ? <div>{egisBalance} EGIS</div> : <div>connect your wallet</div>}
                        </div>
                        <div className="uk-flex uk-flex-between">
                            <div>Your Stacked Balance</div>
                            {providerState ? <div>{aegisBalance} aEGIS</div> : <div>connect your wallet</div>}
                        </div>
                        <div className="uk-flex uk-flex-between">
                            <div>Reward Amount</div>
                            <div>{rewardAmount.toFixed(6)} aEGIS</div>
                        </div>
                        <div className="uk-flex uk-flex-between">
                            <div>Reward Yield</div>
                            <div>{potentialReturn.toFixed(2)}$</div>
                        </div>
                        <div className="uk-flex uk-flex-between">
                            <div>ROI (5-day Rate)</div>
                            <div>{roi.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Main>
}
export default OperationCalculator
