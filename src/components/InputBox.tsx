import * as React from "react"

interface IInputBoxProps {
    readonly label: string | undefined
    readonly value: number
    readonly onChange: (e: number) => void
    readonly buttonText: string
    readonly onButtonClick: () => void
}

export const InputBox = (props: IInputBoxProps) => {
    const [state, setState] = React.useState("")
    return <div className="uk-margin">
        {!!props.label ? <label className="uk-form-label" htmlFor="form-input-text">{props.label}</label> : null}
        <div className="uk-form-controls">
            <div className="uk-inline uk-width">
                { !!props.buttonText && props.buttonText.length > 0
                    ?
                    <a className="uk-form-icon uk-form-icon-flip in-input-button" href="#"
                       onClick={() => props.onButtonClick()}>{props.buttonText}</a>
                    : null
                }
                <input className="uk-input" id="form-input-text" type="number" min="0"
                           value={Number(Math.round(props.value * 100)/100).toString()} //step={0.01} // toString() is to  is to remove leading zeros
                           onChange={e => {
                               const floatRegExp = new RegExp('^([0-9]+([.][0-9]{0,2})?|[.][0-9]+)$')
                               const v = e.target.value
                               if (v === '' || floatRegExp.test(v)) {
                                   props.onChange(Number(e.target.value))
                               }
                           }} />
            </div>
        </div>
    </div>
}