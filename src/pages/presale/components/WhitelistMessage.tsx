import { sectionClass } from "../../../helpers/utils"
import { PresaleCountdown } from "./PresaleCountdown"
import * as React from "react"

interface IWhitelistMessageProps {
    readonly nftPriceAdjusted: number;
}

export const WhitelistMessage = ({ nftPriceAdjusted }: IWhitelistMessageProps) =>
    <div>
        <div className={sectionClass + "uk-margin-medium-top uk-padding-small uk-padding-remove-top"}>
            <h1 className="uk-h1">Whitelist Mint Starts at 00:00 UTC</h1>
        </div>
        <div
            className="uk-flex uk-flex-center uk-light uk-grid uk-grid-small uk-flex-center uk-text-center uk-grid-match uk-padding-small">
            <div className="uk-flex uk-flex-column uk-width-2-3 ">
                <PresaleCountdown time="date: 2022-01-24T00:00:00+00:00" />
                <div>
                    {`Whitelist allows you to purchase 1 Demigod Creature NFT without auction at a fixed price of ${nftPriceAdjusted} FTM. ` +
                    "Your NFT will be your ticket to purchase up to 420 FTM worth of EGIS and will give you 2.5% Bonding Boost."}
                </div>
            </div>
        </div>
    </div>

export const AuctionMessage = ({ nftPriceAdjusted }: IWhitelistMessageProps) => <div>
    <div className={sectionClass + "uk-margin-medium-top uk-padding-small uk-padding-remove-top"}>
        <h1 className="uk-h1">Public Sale Starts on 25 January at 16:00 UTC</h1>
    </div>
    <div
        className="uk-flex uk-flex-center uk-light uk-grid uk-grid-small uk-flex-center uk-text-center uk-grid-match uk-padding-small">
        <div className="uk-flex uk-flex-column uk-width-2-3 ">
            <PresaleCountdown time="date: 2022-01-25T16:00:00+00:00" />
            <div>
                24 January 16:00 UTC we launch God Tier NFT auction, followed by 25 January when we launch Deity Tier
                NFT and 27
                January when we launch Demigod Tier. Watch out for announcements in Discord.
            </div>
        </div>
    </div>
</div>
