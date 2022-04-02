import { IMetrics } from "../../helpers/stateLoader"
import LandingHeader from "./LandingHeader"
import LandingMain from "./LandingMain"

interface ILandingProps {
    metrics: IMetrics | undefined
}

const Landing = ({ metrics }: ILandingProps) => {
    return <div id="page" className="uk-background-cover uk-height-viewport">
        <LandingHeader />
        <LandingMain metrics={metrics} />
        <footer></footer>
    </div>
}
export default Landing
