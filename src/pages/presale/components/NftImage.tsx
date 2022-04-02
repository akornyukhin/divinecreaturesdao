import * as React from "react"
import { INftData } from "../utils/nftDataLoader"
import { DivineTiers } from "../../../helpers/types"


export interface INftImageProps {
    nftData: INftData;
}

export const NftImage = ({ nftData }: INftImageProps) => {
    const borderStyle = nftData.loadedData.quality === DivineTiers.GOD ? " border-gold"
        : nftData.loadedData.quality === DivineTiers.DEITY ? " border-silver"
            : " border-bronze"
    return <div className="uk-inline-clip uk-transition-toggle" data-uk-tabindex="0">
        <img id={`${nftData.tokenId}`} className={"uk-width-expand uk-transition-scale-up uk-transition-opaque nft-image" + borderStyle}
             data-src={nftData.loadedData.preview} alt={`${nftData.loadedData.name} #${nftData.tokenId}`}
             data-srcset={[nftData.loadedData.preview300 + " 300w",
                 nftData.loadedData.preview450 + " 450w",
                 nftData.loadedData.preview750 + " 750w"
             ]}
             // data-sizes="(min-width: 900px) 300px, (min-width: 1600px) 450px, (min-width: 2100px) 750px, 100vw"
             data-width="300px" data-height="300px"  data-uk-img="" />
    </div>
}
