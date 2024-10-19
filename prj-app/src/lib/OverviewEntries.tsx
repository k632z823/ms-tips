import { Component, createSignal, onMount, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";
import DateDisplay from "../lib/DateDisplay";
import axios from "axios";

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
		<div class='flex flex-col justify-center px-5'>
			<Show when={rendered()}>
				<div class="flex flex-col pb-8">
					<div class="font-bold text-2xl">Welcome, Mustard Seed</div>
					<div class="font-medium text-content-gray text-lg">Here's an overview of today's entry</div>
				</div>
				<DateDisplay />
				<div class="flex flex-col mt-4 p-6 border border-border-gray rounded-md">
					<div class="flex justify-between items-center">
						<span class="font-medium">Drawer</span>
						<svg
							class="fill-icon-gray stroke-icon-gray"
							stroke-width='0'
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 16 16'
							height='1em'
							width='1em'
							style='overflow: visible; color: currentcolor;'
						>
							<path d='m15.89 10.188-4-5A.5.5 0 0 0 11.5 5h-7a.497.497 0 0 0-.39.188l-4 5A.5.5 0 0 0 0 10.5V15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4.5a.497.497 0 0 0-.11-.312zM15 11h-3.5l-2 2h-3l-2-2H1v-.325L4.74 6h6.519l3.74 4.675V11z'></path>
						</svg>
					</div>
					<span class="pt-3 font-bold text-2xl">${todaysEntry.drawer}</span>
					{/* <span class="pt-1 font-medium text-xs text-content-gray">+20.1% from previous entry</span> */}
				</div>
				<div class="flex flex-col mt-4 p-6 border border-border-gray rounded-md">
					<div class="flex justify-between items-center">
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
					<span class="pt-3 font-bold text-2xl">${todaysEntry.tips}</span>
					<span class="pt-1 font-medium text-xs text-content-gray">+20.1% from previous entry</span>
				</div>
				<div class="flex flex-col mt-4 p-6 border border-border-gray rounded-md">
					<div class="flex justify-between items-center">
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
					<span class="pt-3 font-bold text-2xl">${todaysEntry.final}</span>
					{/* <span class="pt-1 font-medium text-xs text-content-gray">+20.1% from previous entry</span> */}
				</div>
				<div class="flex flex-col mt-4 p-6 border border-border-gray rounded-md">
					<div class="flex justify-between items-center">
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
					<span class="pt-3 font-bold text-2xl">${todaysEntry.tipRate}</span>
					{/* <span class="pt-1 font-medium text-xs text-content-gray">+20.1% from previous entry</span> */}
				</div>
				<div class="mt-4 flex justify-between border border-border-gray rounded-md">
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
						<span class="pt-3 font-bold text-2xl">${todaysEntry.tipRate}</span>
						{/* <span class="pt-1 font-medium text-xs text-content-gray">+20.1% from previous entry</span> */}
					</div>
					<div class="my-4 px-4 flex flex-row items-center border-l border-border-gray">
						<div class="flex flex-col font-medium text-content-gray">
							<span>10/16</span>
							<span>10/15</span>
							<span>10/12</span>
							<span>10/11</span>
						</div>
						<div class="pl-4 flex flex-col font-medium">
							<span>$10</span>
							<span>$7.5</span>
							<span>$9.5</span>
							<span>$15</span>
						</div>
						<div class="pl-4 flex flex-col font-medium">
							<span class="text-green">+2.5</span>
							<span class="text-red">-2</span>
							<span class="text-red">-5.5</span>
							<span class="text-red">-4</span>
						</div>
					</div>
				</div>
				<div class="flex justify-between items-center pt-4">
					<button
						class='py-1.5 px-3 inline-flex justify-between items-center border border-border-gray rounded-md hover:bg-border-gray font-normal'
						onClick={() => {
							navigate("/Entries/default", {
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
					<span class="font-semibold text-content-gray text-xs">Last updated 2 hours ago.</span>
				</div>
			</Show>
		</div>
	);
};

export default OverviewEntries;
