import * as React from "react"
import { OwnProviderState } from "../../../helpers/provider"
import { IContracts } from "../../../helpers/state"
import { ConnectedState } from "../ConnectedPage"
import { NftGridWhitelist } from "./NftGridWhitelist"
import { LoadedCard } from "./LoadedCard"

export interface IOwnNFTsProps {
    own: OwnProviderState;
    contracts: IContracts;
    connectedState: ConnectedState;
    reload: () => Promise<void>;
}

export const OwnNFTs = ({ connectedState }: IOwnNFTsProps) =>
    <NftGridWhitelist tokenIds={connectedState.ownTokenIds}>
        { props => <LoadedCard nftData={props.tokenId[1]} /> }
    </NftGridWhitelist>
