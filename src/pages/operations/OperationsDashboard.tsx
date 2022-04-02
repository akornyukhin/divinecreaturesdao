import Main from "../../components/Main"
import { MetricCard } from "../../components/MetricCard"
import { IMetrics } from "../../helpers/stateLoader"

interface IOperationsDashboardProps {
    metrics: IMetrics | undefined
}

const OperationsDashboard = ({ metrics }: IOperationsDashboardProps) => {
    return <Main>
        <div className="uk-grid-small uk-child-width-1-3@s uk-flex-center uk-text-center uk-grid-match" data-uk-grid>
            <MetricCard title="EGIS Price" value={metrics} format={v => `$${v.price}`} />
            <MetricCard title="Market Cap" value={metrics}
                        format={v => `$${Intl.NumberFormat("en-US", { currency: "USD" }).format(v.marketCap)}`} />
            <MetricCard title="TVL" value={metrics}
                        format={v => `$${Intl.NumberFormat("en-US", { currency: "USD" }).format(v.stakingTVL)}`} />
            <MetricCard title="Current APY" value={metrics} format={v => `${v.stakingAPY.toPrecision(4)}%`} />
            <MetricCard title="Current Index" value={metrics} format={v => `${v.currentIndex} aEgis`} />
            <MetricCard title="Treasury Balance" value={metrics}
                        format={v => `$${Intl.NumberFormat("en-US", { currency: "USD" }).format(v.treasuryBalance.toBigInt())}`} />
            <MetricCard title="Total Staked" value={metrics}
                        format={v => `$${Intl.NumberFormat("en-US", { currency: "USD" }).format(v.treasuryDebt.toBigInt())}`} />
            <MetricCard title="Runway" value={metrics} format={v => `${v.runway} Days`} />
        </div>
    </Main>
}
export default OperationsDashboard
