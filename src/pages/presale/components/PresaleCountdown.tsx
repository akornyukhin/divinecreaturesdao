import * as React from "react"

interface IPresaleCountdownProps {
    time: string;
}

export const PresaleCountdown = ({ time }: IPresaleCountdownProps) => <div className="uk-flex uk-flex-center">
    <div className="uk-grid uk-grid-small uk-child-width-auto uk-margin-bottom"
         data-uk-countdown={time}>
        <div>
            <div className="uk-countdown-number uk-countdown-days"></div>
            <div className="uk-countdown-label uk-margin-small uk-text-center uk-visible@s">Days</div>
        </div>
        <div className="uk-countdown-separator">:</div>
        <div>
            <div className="uk-countdown-number uk-countdown-hours"></div>
            <div className="uk-countdown-label uk-margin-small uk-text-center uk-visible@s">Hours</div>
        </div>
        <div className="uk-countdown-separator">:</div>
        <div>
            <div className="uk-countdown-number uk-countdown-minutes"></div>
            <div className="uk-countdown-label uk-margin-small uk-text-center uk-visible@s">Minutes</div>
        </div>
        <div className="uk-countdown-separator">:</div>
        <div>
            <div className="uk-countdown-number uk-countdown-seconds"></div>
            <div className="uk-countdown-label uk-margin-small uk-text-center uk-visible@s">Seconds</div>
        </div>
    </div>
</div>
