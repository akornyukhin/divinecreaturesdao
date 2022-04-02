import * as React from "react"
import { ReactNode } from "react"
import { LotId} from "../../../helpers/types"

export interface INftGridChildProps {
    lotId: LotId
    childrenClassName: string
}

export interface INftGridProps {
    lotIds: LotId[];
    children: (props: INftGridChildProps) => ReactNode;
}

export const NftGrid = ({ lotIds, children }: INftGridProps) => {
    const sizeClass = lotIds.length <= 3
        ? "uk-width-medium uk-width-medium@s uk-width-medium@m uk-width-large@l uk-width-large@xl"
        : "uk-width-medium uk-width-medium@s uk-width-medium@m uk-width-medium@l uk-width-medium@xl"
    return <div
        className="uk-flex uk-flex-center uk-child-width-1-2@s uk-child-width-1-3@m uk-child-width-1-4@l uk-child-width-1-5@xl"
        data-uk-height-match="target: > div > .uk-card" data-uk-grid>
        {
            lotIds.map((lotId) => children({ lotId, childrenClassName: `uk-padding-small ${sizeClass}`} ))
        }
    </div>
}
