interface IMetricValueProps<T> {
	title: string
	value: T | undefined
	format: (v: T) => string
    className?: string
    titleclassName?: string
}

export const MetricValue = <T extends {}>(props: IMetricValueProps<T>) =>
	<div className={props.className ?? "uk-text-center uk-overflow-hidden evil-text "}>
		<h4 className={props.titleclassName ?? "uk-h4 evil-text"}>{props.title}</h4>
		{props.value ? <h2 className="uk-h2 uk-margin-remove-top evil-text">{props.format(props.value)}</h2> : <div data-uk-spinner></div>}
	</div>

export const MetricCard = <T extends {}>(props: IMetricValueProps<T>) =>
	MetricValue({ ...props, className: "uk-text-center uk-card uk-card-primary uk-card-body uk-card-small uk-margin-left uk-overflow-hidden uk-box-shadow-small evil-text" })
