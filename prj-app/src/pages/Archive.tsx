import type { Component } from "solid-js";
import Nav from "../lib/Nav";
import ArchiveTable from "../lib/ArchiveTable";

const Archive: Component = () => {
	return (
		<>
			<div class='pb-[1.5rem]'>
				<ArchiveTable></ArchiveTable>
			</div>
		</>
	);
};

export default Archive;
