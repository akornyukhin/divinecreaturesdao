import { Link } from "react-router-dom"

import circle from "../../assets/yellow-circle.png"
import { IMetrics } from "../../helpers/stateLoader"
import { buttonClass, sectionClass } from "../../helpers/utils"

interface ILandingMainProps {
    metrics: IMetrics | undefined
}

const LandingMain = ({ metrics }: ILandingMainProps) => {
    return <main className="uk-flex uk-flex-column">
        <div className="uk-background-contain uk-height-medium uk-panel uk-flex uk-flex-center uk-flex-middle"
             style={{ "backgroundImage": `url('${circle}')` }} />

        <div className="uk-flex uk-flex-center">
            <Link className={buttonClass} to="/auction">Enter App</Link>
            <a href="https://docs.divinedao.finance/" className={buttonClass} target="_blank"
               rel="noreferrer noopener">Documentation</a>
            <a href="https://bit.ly/35rEoIb" className={buttonClass} target="_blank" rel="noreferrer noopener">Deck</a>
        </div>

        <div className={sectionClass + "uk-margin-medium-top"}>
            <h1 className="uk-heading-medium">Open Treasury</h1>
        </div>

        <div className={sectionClass}>
            <div>Open reserve mechanics – stake and earn compounding interest</div>
        </div>

        {/*<div className={sectionClass} style={{ paddingTop: "35pt"}} data-uk-grid>*/}
        {/*	<MetricValue title="Total Staked" value={metrics} format={v => `$${v.treasuryDebt.toString()}`} />*/}
        {/*	<MetricValue title="Treasury Balance" value={metrics} format={v => `$${v.treasuryBalance.toString()}`} />*/}
        {/*	<MetricValue title="Current APY" value={metrics} format={v => `${v.stakingAPY}%`} />*/}
        {/*</div>*/}
    </main>
}
export default LandingMain
