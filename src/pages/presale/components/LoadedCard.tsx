import * as React from "react"
import { ReactNode} from "react"
import { NftImage } from "./NftImage"
import { INftData } from "../utils/nftDataLoader"
import { QualitySection } from "./QualitySection"

export interface ILoadedCardProps {
    nftData: INftData
    children?: ReactNode
}
export const LoadedCard = ({ nftData, children } : ILoadedCardProps) => <div className="uk-card uk-card-default uk-card-hover uk-animation-fade">
    <div className="uk-card-media-top">
        <NftImage nftData={nftData} />
    </div>
    <div className="uk-card-body uk-grid-small uk-flex-middle uk-padding-small uk-grid">
        <div className="uk-width-expand">
            <h4 className="uk-card-title uk-margin-remove-bottom uk-text-bolder">{nftData!!.loadedData.name}
                <i>#</i>{nftData.tokenId}</h4>
            <QualitySection quality={nftData.loadedData.quality} />
            {!!children ? children : <span />}
        </div>
    </div>
</div>
