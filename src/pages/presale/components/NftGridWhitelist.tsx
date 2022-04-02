import { INftData } from "../utils/nftDataLoader"
import * as React from "react"
import { ReactNode } from "react"

export interface INftGridChildWhitelistProps {
    tokenId: [number, INftData]
}

export interface INftGridWhitelistProps {
    tokenIds: [number, INftData][]
    children: (props: INftGridChildWhitelistProps) => ReactNode
}

export const NftGridWhitelist = ({ tokenIds, children }: INftGridWhitelistProps) => {
    const sizeClass = tokenIds.length <= 3
        ? "uk-width-medium uk-width-medium@s uk-width-medium@m uk-width-large@l uk-width-large@xl"
        : "uk-width-medium uk-width-medium@s uk-width-medium@m uk-width-medium@l uk-width-medium@xl"
    return <div
        className="uk-flex uk-flex-center uk-child-width-1-2@s uk-child-width-1-3@m uk-child-width-1-4@l uk-child-width-1-5@xl"
        data-uk-height-match="target: > div > .uk-card" data-uk-grid>
        {
            tokenIds
                .map((tokenId, i) =>
                    <div
                        className={`uk-padding-small ${sizeClass}`}
                        key={i}>
                        {children({ tokenId })}
                    </div>)
        }
    </div>
}
