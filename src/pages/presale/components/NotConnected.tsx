import { AppContextData } from "../../../components/AppContext"
import * as React from "react"

interface INotConnectedProps {
    appContextData: AppContextData;
}

export const NotConnected = ({ appContextData }: INotConnectedProps) => <div>
    <div className="uk-flex-column uk-text-center uk-padding-small uk-light" data-uk-grid>
        <h2 className="uk-h2">Please connect your Wallet</h2>
        <div>
            <button className="uk-button uk-button-default nav-button-inverted"
                    onClick={appContextData.connect}>{"Connect Wallet"}</button>
        </div>
    </div>
</div>
