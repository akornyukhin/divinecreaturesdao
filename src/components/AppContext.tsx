import React, {  } from "react";

import { OwnProviderState } from '../helpers/provider';
import { IContracts } from "../helpers/state";
import { IMetrics } from "../helpers/stateLoader";

export type AppContextData = {
    providerState: OwnProviderState | undefined
    // addresses: IAddresses | undefined
	contracts: IContracts | undefined
    metrics: IMetrics | undefined
    connect: () => Promise<void>
    disconnect: () => Promise<void>
}

export const AppContext = React.createContext<AppContextData>({
    providerState: undefined,
    // addresses: undefined,
	contracts: undefined,
    metrics: undefined,
    connect: async () => {},
    disconnect: async () => {}
});

export default AppContext
