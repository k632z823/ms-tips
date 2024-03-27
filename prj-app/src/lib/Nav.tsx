import type { Component } from "solid-js";

import overviewIcon from "../logos/overview-icon.svg";
import entriesIcon from "../logos/entries-icon.svg";
import archiveIcon from "../logos/archive-icon.svg";
import settingsIcon from "../logos/settings-icon.svg";
import logoutIcon from "../logos/logout-icon.svg";

import Navbar from "./Navbar";

const Nav: Component = () => {
	return (
		<Navbar
			items={[
				{
					group: "dropdown",
					label: "Overview",
					icon: overviewIcon,
					path: "/",
				},
				{
					group: "dropdown",
					label: "Entries",
					icon: entriesIcon,
					path: "/Entries",
				},
				{
					group: "dropdown",
					label: "Archive",
					icon: archiveIcon,
					path: "/Archive",
				},
				{
					group: "profile",
					label: "Settings",
					icon: settingsIcon,
					path: "/Settings",
				},
				{
					group: "profile",
					label: "Logout",
					icon: logoutIcon,
					path: "/logout",
				},
			]}
			onClickNav={(path: string) => {}}
		/>
	);
};

export default Nav;
