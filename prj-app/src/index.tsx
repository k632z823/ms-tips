/* @refresh reload */
import { Router, Route } from "@solidjs/router";
import { render } from "solid-js/web";

import "./index.css";
import Overview from "./pages/Overview";
import Entries from "./pages/Entries";
import Archive from "./pages/Archive";
import Settings from "./pages/Settings";
import Nav from "./lib/Nav";
import App from "./App";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		"Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
	);
}

render(
	() => (
		<Router root={App}>
			<Route
				path='/'
				component={Overview}
			/>
			<Route
				path='/Entries'
				component={Entries}
			/>
			<Route
				path='/Archive'
				component={Archive}
			/>
			<Route
				path='/Settings'
				component={Settings}
			/>
		</Router>
	),
	root!,
);
