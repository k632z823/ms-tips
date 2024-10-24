import { Component, createSignal, onMount, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";
import DateDisplay from "../lib/DateDisplay";
import axios from "axios";
import moment from "moment";

interface Entry {
	id: number;
	date: any;
	drawer: number;
	tips: number;
	final: number;
	tipRate: number;
}

async function getTodaysEntry() {
	let response = await axios.get("http://localhost:3001/get-todays-entry")
	let responseData: Entry = response.data.todaysEntry;
	return responseData;
}

const todaysEntryExists = (todaysEntry: Entry) => {
	return todaysEntry.date == "";
}

// will display the five most recent entries on this page
// the most recent entry is in the main display and the other four are on the right side
async function getRecentEntries() {
	let response = await axios.get("http://localhost:3001/get-six-recent-entries")
	let responseData = response.data.entries;
	let entries: Entry[] = [];
	for (let item of responseData) {
		entries.push({
			id: item.id,
			date: moment(item.date),
			tips: item.tips,
			final: item.final,
			tipRate: item.tipRate,
			drawer: item.drawer,
		})
	}
	return entries;
}

let recentEntries: Entry[] = [];
const [sixRecentEntries, setSixRecentEntries] = createStore<Entry[]>(recentEntries);

const OverviewEntries: Component = () => {
	const [mostRecentEntry, setMostRecentEntry] = createStore<Entry>(
		{
			id: 0,
			date: "",
			drawer: 0,
			tips: 0,
			final: 0,
			tipRate: 0,
		}
	)

	const [todaysEntry, setTodaysEntry] = createStore<Entry>(
		{
			id: 0,
			date: "",
			drawer: 0,
			tips: 0,
			final: 0,
			tipRate: 0,
		}
	)

	const [rendered, setRendered] = createSignal<boolean>(false);

	const [showCreateToday, setShowCreateToday] = createSignal<boolean>(true);

	onMount(async function () {
		recentEntries = await getRecentEntries();
		setTodaysEntry(await getTodaysEntry());
		setShowCreateToday(todaysEntryExists(todaysEntry));
		setSixRecentEntries(...[recentEntries]);
		setRendered(true);
	})

	const navigate = useNavigate();

	return (
		<div class='flex flex-col justify-center px-5'>
			<Show when={rendered()}>
				<div class="flex flex-col pb-6">
					<div class="font-bold text-2xl">Welcome, Mustard Seed</div>
					<div class="font-medium text-table-header-gray text-lg">Here's an overview of your most recent entry</div>
				</div>
				<Show when={showCreateToday()}>
					<button
						class="mb-4 flex justify-center"
						onClick={() => {
							navigate("/Entries/default", {
								replace: true,
							});
						}}
					>
						<div class="p-2 w-full flex flex-row rounded-md border border-dashed border-border-gray bg-dialog-bg-gray hover:bg-border-gray">
							<div class="flex flex-col">
								<div class="flex flex-row items-center">
									<svg
										class="mr-3 ml-1 mt-1 fill-white"
										stroke-width="0"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 512 512"
										height="1.2em"
										width="1.2em"
										style="overflow: visible; color: currentcolor;">
										<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M384 224v184a40 40 0 0 1-40 40H104a40 40 0 0 1-40-40V168a40 40 0 0 1 40-40h167.48"></path><path d="M459.94 53.25a16.06 16.06 0 0 0-23.22-.56L424.35 65a8 8 0 0 0 0 11.31l11.34 11.32a8 8 0 0 0 11.34 0l12.06-12c6.1-6.09 6.67-16.01.85-22.38ZM399.34 90 218.82 270.2a9 9 0 0 0-2.31 3.93L208.16 299a3.91 3.91 0 0 0 4.86 4.86l24.85-8.35a9 9 0 0 0 3.93-2.31L422 112.66a9 9 0 0 0 0-12.66l-9.95-10a9 9 0 0 0-12.71 0Z"></path>
									</svg>
									<div class="text-white text-sm font-bold">Create today's entry</div>
								</div>
								<div class="ml-[32.5px] pb-[2px] text-left text-content-gray text-sm text-pretty font-medium">
									An entry for today has not been made yet. Click here to create one.
								</div>
							</div>
						</div>
					</button>
				</Show>
				<div class="p-1 flex justify-between items-center border bg-menu-gray border-border-gray rounded-md">
					<span class="pl-2 font-normal">
						{sixRecentEntries[0].date.format("MMMM D, YYYY")}
					</span>
					<button
						class='py-1.5 px-3 inline-flex justify-between items-center rounded-md hover:bg-border-gray font-normal'
						onClick={() => {
							navigate("/Entries/" + sixRecentEntries[0].date.format("MM-DD-YYYY"), {
								replace: true,
							});
						}}
					>
						<svg
							class="mr-4 fill-icon-gray"
							stroke-width="0"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 1024 1024"
							height="1em"
							width="1em"
							style="overflow: visible; color: currentcolor;">
							<path
								d="M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 0 0 0-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 0 0 9.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9zm67.4-174.4L687.8 215l73.3 73.3-362.7 362.6-88.9 15.7 15.6-89zM880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32z"></path>
						</svg>
						Edit entry
					</button>
				</div>
				{/* display of recent drawer values */}
				<div class="mt-4 grid grid-cols-[200px_auto] border border-border-gray rounded-md">
					<div class="flex flex-col p-6 w-full">
						<div class="flex justify-between items-center w-full">
							<span class="font-medium">Drawer</span>
							<svg
								class="fill-icon-gray stroke-icon-gray"
								stroke-width="0"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 16 16"
								height="1em"
								width="1em"
								style="overflow: visible; color: currentcolor;">
								<path d="m15.89 10.188-4-5A.5.5 0 0 0 11.5 5h-7a.497.497 0 0 0-.39.188l-4 5A.5.5 0 0 0 0 10.5V15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4.5a.497.497 0 0 0-.11-.312zM15 11h-3.5l-2 2h-3l-2-2H1v-.325L4.74 6h6.519l3.74 4.675V11z"></path>
							</svg>
						</div>
						<span class="pt-3 font-bold text-2xl">${sixRecentEntries[0].drawer}</span>
					</div>
					<div class="my-4 px-4 grid grid-cols-3 border-l border-border-gray">
						<div class="flex flex-col font-medium text-content-gray">
							{sixRecentEntries.slice(1, 5).map((entry) => (
								<span>{entry.date.format('MM/DD')}</span>
							))}
						</div>
						<div class="pl-4 flex flex-col font-medium">
							{sixRecentEntries.slice(1, 5).map((entry) => (
								<span>${entry.drawer}</span>
							))}
						</div>
						<div class="pl-4 flex flex-col font-medium text-right">
							{sixRecentEntries.slice(1, 5).map((entry, index) => {
								let differenceInt: number = sixRecentEntries[index + 2].drawer - sixRecentEntries[index + 1].drawer;
								let color: string = differenceInt < 0 ? "text-green" : "text-red";

								let differenceStr: string = '\u00A0';
								if (differenceInt != 0) {
									differenceStr = differenceInt < 0 ? `+${-differenceInt}` : `-${differenceInt}`;
								}
								return <span class={color}>{differenceStr}</span>;
							})}
						</div>
					</div>
				</div>
				{/* display of recent tips */}
				<div class="mt-4 grid grid-cols-[200px_auto] border border-border-gray rounded-md">
					<div class="flex flex-col p-6 w-full">
						<div class="flex justify-between items-center w-full">
							<span class="font-medium">Tips</span>
							<svg
								class="fill-icon-gray stroke-icon-gray"
								stroke-width='0'
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 640 512'
								height='1.2em'
								width='1.2em'
								style='overflow: visible; color: currentcolor;'
							>
								<path d='M96 96v224c0 35.3 28.7 64 64 64h416c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H160c-35.3 0-64 28.7-64 64zm64 160c35.3 0 64 28.7 64 64h-64v-64zm64-160c0 35.3-28.7 64-64 64V96h64zm352 160v64h-64c0-35.3 28.7-64 64-64zM512 96h64v64c-35.3 0-64-28.7-64-64zM288 208a80 80 0 1 1 160 0 80 80 0 1 1-160 0zM48 120c0-13.3-10.7-24-24-24S0 106.7 0 120v240c0 66.3 53.7 120 120 120h400c13.3 0 24-10.7 24-24s-10.7-24-24-24H120c-39.8 0-72-32.2-72-72V120z'></path>
							</svg>
						</div>
						<span class="pt-3 font-bold text-2xl">${sixRecentEntries[0].tips}</span>
					</div>
					<div class="my-4 px-4 grid grid-cols-3 border-l border-border-gray">
						<div class="flex flex-col font-medium text-content-gray">
							{sixRecentEntries.slice(1, 5).map((entry) => (
								<span>{entry.date.format('MM/DD')}</span>
							))}
						</div>
						<div class="pl-4 flex flex-col font-medium">
							{sixRecentEntries.slice(1, 5).map((entry) => (
								<span>${entry.tips}</span>
							))}
						</div>
						<div class="pl-4 flex flex-col font-medium text-right">
							{sixRecentEntries.slice(1, 5).map((entry, index) => {
								let differenceInt: number = sixRecentEntries[index + 2].tips - sixRecentEntries[index + 1].tips;
								let color: string = differenceInt < 0 ? "text-green" : "text-red"

								let differenceStr: string = '\u00A0';
								if (differenceInt != 0) {
									differenceStr = differenceInt < 0 ? `+${-differenceInt}` : `-${differenceInt}`;
								}
								return <span class={color}>{differenceStr}</span>
							})}
						</div>
					</div>
				</div>

				{/* display of recent final values*/}
				<div class="mt-4 grid grid-cols-[200px_auto] border border-border-gray rounded-md">
					<div class="flex flex-col p-6 w-full">
						<div class="flex justify-between items-center w-full">
							<span class="font-medium">Final</span>
							<svg
								class="fill-icon-gray stroke-icon-gray"
								stroke-width='0'
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 1024 1024'
								height='1.2em'
								width='1.2em'
								style='overflow: visible; color: currentcolor;'
							>
								<path d='M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z'></path>
							</svg>
						</div>
						<span class="pt-3 font-bold text-2xl">${sixRecentEntries[0].final}</span>
					</div>
					<div class="my-4 px-4 grid grid-cols-3 border-l border-border-gray">
						<div class="flex flex-col font-medium text-content-gray">
							{sixRecentEntries.slice(1, 5).map((entry) => (
								<span>{entry.date.format('MM/DD')}</span>
							))}
						</div>
						<div class="pl-4 flex flex-col font-medium">
							{sixRecentEntries.slice(1, 5).map((entry) => (
								<span>${entry.final}</span>
							))}
						</div>
						<div class="pl-4 flex flex-col font-medium text-right">
							{sixRecentEntries.slice(1, 5).map((entry, index) => {
								let differenceInt: number = sixRecentEntries[index + 2].final - sixRecentEntries[index + 1].final;
								let color: string = differenceInt < 0 ? "text-green" : "text-red"

								let differenceStr: string = '\u00A0';
								if (differenceInt != 0) {
									differenceStr = differenceInt < 0 ? `+${-differenceInt}` : `-${differenceInt}`;
								}
								return <span class={color}>{differenceStr}</span>
							})}
						</div>
					</div>
				</div>
				{/* display of recent tip rates */}
				<div class="mt-4 grid grid-cols-[200px_auto] border border-border-gray rounded-md">
					<div class="flex flex-col p-6 w-full">
						<div class="flex justify-between items-center w-full">
							<span class="font-medium">Tip Rate</span>
							<svg
								class="fill-none stroke-icon-gray"
								stroke-width="2"
								xmlns="http://www.w3.org/2000/svg"
								stroke-linecap="round"
								stroke-linejoin="round"
								viewBox="0 0 24 24"
								height="1em"
								width="1em"
								style="overflow: visible; color: currentcolor;"
							>
								<path d="M12 1 12 23"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
						</div>
						<span class="pt-3 font-bold text-2xl">${sixRecentEntries[0].tipRate}</span>
					</div>
					<div class="my-4 px-4 grid grid-cols-3 border-l border-border-gray">
						<div class="flex flex-col font-medium text-content-gray">
							{sixRecentEntries.slice(1, 5).map((entry) => (
								<span>{entry.date.format('MM/DD')}</span>
							))}
						</div>
						<div class="pl-4 flex flex-col font-medium">
							{sixRecentEntries.slice(1, 5).map((entry) => (
								<span>${entry.tipRate}</span>
							))}
						</div>
						<div class="pl-4 flex flex-col font-medium text-right">
							{sixRecentEntries.slice(1, 5).map((entry, index) => {
								let differenceInt: number = sixRecentEntries[index + 2].tipRate - sixRecentEntries[index + 1].tipRate;
								let color: string = differenceInt < 0 ? "text-green" : "text-red"

								let differenceStr: string = '\u00A0';
								if (differenceInt != 0) {
									differenceStr = differenceInt < 0 ? `+${-differenceInt}` : `-${differenceInt}`;
								}
								return <span class={color}>{differenceStr}</span>
							})}
						</div>
					</div>
				</div>
			</Show>
		</div>
	);
};

export default OverviewEntries;
