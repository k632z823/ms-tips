import { Component, Show, onMount } from "solid-js";
import Nav from "../lib/Nav";
import EntryDisplay from "../lib/TipEntries";
import { useParams } from "@solidjs/router";

const Entries: Component = () => {
	let showConfigValue;
	const params = useParams();

	return (
		<>
			<div class='pb-[1.5rem]'>
				<EntryDisplay
					entryDate={params.date}
					entryNoProp={params.entry_no}
				></EntryDisplay>
			</div>
		</>
	);
};

export default Entries;
