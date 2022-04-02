import * as React from "react"
import { INftData } from "../utils/nftDataLoader"
import { INftImageProps } from "./NftImage"

export interface INftSliderProps {
    tokenIds: number[];
    nftDatas: Map<number, INftData>;
    imageRenderer: (props: INftImageProps) => JSX.Element;
}

export const NftSlider = ({ tokenIds, nftDatas, imageRenderer }: INftSliderProps) =>
    <div className="uk-position-relative uk-visible-toggle uk-light uk-padding-small "
         data-tabindex="-1" data-uk-slider="sets: true, finite: false">
        <ul className="uk-slider-items uk-child-width-1-2 uk-child-width-1-3@m uk-align-center">
            {
                tokenIds.map((tokenId, i) =>
                    <li className="uk-padding-small" key={tokenId}>
                        {imageRenderer({ nftData: nftDatas.get(tokenId)! })}
                    </li>)
            }
        </ul>

        <a className="uk-position-center-left uk-position-small uk-hidden-hover" href="#" data-uk-slidenav-previous
           data-uk-slider-item="previous"></a>
        <a className="uk-position-center-right uk-position-small uk-hidden-hover" href="#" data-uk-slidenav-next
           data-uk-slider-item="next"></a>
    </div>
