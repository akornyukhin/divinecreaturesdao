import * as React from "react"
import Main from "../../components/Main"
import { MetricValue } from "../../components/MetricCard"
import { Auction__factory, IaEgis__factory, IEgis__factory, IERC20__factory, Staking } from "../../typechain"
import { IMetrics } from "../../helpers/stateLoader"
import { OwnProviderState } from "../../helpers/provider"
import { adjustDecimals, IContracts } from "../../helpers/state"
import { friendlyMsg, prettifySeconds } from "../../helpers/utils"

import { calcRoi } from './OperationsCalculator'
import { InputBox } from "../../components/InputBox"
import { BigNumber } from "ethers"
import UIkit from "uikit"

var dayjs = require('dayjs')
var duration = require('dayjs/plugin/duration')
dayjs.extend(duration)

interface IStakingProps {
    metrics: IMetrics | undefined
    providerState: OwnProviderState | undefined
    contracts: IContracts | undefined
}

const OperationStaking = ({ metrics, providerState, contracts }: IStakingProps) => {

    const [stakeUnstakeIndex, setStakeUnstakeIndex] = React.useState(0)
    const [amount, setAmount] = React.useState(0)
    const [egisBalance, setEgisBalance] = React.useState(0)
    const [aegisBalance, setAegisBalance] = React.useState(0)
    const [stakingRebasePercentage, setStakingRebasePercentage] = React.useState(0)
    const [roi, setRoi] = React.useState(0)

    const connected = !!(providerState?.address) && !!(contracts) && !!(metrics)

    const handleStakeButton = async () => {
        if (!!providerState && !!contracts) {
            const signingStaking = contracts.staking.connect(providerState.signer)
            try {
                if (stakeUnstakeIndex === 0) {
                    const signingEgis = IEgis__factory.connect(contracts.egis.address, providerState.signer)
                    const txnApprove = await signingEgis.approve(contracts.staking.address, amount)
                    await txnApprove.wait(1)

                    const txn = await signingStaking.stake(amount, providerState?.address!)
                    await txn.wait(1)
                } else if (stakeUnstakeIndex === 1) {
                    const signingaEgis = IaEgis__factory.connect(contracts.aegis.address, providerState.signer)
                    const txnApprove = await signingaEgis.approve(contracts.staking.address, amount)
                    await txnApprove.wait(1)

                    const txn = await signingStaking.unstake(amount,false)
                    await txn.wait(1)
                }
            } catch (e: any) {
                console.log(`error: ${e}`)
                await UIkit.modal.alert(`error: ${friendlyMsg(e?.data?.message ?? e?.message)}`)
            }
        } else {
            await UIkit.modal.alert(`error: Please Connect Wallet`)
        }
    }

    const rebaseCountdown = React.useMemo(() => {
        const setTimeDiff = () => {
            const currentBlockTime = metrics?.currentBlockTime
            const nextRebase = metrics?.nextRebase
            if (currentBlockTime && nextRebase) {
                const seconds = currentBlockTime - nextRebase;
                return prettifySeconds(seconds)
            }
        }
        setTimeDiff()
    },[metrics?.currentBlockTime,metrics?.nextRebase])

    React.useEffect(() => {
        const fetchMetrics = async () => {
            if (connected) {
                const currentEgisBalance = await contracts!.egis.balanceOf(providerState?.address!)
                const currentaEgisBalance = await contracts!.aegis.balanceOf(providerState?.address!)
                setEgisBalance(currentEgisBalance.toNumber()!)
                setAegisBalance(currentaEgisBalance.toNumber()!)
                const stakingRebasePercentage = metrics?.stakingRebase * 100;
                setStakingRebasePercentage(stakingRebasePercentage)
            }
        }
        fetchMetrics()
    },
        [providerState]
    )

    React.useEffect(() => {
        const calcReturnValues = async () => {
            const roi = await calcRoi(connected, contracts, providerState?.address!)
            setRoi(roi)
        }
        calcReturnValues()
    },
        [amount]
    )

    return <Main>
        <div className="uk-width-2-3 uk-align-center">
            <div className="uk-grid-small uk-flex-column uk-card uk-card-secondary uk-card-body uk-padding"
                 data-uk-grid="first-column: uk-padding-remove-left">
                <div>
                    <h3 className="uk-card-title">EGIS Staking</h3>
                    {metrics?.currentBlockTime &&
                      rebaseCountdown &&
                        <p>Countdown until next rebase: {rebaseCountdown}</p>
                    }
                    <div className="uk-grid uk-flex-center" data-uk-grid="first-column: uk-padding-remove-left">
                        <MetricValue title="Current APY" value={metrics} format={v => `${v.stakingAPY.toPrecision(6)}%`} />
                        <MetricValue title="TVL" value={metrics} format={v => `$${v.stakingTVL}`} />
                        <MetricValue title="Current Index" value={metrics} format={v => `${v.currentIndex} aEgis`} />
                    </div>
                    <div className="uk-grid-small uk-flex-center" data-uk-grid="first-column: uk-padding-remove-left">
                        <ul data-uk-tab="animation: true" data-active={stakeUnstakeIndex} className="uk-flex-center">
                            <li><a onClick={() => setStakeUnstakeIndex(0)}>Stake</a></li>
                            <li><a onClick={() => setStakeUnstakeIndex(1)}>Unstake</a></li>
                        </ul>
                    </div>
                    <div className="uk-grid-small uk-flex-center" data-uk-grid="first-column: uk-padding-remove-left">
                        <div className="uk-margin">
                            <div className="uk-inline">
                                <InputBox
                                    label=""
                                    value={amount}
                                    onChange={setAmount}
                                    buttonText="Max"
                                    onButtonClick={() => { setAmount(egisBalance) }} />
                            </div>
                        </div>
                        <div>
                            {providerState?.address ?
                                <button
                                    className="uk-button uk-button-default"
                                    onClick={() => handleStakeButton()}>{stakeUnstakeIndex === 0 ? "Stake" : "Unstake"}</button>
                                :
                                <div className="uk-inline">Connect Your Wallet</div>
                            }
                        </div>
                    </div>
                    {providerState && metrics
                        ? <div className="uk-flex-column">
                            <div className="uk-flex uk-flex-between">
                                <div>Your Balance</div>
                                <div>{egisBalance} EGIS</div>
                            </div>
                            <div className="uk-flex uk-flex-between">
                                <div>Your Stacked Balance</div>
                                <div>{aegisBalance} aEGIS</div>
                            </div>
                            <div className="uk-flex uk-flex-between">
                                <div>Next Reward Amount</div>
                                <div>{metrics!.stakingRebase} aEgis</div>
                            </div>
                            <div className="uk-flex uk-flex-between">
                                <div>Next Reward Yield</div>
                                <div>{stakingRebasePercentage}%</div>
                            </div>
                            <div className="uk-flex uk-flex-between">
                                <div>ROI (5-day Rate)</div>
                                <div>{roi.toFixed(2)}%</div>
                            </div>
                        </div>
                        : <div>connect your wallet</div>
                    }
                </div>
            </div>
        </div>
    </Main>
}
export default OperationStaking
