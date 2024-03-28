import type { Component } from "solid-js";

import Nav from "./lib/Nav";

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
