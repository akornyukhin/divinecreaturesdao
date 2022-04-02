import WalletConnectProvider from '@walletconnect/web3-provider'
import { ethers, providers } from "ethers"
import addresses from '../static/addresses.json'

import Web3Modal from "web3modal"
import { IAddresses } from "./state"

export type EthProvider = ethers.Signer | ethers.providers.Provider

export type Providers = {
  readonly default: ethers.providers.JsonRpcProvider
  readonly own: () => OwnProviderState | undefined
  readonly connect: () => Promise<OwnProviderState>
  readonly update: () => Promise<OwnProviderState>
  readonly disconnect: () => Promise<void>
}

export type OwnProviderState = {
  provider: any
  web3Provider: ethers.providers.Web3Provider
  cachedProvider: any
  signer: ethers.providers.JsonRpcSigner
  network: ethers.providers.Network
  address: string | undefined
  chainId: number
}

// const RPC_HOST = 'https://rpc.testnet.fantom.network/'
// export const RPC_HOST = 'http://localhost:8545'
// export const RPC_HOST = 'http://localhost:7545'
// const RPC_HOST = 'http://127.0.0.1:8545'

const loadedAddresses = (addresses as IAddresses)
export const RPC_HOST = loadedAddresses.rpc

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: Object.fromEntries([[loadedAddresses.chainId, loadedAddresses.rpc]]),
      qrcode: true,
      qrcodeModalOptions: {
        mobileLinks: [
          "metamask",
          "trust"
        ]
      }
    }
  }
}
const web3Modal = new Web3Modal({
  // network: 'mainnet', // optional
  cacheProvider: true,
  providerOptions, // required
  theme: {
    background: "#0a036c",
    main: "white",
    secondary: "white",
    border: "#13728b",
    hover: "#040223"
  }
})

export const hasCachedProvider = !!web3Modal.cachedProvider

let providerState: OwnProviderState | undefined = undefined
const connect = async () => {
  // This is the initial `provider` that is returned when
  // using web3Modal to connect. Can be MetaMask or WalletConnect.
  const provider = await web3Modal.connect()

  // We plug the initial `provider` into ethers.js and get back
  // a Web3Provider. This will add on methods from ethers.js and
  // event listeners such as `.on()` will be different.
  const web3Provider = new providers.Web3Provider(provider)

  const signer = web3Provider.getSigner()
  const address = await signer.getAddress()

  const network = await web3Provider.getNetwork()

  const state = {
    provider,
    web3Provider,
    cachedProvider: web3Modal.cachedProvider,
    signer,
    network,
    address,
    chainId: network.chainId
  }

  providerState = state

  return state
}

const update = async () => {
  if (!providerState) return connect()

  const signer = providerState.web3Provider.getSigner()
  const address = await signer.getAddress()

  const network = await providerState.web3Provider.getNetwork()

  const state = {
    ...providerState,
    cachedProvider: web3Modal.cachedProvider,
    address,
    chainId: network.chainId
  }

  providerState = state

  return state
}

const disconnect = async () => {
  web3Modal.clearCachedProvider()
  if (providerState?.provider?.disconnect && typeof providerState?.provider.disconnect === 'function') {
    await providerState.provider.disconnect()
  }
  providerState = undefined
}

let _providers: Providers | undefined
export const getProviders = (): Providers => {

  if (!_providers) {

    const provider = new ethers.providers.JsonRpcProvider(RPC_HOST)

    _providers = {
      default: provider,
      own: () => providerState,
      connect,
      update,
      disconnect
    }
  }

  return _providers
}

export default getProviders
