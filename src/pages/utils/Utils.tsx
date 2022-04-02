import { loadedAddresses } from "../../helpers/state"
import { RPC_HOST } from "../../helpers/provider"

const Utils = () => {
    return <div id="page" className="uk-background-cover uk-height-viewport">
        <p>{RPC_HOST}</p>
        <p>
            {JSON.stringify(loadedAddresses, null, 4)}
        </p>
    </div>
}
export default Utils
