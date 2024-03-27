import type { Component } from "solid-js";
import Nav from "../lib/Nav";
import DateDisplay from "../lib/DateDisplay";

const Overview: Component = () => {
	return (
		<>
			<br></br>
			<br></br>
			<br></br>
			<h1>Overview page</h1>
			<br></br>
			<br></br>
			<DateDisplay></DateDisplay>
		</>
	);
};

export default Overview;
