import Main from "../../components/Main"
import { MetricValue } from "../../components/MetricCard"
import { IMetrics } from "../../helpers/stateLoader"

type Bond = {
    // Will be replaced with PNG or other picture format
    symbol: string;
    name: string;
    price: string;
    roi: string;
    purchased: string;
}

let bondsList: Bond[] = []

// Placeholders for testing purposes
// Need to switch to dynamic fetching in the future
bondsList.push({ symbol: "", name: "DAI", price: "XX", roi: "XX", purchased: "XX" })
bondsList.push({ symbol: "", name: "gOHM", price: "XX", roi: "XX", purchased: "XX" })

interface IBondingProps {
    metrics: IMetrics | undefined
}

const OperationBonding = ({ metrics }: IBondingProps) => {

    return <Main>
        <div className="uk-width-2-3 uk-align-center">
            <div className="uk-grid-small uk-flex-column uk-card uk-card-secondary uk-card-body uk-padding"
                 data-uk-grid="first-column: uk-padding-remove-left">
                <div>
                    <h3 className="uk-card-title">Mint</h3>
                    <div className="uk-grid uk-flex-center" data-uk-grid="first-column: uk-padding-remove-left">
                        <MetricValue title="Treasury Balance" value={metrics} format={v => `$${v.treasuryBalance}`} />
                        <MetricValue title="EGIS Price" value={metrics} format={v => `$${v.price}`} />
                    </div>
                    {/* Making the list of Bonds via <table>, <tr>, <td>, but perhaps making it via a dedicated <BondRow /> element will be cleaner */}
                    <table className="uk-table uk-table-divider uk-table-justify">
                        <thead>
                        <tr>
                            <th></th>
                            <th>Mint</th>
                            <th>Price</th>
                            <th>ROI</th>
                            <th>Purchased</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            bondsList.map(
                                (bond, i) => {
                                    return (
                                        <tr key={i}>
                                            <td>{bond.symbol}</td>
                                            <td>{bond.name}</td>
                                            <td>{bond.price}</td>
                                            <td>{bond.roi}</td>
                                            <td>{bond.purchased}</td>
                                            <td>
                                                <button className="uk-button uk-button-default">Mint</button>
                                            </td>
                                        </tr>
                                    )
                                }
                            )
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </Main>
}
export default OperationBonding
