export interface IChainInfoItem {
	title: string
	value: string
}

export const ChainInfoItem = (props: IChainInfoItem) =>
	<dl className="uk-description-list uk-light">
		<dt className="uk-text-center evil-text">{props.title}</dt>
		<dd><h6 className="uk-heading-small evil-text">{props.value}</h6></dd>
	</dl>

export const ChainInfoItem2 = (props: IChainInfoItem) =>
    <div className="uk-text-center uk-tile uk-tile-secondary uk-padding-small">
        <h4 className="uk-h4">{props.title}</h4>
        <h2 className="uk-h2 uk-margin-remove-top">{props.value}</h2>
    </div>


export default ChainInfoItem