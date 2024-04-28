import { Component, Show, onMount } from "solid-js";
import Nav from "../lib/Nav";
import EntryDisplay from "../lib/TipEntries";
import { useParams } from "@solidjs/router";

const Entries: Component = () => {
	let showConfigValue;
	const params = useParams();

	return (
		<>
			<EntryDisplay entryDate={params.id}></EntryDisplay>
		</>
	);
};

export default Entries;
