import * as React from "react"
import { Link } from "react-router-dom"

import { AppContextData } from "../../components/AppContext"
import { buttonClass, sectionClass } from "../../helpers/utils"

interface IWhitelistProps {
    appContextData: AppContextData
}

const PageNotFound = () =>
    <main className="uk-flex uk-flex-column uk-flex-center" data-uk-height-viewport="offset-top: true">
        <div>
            <div className={sectionClass + "uk-margin-medium-top uk-padding-small uk-padding-remove-top"}>
                <h1 className="uk-h1">Page Not Found</h1>
                <Link className={buttonClass} to="/">Return To Main Page</Link>
            </div>
        </div>
    </main>

export default PageNotFound
