import { Component } from "solid-js";

interface TipConfigProps {
	tip_total: number;
	tip_rate: number;
}

const TipConfigBar: Component<TipConfigProps> = (props: TipConfigProps) => {
	return (
		<>
			<div>tip total = {props.tip_total}</div>
			<div>tip rate = {props.tip_rate}</div>
		</>
	);
};

export default TipConfigBar;
