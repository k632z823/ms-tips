/* @refresh reload */
import { Router, Route, useNavigate } from "@solidjs/router";
import { render } from "solid-js/web";
import { createSignal, createEffect, onMount, JSX } from "solid-js";
import "./index.css";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import Entries from "./pages/Entries";
import Archive from "./pages/Archive";
import Settings from "./pages/Settings";
import Nav from "./lib/Nav";
import App from "./App";

const [isAuthenticated, setIsAuthenticated] = createSignal(false);

// Fake login check
function checkLoginStatus() {
	return localStorage.getItem("isLoggedIn") === "true";
}

// Initialize login status on mount
onMount(() => {
	if (checkLoginStatus()) {
		setIsAuthenticated(true);
	}
});

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		"Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
	);
}

// Redirects to login page
function RedirectToLogin() {
	const navigate = useNavigate();

	createEffect(() => {
		navigate("/login", { replace: true });
	});

	return null;
}

// If not logged in, prevent other pages from rendering
function ProtectedRoute({ component: Component }: { component: (props: any) => JSX.Element }) {
	const navigate = useNavigate();

	if (!isAuthenticated()) {
		navigate("/login");
		return null;
	}

	return <Component />;
}

render(
	() => (
		<Router root={App}>
			<Route
				path="/"
				component={RedirectToLogin}
			/>
			<Route
				path='/login'
				component={Login}
			/>
			{/* Protect the following routes */}
			<Route
				path='/Overview'
				component={() => <ProtectedRoute component={Overview} />}
			/>
			<Route
				path='/Entries/:date'
				component={() => <ProtectedRoute component={Entries} />}
			/>
			<Route
				path='/Archive'
				component={() => <ProtectedRoute component={Archive} />}
			/>
			<Route
				path='/Settings'
				component={() => <ProtectedRoute component={Settings} />}
			/>
		</Router>
	),
	root!
);
