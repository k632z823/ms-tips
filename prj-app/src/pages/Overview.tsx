import type { Component } from "solid-js";
import Nav from "../lib/Nav";
import DateDisplay from "../lib/DateDisplay";
import OverviewEntries from "../lib/OverviewEntries";

const Overview: Component = () => {
	return (
		<>
			<br></br>
			<br></br>
			<br></br>
			<h1>Overview page</h1>
			<br></br>
			<br></br>
			<div class="flex gap-10">
				<DateDisplay/>
				<OverviewEntries drawer={50} tips={30} final={80} tipRate={25}/>
			</div>
			<br></br>
			<br></br>
		</>
	);
};

export default Overview;
