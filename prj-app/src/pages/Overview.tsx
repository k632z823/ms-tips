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
				<OverviewEntries/>
			</div>
		</>
	);
};

export default Overview;
