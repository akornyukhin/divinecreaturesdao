import * as React from "react"

import { AppContextData } from "../../components/AppContext"
import { NotConnected } from "./components/NotConnected"
import { ConnectedPage } from "./ConnectedPage"
import { AllNFTs } from "./components/AllNFTs"
import ignores from "../../static/ignores.json"
import overridesRaw from "../../static/overrides.json"
import { LotOverride } from "../../helpers/types"


interface IAuctionProps {
    appContextData: AppContextData
}

const overrides: LotOverride[] = overridesRaw.map(({auctionIndex, lotId, tokenID, currentOwner, txn}) =>
    ({
        overrideAuctionIndex: auctionIndex,
        overrideLotId: lotId,
        overrideTokenId: tokenID,
        overrideOwner: currentOwner,
        explorerCompletionUri: txn
    }))

const AuctionPage = ({ appContextData }: IAuctionProps) => {
    const connected = !!(appContextData.providerState?.address) && !!(appContextData.contracts)
    return <main className="uk-flex uk-flex-column" data-uk-height-viewport="offset-top: true">
        <div>
            {connected
                ? <ConnectedPage own={appContextData.providerState!} contracts={appContextData.contracts!}>
                    {
                        props => <AllNFTs { ...props } overrides={overrides} ignores={ignores} />
                    }
                </ConnectedPage>
                : <div className="uk-flex uk-flex-column uk-flex-center" data-uk-height-viewport="offset-top: true">
                    <NotConnected appContextData={appContextData} />
                </div>
            }
        </div>
    </main>
}

export default AuctionPage
