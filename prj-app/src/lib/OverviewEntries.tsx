import { Component, createSignal, onMount, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";
import axios from "axios";
import moment from "moment";

interface Entry {
	id: number;
	date: string;
	drawer: number;
	tips: number;
	final: number;
	tipRate: number;
	tags: string[];
}

async function getTodaysEntry() {
	let response = await axios.get("http://localhost:3001/get-todays-entry");
	let responseData: Entry = response.data.todaysEntry;
	return responseData;
}


const OverviewEntries: Component = () => {
	const [todaysEntry, setTodaysEntry] = createStore<Entry>(    
		{
			id: 0,
			date: "",
			drawer: 0,
			tips: 0,
			final: 0,
			tipRate: 0,
			tags: []
		}
	)
	const [rendered, setRendered] = createSignal<boolean>(false);
	onMount(async function () {
		setTodaysEntry(await getTodaysEntry());
		setRendered(true);
	})
	
	const navigate = useNavigate();

	return (
		<div class='flex justify-center px-5'>
			<div class='border border-border-gray rounded-md w-full'>
				<Show when={rendered()}>
					<table class='table-auto w-full'>
						<tbody>
							<tr class='border-b border-border-gray bg-menu-gray'>
								<td class='p-3 text-sm'>Today's Entry</td>
								<td class='p-2 text-sm flex justify-end'>
									<button
										class='p-1 px-8 border border-border-gray rounded-md bg-black hover:bg-border-gray'
										onClick={() => {
											navigate("/Entries/default", {
												replace: true,
											});
										}}
									>
										Edit
									</button>
								</td>
							</tr>
							<tr class='border-b border-border-gray'>
								<td class='p-2 align-top text-sm text-mini-gray'>Drawer</td>
								<td class='p-4 flex justify-end text-4xl'>${todaysEntry.drawer}</td>
							</tr>
							<tr class='border-b border-border-gray'>
								<td class='p-2 align-top text-sm text-mini-gray'>Tips</td>
								<td class='p-4 flex justify-end text-4xl'>${todaysEntry.tips}</td>
							</tr>
							<tr class='border-b border-border-gray'>
								<td class='p-2 align-top text-sm text-mini-gray'>Final</td>
								<td class='p-4 flex justify-end text-4xl'>${todaysEntry.final}</td>
							</tr>
							<tr class=''>
								<td class='p-2 align-top text-sm text-mini-gray'>Tip Rate</td>
								<td class='p-4 flex justify-end text-4xl'>${todaysEntry.tipRate}</td>
							</tr>
						</tbody>
					</table>
				</Show>
				
			</div>
		</div>
	);
};

export default OverviewEntries;
