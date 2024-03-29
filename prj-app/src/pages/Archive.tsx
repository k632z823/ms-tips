import type { Component } from "solid-js";
import Nav from "../lib/Nav";
import ArchiveTable from "../lib/ArchiveTable";


const meow = [{number: 1, date: new Date("01-01-2003"), drawer: 4, tips: 5, 
						final: 6, tipRate: 7, base: 8, tags: ["Evening Event"]}];

const Archive: Component = () => {
	return (
		<>
			<ArchiveTable></ArchiveTable>
		</>
	);
};

export default Archive;
