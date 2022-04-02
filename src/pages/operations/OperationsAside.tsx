import React from "react"

import face from "../../assets/White_DivineDAO_3_HQ-03.png"
import { Link } from "react-router-dom"

interface IAsideProps {
    // children: React.ReactNode
}

const OperationsAside = (props: IAsideProps) => <aside id="left-col"
                                                       className="uk-light uk-visible@m">
    <a href=".." className="left-content-box  content-box-dark">
        <div className="uk-background-contain uk-height-small "
             style={{ "backgroundImage": `url('${face}')`, height: "50px" }} />
        <h4 className="uk-text-uppercase uk-text-uppercase uk-text-bolder uk-text-small uk-text-center uk-margin-remove-vertical">Divine
            Creatures</h4>
    </a>

    <div className="left-nav-wrap">
    	<ul className="uk-nav uk-nav-default uk-nav-parent-icon" data-uk-nav="">
    <li className="uk-nav-header"></li>
    <li><Link to="/app"><span data-uk-icon="icon: thumbnails" className="uk-margin-small-right uk-icon"></span>Dashboard</Link></li>
    <li><Link to="/app/staking"><span data-uk-icon="icon: database" className="uk-margin-small-right uk-icon"></span>Stake</Link></li>
    <li><Link to="/app/mint" aria-expanded="true"><span data-uk-icon="icon: cog" className="uk-margin-small-right uk-icon"></span>Mint</Link></li>
    <li><Link to="/app/calculator"><span data-uk-icon="icon: settings" className="uk-margin-small-right uk-icon"></span>Calculator</Link></li>
    <li><Link to="/auction"><span data-uk-icon="icon:  thumbnails" className="uk-margin-small-right uk-icon"></span>NFT Auction</Link></li>
    <li><Link to="/crowdsale"><span data-uk-icon="icon: credit-card" className="uk-margin-small-right uk-icon"></span>Crowdsale</Link></li>
    	</ul>
    </div>
</aside>

export default OperationsAside
