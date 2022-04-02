import React, { useCallback, useEffect, useState } from "react"
import "./App.scss"

import UIkit from "uikit"
// @ts-ignore
import Icons from "uikit/dist/js/uikit-icons.js"

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Landing from "./pages/landing/Landing"

import Operations from "./pages/operations/Operations"
import { createContracts, IContracts } from "./helpers/state"
import AppContext, { AppContextData } from "./components/AppContext"
import getProviders, { hasCachedProvider, OwnProviderState } from "./helpers/provider"
import { IMetrics, loadState } from "./helpers/stateLoader"
import Utils from "./pages/utils/Utils"
import ProjectOverview from "./pages/overview/ProjectOverview"
import MobilePlaceholder from "./pages/utils/MobilePlaceholder"
import GodsOverview from "./pages/overview/GodsOverview"

import {isMobile} from 'react-device-detect';
import Crowdsale from "./pages/presale/Crowdsale"


// @ts-ignore
UIkit.use(Icons)

const App = () => {
    const providers = getProviders()

    const [state, setState] = useState<OwnProviderState | undefined>(undefined)
    const [contracts, setContracts] = useState<IContracts | undefined>(undefined)
    const [metrics, setMetrics] = useState<IMetrics | undefined>(undefined)

    const connect = useCallback(async function() {
        const own = providers.own()
        const st = own ? own : await providers.connect()

        // Subscribe to accounts change
        st.provider.on("accountsChanged", (accounts: string[]) => {
            console.log(`Accounts changes to: '${accounts}'`)
            if (accounts && accounts.length > 0) {
                providers.update().then(state => setState(state))
            } else {
                console.log(`Disconnecting ...`)
                disconnect()
            }
        })

        // Subscribe to chainId change
        st.provider.on("chainChanged", (chainId: number) => {
            console.log(`Chain changed to '${chainId}' reloading page as recommended in: 'https://docs.ethers.io/v5/concepts/best-practices/#best-practices--network-changes'`)
            setTimeout(() => window.location.reload())
        })

        // Subscribe to provider connection
        st.provider.on("connect", (info: { chainId: number }) => {
            console.log(`Connected to chain: '${info.chainId}'`)
            connect()
        })

        // Subscribe to provider disconnection
        st.provider.on("disconnect", (error: { code: number; message: string }) => {
            console.log(`Disconnected with error: '${error}'`)
            disconnect()
        })
        setState(st)
    }, [])

    const disconnect = useCallback(
        async function() {
            const own = providers.own()
            if (own) await providers.disconnect()
            setState(undefined)
        },
        [providers]
    )

    useEffect(() => {
            const load = async () => {
                const contracts = createContracts(providers.default)
                setContracts(contracts)
                await calculateNumbers(contracts)
                // console.log("created contracts")
            }
            load()
        },
        [providers]
    )

    // Auto connect to the cached provider
    useEffect(() => {
        if (hasCachedProvider) {
            connect()
        }
    }, [providers])

    const calculateNumbers = async (contracts: IContracts | undefined) => {
        if (contracts) {
            // await loadTokenPrices()
            const loadedState = await loadState(contracts, providers.default)
            setMetrics(loadedState)
        }
    }

    const appContextData: AppContextData = { providerState: state, contracts, metrics, connect, disconnect }

	if (isMobile) {
		return <MobilePlaceholder />
	} else {
		return <AppContext.Provider value={appContextData}>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<ProjectOverview />} />
					<Route path="/app" element={<Operations page="dashboard" appContextData={appContextData} />} />
					<Route path="/app/staking" element={<Operations page="staking" appContextData={appContextData} />} />
					<Route path="/app/mint" element={<Operations page="mint" appContextData={appContextData} />} />
					<Route path="/app/calculator" element={<Operations page="calculator" appContextData={appContextData} />} />
					<Route path="/app/egis" element={<Operations page="egis" appContextData={appContextData} />} />
					{/* <Route path="/app/wrap" element={<Operations page="wrap" appContextData={appContextData} />} /> */}
                    {/* <Route path="/app/bridge" element={<Operations page="bridge" appContextData={appContextData} />} /> */}
                    {/*<Route path="/presale" element={<Operations page="presale" appContextData={appContextData} />} />*/}
                    {/* <Route path="/app/auction" element={<Operations page="auction" appContextData={appContextData} />} /> */}
                    <Route path="/auction" element={<Operations page="auction" appContextData={appContextData} />} />
                    {/* <Route path="/app/crowdsale" element={<Operations page="crowdsale" appContextData={appContextData} />} /> */}
                    <Route path="/crowdsale" element={<Operations page="crowdsale" appContextData={appContextData} />} />
                    <Route path="/utils" element={<Utils />} />
                    <Route path="/overview" element={<ProjectOverview />} />
                    <Route path="/godsoverview" element={<GodsOverview />} />
				</Routes>
			</BrowserRouter>
		</AppContext.Provider>
	}

}

export default App
