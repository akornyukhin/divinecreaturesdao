import * as React from "react"
import { useEffect } from "react"
import { timeDiffFormat } from "../../../helpers/utils"
import { textBannerClass } from "./AllNFTs"

export interface TimeCountdownProps {
    timeToEnd: number
    children: JSX.Element
}

export const TimeCountdown = ({ timeToEnd, children }: TimeCountdownProps) => {
    interface State {
        timeToEnd: number
        text: string
    }

    const [state, setState] = React.useState<State>({ timeToEnd, text: timeDiffFormat(timeToEnd) })

    if (timeToEnd != state.timeToEnd) {
        setState({ ...state, timeToEnd })
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setState({ ...state, text: timeDiffFormat(state.timeToEnd) })
        }, 1000)

        return () => clearInterval(interval)
    })

    return state.text.length > 0 && timeToEnd > 0
        ? <div>
            <div>{state.text}</div>
            {children}
        </div>
        : <div className={textBannerClass + "uk-text-muted uk-text-italic"}>Pending ...</div>
}
