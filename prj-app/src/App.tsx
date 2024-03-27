import type { Component } from "solid-js";

import Nav from "./lib/Nav";

import Overview from "./pages/Overview";
import Entries from "./pages/Entries";
import Archive from "./pages/Archive";

const App: Component = (props: any) => {
	return (
		<>
			<Nav></Nav>
			<br></br>
			<br></br>
			<br></br>

			{props.children}
		</>
	);
};

export default App;
