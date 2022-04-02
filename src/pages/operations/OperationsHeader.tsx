import { AppContextData } from "../../components/AppContext"
import { addFantomToMetamask, chainName } from "../../helpers/utils"
export interface IOperationsHeaderProps {
    appContextData: AppContextData
}

const OperationsHeader = ({ appContextData }: IOperationsHeaderProps) => {
    const connected = !!appContextData.providerState?.address
    return <header>
        <nav className="uk-navbar-container uk-navbar-transparent uk-light" data-uk-navbar>
            <div className="uk-navbar-right">
                {/*<div>Protocol is not live yet. Website is just a preview.</div>*/}
                {/*<div>{appContextData.providerState?.address}</div>*/}
                {/*<div className="uk-navbar-item">*/}
                {/*	<div className="uk-button uk-button-primary nav-button">Buy EGIS</div>*/}
                {/*</div>*/}
                {/* <div className="uk-navbar-item">
					<Link className="uk-button uk-button-secondary nav-button" to="/app/wrap">Wrap</Link>
				</div> */}
                {/*<div className="uk-navbar-item">*/}
                {/*	<Link className="uk-button uk-button-secondary nav-button" to="/app/nft">NFT</Link>*/}
                {/*</div>*/}
                <div className="uk-navbar-item">
                    {connected && (appContextData.providerState?.network.chainId !== appContextData.contracts?.chainID) &&
                        <button
                        className="uk-button uk-button-default nav-button-alert"
                        onClick={() => addFantomToMetamask(appContextData)}>
                            Switch to {chainName(appContextData)}
                        </button>
                    }
                    <button className="uk-button uk-button-default nav-button-inverted"
                            onClick={connected ? appContextData.disconnect : appContextData.connect}>{connected ? "Disconnect" : "Connect Wallet"}</button>
                </div>
            </div>
        </nav>
    </header>
}
export default OperationsHeader
