import TipConfigBar from "./TipConfigBar";
import { Component } from "solid-js";

export interface TipConfigProps {
	tipTotal: number;
}

const TipConfig: Component<TipConfigProps> = (props: TipConfigProps) => {
	return (
		<>
			<TipConfigBar tipTotal={400}></TipConfigBar>
		</>
	);
};

export default TipConfig;
