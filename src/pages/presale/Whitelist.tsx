import * as React from "react"

import { AppContextData } from "../../components/AppContext"
import { NotConnected } from "./components/NotConnected"
import { ConnectedPage } from "./ConnectedPage"
import { Sale } from "./Sale"
import { OwnNFTs } from "./components/OwnNFTs"
import { AuctionMessage } from "./components/WhitelistMessage"

interface IWhitelistProps {
    appContextData: AppContextData
}

const Whitelist = ({ appContextData }: IWhitelistProps) => {
    const connected = !!(appContextData.providerState?.address) && !!(appContextData.contracts)
    return <main className="uk-flex uk-flex-column uk-flex-center" data-uk-height-viewport="offset-top: true">
        <div>
            {connected
                ? <ConnectedPage own={appContextData.providerState!} contracts={appContextData.contracts!}>
                    {
                        props =>
                            props.connectedState.eligible
                            ? props.connectedState.ownTokenIds.length === 0
                                ? <Sale {...props} />
                                : <OwnNFTs {...props} />
                            : <AuctionMessage nftPriceAdjusted={props.connectedState.nftPriceAdjusted} />
                    }
                </ConnectedPage>
                : <NotConnected appContextData={appContextData} />}
        </div>
    </main>
}

export default Whitelist
