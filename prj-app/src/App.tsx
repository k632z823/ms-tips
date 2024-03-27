import type { Component } from "solid-js";
import { Router, Route, A } from "@solidjs/router";

import Nav from "./lib/Nav";

import Overview from "./pages/Overview";
import Entries from "./pages/Entries";
import Archive from "./pages/Archive";

const App: Component = () => {
	return (
		<>
			<Nav></Nav>
			<br></br>
			<br></br>
			<br></br>

			<header>
				<a href='/Entries'> Click Me</a>
			</header>
		</>
	);
};

export default App;
