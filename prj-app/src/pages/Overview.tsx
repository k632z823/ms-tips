import type { Component } from "solid-js";
import Nav from "../lib/Nav";
import DateDisplay from "../lib/DateDisplay";
import OverviewEntries from "../lib/OverviewEntries";

const Overview: Component = () => {
	return (
		<>
			<div class='pb-5 text-sm font-light'>
				<DateDisplay/>
			</div>
			<div class='text-sm font-light'>
				<OverviewEntries drawer={289.54} tips={97.32} final={601.85} tipRate={9.50}/>
			</div>
		</>
	);
};

export default Overview;
