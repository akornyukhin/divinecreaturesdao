import OperationsHeader from "./OperationsHeader"
import OperationsDashboard from "./OperationsDashboard"
import OperationStaking from "./OperationsStaking"
import OperationBonding from "./OperationsBonding"
import OperationCalculator from "./OperationsCalculator"
import OperationWrap2 from "./OperationsWrap2"
import Whitelist from "../presale/Whitelist"

import OperationsAside from "./OperationsAside"
import { AppContextData } from "../../components/AppContext"
import React from "react"
import PageNotFound from "./PageNotFound"
import AuctionPage from "../presale/AuctionPage"
import Crowdsale from "../presale/Crowdsale"

interface IOperationsProps {
    page: string
    appContextData: AppContextData
}

const Operations = ({ page, appContextData }: IOperationsProps) => {

    function renderSwitch(pageName: string) {
        switch (pageName) {
            case "dashboard":
                return <OperationsDashboard metrics={appContextData.metrics} />
            case "staking":
                return <OperationStaking
                    metrics={appContextData.metrics}
                    providerState={appContextData.providerState}
                    contracts={appContextData.contracts}
                />
            case "mint":
                return <OperationBonding metrics={appContextData.metrics} />
            case "calculator":
                return <OperationCalculator
                    metrics={appContextData.metrics}
                    providerState={appContextData.providerState}
                    contracts={appContextData.contracts}
                />
            case "wrap":
                return <OperationWrap2 />
            case "presale":
                return <Whitelist appContextData={appContextData} />
            case "auction":
                return <AuctionPage appContextData={appContextData} />
            case "crowdsale":
                return <Crowdsale appContextData={appContextData} rate={1.3} />
            default:
                return <PageNotFound />
        }
    }

    return <div id="page" data-uk-height-viewport>
        <div className="uk-flex uk-height-viewport">
            <OperationsAside />
            <div className="uk-width-expand" data-uk-height-viewport>
                <OperationsHeader appContextData={appContextData} />
                {renderSwitch(page)}
                <footer></footer>
            </div>
        </div>
    </div>
}
export default Operations
