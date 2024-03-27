import type { Component } from "solid-js";
import Nav from "../lib/Nav";
import DateDisplay from "../lib/DateDisplay";

const Overview: Component = () => {
	return (
		<>
		<div class=''>
			<br></br>
			<br></br>
			<br></br>
			<h1>Overview page</h1>
			<br></br>
			<br></br>
			<DateDisplay></DateDisplay>
		</div>
		</>
	);
};

export default Overview;
