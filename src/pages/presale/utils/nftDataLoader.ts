import { DivineCreature } from "../../../typechain"
import axios from "axios"

interface INftLoadedData2 {
    collection: string,
    name: string,
    quality: number,
    image: string,
    preview750: string,
    preview450: string,
    preview300: string,
}

interface INftLoadedData extends INftLoadedData2 {
    preview: string
}

export interface INftData {
    tokenId: number,
    tokenUri: string,
    loadedData: INftLoadedData
}

export const loadNftData = async (nft: DivineCreature, tokenId: number): Promise<INftData | undefined> => {
    for (let i = 0; i < 10; i++) {
        try {
            const tokenUri = (await nft.tokenURI(tokenId))
            const { data } = await axios.get(tokenUri)

            const l = data as INftLoadedData2

            const nftLoaded = {
                tokenId,
                tokenUri,
                loadedData: { ...l, preview: l.preview750 }
            }

            return nftLoaded
        }
        catch (e) {
            console.error(e)
        }
    }
    return undefined
}
