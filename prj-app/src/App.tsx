import type { Component } from "solid-js";

import Nav from "./lib/Nav";

const App: Component = (props: any) => {
	return (
		<>
			<Nav />
			<div class='py-[4.5rem]'>
				{props.children}
			</div>
		</>
	);
};

export default App;
