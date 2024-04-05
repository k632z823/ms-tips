import { Component } from "solid-js";
import { type TipConfigProps } from "./TipConfig";

const TipConfigBar: Component<TipConfigProps> = (props: TipConfigProps) => {
	return (
		<>
			<div>tip total = {props.tipTotal}</div>
		</>
	);
};

export default TipConfigBar;
