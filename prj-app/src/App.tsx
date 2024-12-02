import type { Component } from "solid-js";

import Nav from "./lib/Nav";

const App: Component = (props: any) => {
	return (
		<>
			<div class='select-none'>
				<Nav />
			</div>
			<div class='pt-[4.5rem]'>
				{props.children}
			</div>
		</>
	);
};

export default App;
