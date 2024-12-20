import { Component, createSignal, onMount, Show, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";
import axios from "axios";
import moment from "moment";
import {
	EmployeeTipDistribution as EmployeeTipDistribution,
	getTipDistributions as getTipDistributions,
} from "./GetTipEntries";

interface Entry {
	id: number;
	date: any;
	drawer: number;
	tips: number;
	final: number;
	tipRate: number;
	entry_no: number;
}

// gets the six most recent entries on this page
// the most recent entry is in the main display and then the four previous entries are displayed to the right
async function getRecentEntries() {
	let response = await axios.get(
		import.meta.env.VITE_API_URL + "get-six-recent-entries",
	);
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
			entry_no: item.entry_no,
		});
	}
	return entries;
}

const OverviewEntries: Component = () => {

	const [rendered, setRendered] = createSignal<boolean>(false);

	// used to switch between Classifications and Employees
	const [tabSwitch, setTabSwitch] = createSignal<boolean>(false);

	const [tipDistributions, setTipDistributions] = createStore<
		EmployeeTipDistribution[]
	>([]);

	// the date that is used in the Create new entry window
	const [calendarDate, setCalendarDate] = createSignal<string>(
		moment().format("YYYY-MM-DD"),
	);

	let recentEntries: Entry[] = [];
	const [sixRecentEntries, setSixRecentEntries] =
		createStore<Entry[]>(recentEntries);

	onMount(async function () {
		recentEntries = await getRecentEntries();
		setSixRecentEntries(...[recentEntries]);
		setTipDistributions(await getTipDistributions(sixRecentEntries[0].id));
		setRendered(true);
	});

	const navigate = useNavigate();

	return (
		<div class='px-5 flex flex-col justify-center'>
			<Show when={rendered()}>
				<div class='mt-2 mb-6 flex flex-col'>
					<div class='font-bold text-2xl'>Welcome, Mustard Seed</div>
					<div class='font-medium text-table-header-gray text-lg'>
						Here's an overview of your most recent entry
					</div>
				</div>
					<div class='mb-3 flex justify-center'>
						<div class='p-3 w-full flex flex-row rounded-md border border-border-gray'>
							{/* start of Create new entry box */}
							<div class='w-full flex flex-col'>
								<div class='flex flex-col'>
									<div class='text-white text-sm font-bold'>
										Create a new entry
									</div>
									<div class='mb-3 text-table-header-gray text-sm text-pretty font-medium'>
										Select a date below to create or edit an entry.
									</div>
									<div class='flex flex-row gap-2'>
										{/* go back one day button */}
										<button
											class='p-2 border border-border-gray rounded-md bg-black hover:bg-border-gray'
											onclick={() => {
												setCalendarDate(
													moment(calendarDate())
														.subtract(1, "days")
														.format("YYYY-MM-DD"),
												);
											}}
										>
											<svg
												class='fill-white'
												stroke-width='0'
												xmlns='http://www.w3.org/2000/svg'
												viewBox='0 0 24 24'
												height='1em'
												width='1em'
												style='overflow: visible; color: currentcolor;'
											>
												<path d='m10.828 12 4.95 4.95-1.414 1.415L8 12l6.364-6.364 1.414 1.414-4.95 4.95Z'></path>
											</svg>
										</button>
										{/* Calendar date select */}
										<input
											id='from-date'
											type='date'
											class='px-2 py-1 w-full border border-border-gray rounded-md bg-black font-medium text-white appearance-none hover:bg-border-gray'
											value={calendarDate()}
											onInput={(e) => setCalendarDate(e.currentTarget.value)}
										/>
										{/* go foward one day button */}
										<button
											class='p-2 border border-border-gray rounded-md bg-black hover:bg-border-gray'
											onclick={() => {
												setCalendarDate(
													moment(calendarDate())
														.add(1, "days")
														.format("YYYY-MM-DD"),
												);
											}}
										>
											<svg
												class='fill-white'
												stroke-width='0'
												xmlns='http://www.w3.org/2000/svg'
												viewBox='0 0 24 24'
												height='1em'
												width='1em'
												style='overflow: visible; color: currentcolor;'
											>
												<path d='m13.171 12-4.95-4.95 1.415-1.413L16 12l-6.364 6.364-1.414-1.415 4.95-4.95Z'></path>
											</svg>
										</button>
										{/* Continue button*/}
										<button
											class='py-1.5 px-5 border border-border-gray rounded-md font-medium text-center text-white bg-black hover:bg-border-gray'
											onclick={() => {
												navigate("/Entries/" + calendarDate() + "/0");
											}}
										>
											Continue
										</button>
									</div>
								</div>
								{/* end of Create new entry box */}
							</div>
						</div>
					</div>
				{/* </Show> */}
				{/* start of the edit the most recent entry box */}
				<div class='mb-3 p-1 flex justify-between items-center border border-border-gray rounded-md font-medium'>
					<span class='pl-2'>
						{sixRecentEntries[0].date.format("MMMM D, YYYY")}
					</span>
					<button
						class='py-1.5 px-3 inline-flex justify-between items-center rounded-md hover:bg-border-gray'
						onClick={() => {
							navigate(
								"/Entries/" +
									sixRecentEntries[0].date.format("MM-DD-YYYY") +
									"/0",
								{
									replace: true,
								},
							);
						}}
					>
						<svg
							class='mr-4 fill-icon-gray'
							stroke-width='0'
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 1024 1024'
							height='1em'
							width='1em'
							style='overflow: visible; color: currentcolor;'
						>
							<path d='M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 0 0 0-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 0 0 9.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9zm67.4-174.4L687.8 215l73.3 73.3-362.7 362.6-88.9 15.7 15.6-89zM880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32z'></path>
						</svg>
						Edit entry
					</button>
				</div>
				{/* end of the edit the most recent entry box */}
				{/* start of Classifications and Employees buttons */}
				<div class='p-1.5 grid grid-cols-2 gap-1 items-center border border-border-gray rounded-lg font-semibold'>
					<button
						class={`py-1.5 px-3 items-center rounded-md ${
							!tabSwitch() ? "bg-border-gray text-white" : ""
						}`}
						onClick={() => {
							if (tabSwitch()) setTabSwitch(false);
						}}
					>
						Classifications
					</button>
					<button
						class={`py-1.5 px-3 items-center rounded-md ${
							tabSwitch() ? "bg-border-gray text-white" : ""
						}`}
						onClick={() => {
							if (!tabSwitch()) setTabSwitch(true);
						}}
					>
						Employees
					</button>
				</div>
				{/* end of Classifications and Employees buttons */}
				<Show when={!tabSwitch()}>
					{/* start of the Classifications */}
					<div class='mt-3 border border-border-gray rounded-md'>			
						{/* start of the Drawer values for each entry */}			
						<div class='grid grid-cols-[200px_auto] border-b border-border-gray'>
							<div class='flex flex-col p-6 w-full'>								
								<div class='flex justify-between items-center w-full'>
									<span class='font-medium'>Drawer</span>
									<svg
										class='fill-icon-gray stroke-icon-gray'
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
								<span class='pt-3 font-bold text-2xl'>
									${sixRecentEntries[0].drawer}
								</span>
							</div>
							<div class='my-4 px-4 grid grid-cols-[40px_auto_auto] border-l border-border-gray'>
								<div class='flex flex-col font-medium text-content-gray'>
									{sixRecentEntries.slice(1, 5).map((entry) => (
										<span>{entry.date.format("MM/DD")}</span>
									))}
								</div>
								<div class='pl-4 flex flex-col font-medium'>
									{sixRecentEntries.slice(1, 5).map((entry) => (
										<span>${entry.drawer}</span>
									))}
								</div>
								<div class='pl-4 flex flex-col font-medium text-right'>
									{sixRecentEntries.slice(1, 5).map((entry, index) => {
										let differenceInt: number =
											sixRecentEntries[index + 2].drawer -
											sixRecentEntries[index + 1].drawer;
										let color: string =
											differenceInt < 0 ? "text-green" : "text-red";
										let differenceStr: string = "\u00A0";
										if (differenceInt != 0) {
											differenceStr =
												differenceInt < 0
													? `+${-differenceInt}`
													: `-${differenceInt}`;
										}
										return <span class={color}>{differenceStr}</span>;
									})}
								</div>
							</div>
						</div>
						{/* end of the Drawer values for each entry */}	
						{/* start of the Tips values for each entry */}	
						<div class='grid grid-cols-[200px_auto] border-b border-border-gray'>
							<div class='flex flex-col p-6 w-full'>
								<div class='flex justify-between items-center w-full'>
									<span class='font-medium'>Tips</span>
									<svg
										class='fill-icon-gray stroke-icon-gray'
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
								<span class='pt-3 font-bold text-2xl'>
									${sixRecentEntries[0].tips}
								</span>
							</div>
							<div class='my-4 px-4 grid grid-cols-[40px_auto_auto] border-l border-border-gray'>
								<div class='flex flex-col font-medium text-content-gray'>
									{sixRecentEntries.slice(1, 5).map((entry) => (
										<span>{entry.date.format("MM/DD")}</span>
									))}
								</div>
								<div class='pl-4 flex flex-col font-medium'>
									{sixRecentEntries.slice(1, 5).map((entry) => (
										<span>${entry.tips}</span>
									))}
								</div>
								<div class='pl-4 flex flex-col font-medium text-right'>
									{sixRecentEntries.slice(1, 5).map((entry, index) => {
										let differenceInt: number =
											sixRecentEntries[index + 2].tips -
											sixRecentEntries[index + 1].tips;
										let color: string =
											differenceInt < 0 ? "text-green" : "text-red";
										let differenceStr: string = "\u00A0";
										if (differenceInt != 0) {
											differenceStr =
												differenceInt < 0
													? `+${-differenceInt}`
													: `-${differenceInt}`;
										}
										return <span class={color}>{differenceStr}</span>;
									})}
								</div>
							</div>
						</div>
						{/* end of the Tips values for each entry */}	
						{/* start of the Final values for each entry */}	
						<div class='grid grid-cols-[200px_auto] border-b border-border-gray'>
							<div class='flex flex-col p-6 w-full'>
								<div class='flex justify-between items-center w-full'>
									<span class='font-medium'>Final</span>
									<svg
										class='fill-icon-gray stroke-icon-gray'
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
								<span class='pt-3 font-bold text-2xl'>
									${sixRecentEntries[0].final}
								</span>
							</div>
							<div class='my-4 px-4 grid grid-cols-[40px_auto_auto] border-l border-border-gray'>
								<div class='flex flex-col font-medium text-content-gray'>
									{sixRecentEntries.slice(1, 5).map((entry) => (
										<span>{entry.date.format("MM/DD")}</span>
									))}
								</div>
								<div class='pl-4 flex flex-col font-medium'>
									{sixRecentEntries.slice(1, 5).map((entry) => (
										<span>${entry.final}</span>
									))}
								</div>
								<div class='pl-4 flex flex-col font-medium text-right'>
									{sixRecentEntries.slice(1, 5).map((entry, index) => {
										let differenceInt: number =
											sixRecentEntries[index + 2].final -
											sixRecentEntries[index + 1].final;
										let color: string =
											differenceInt < 0 ? "text-green" : "text-red";
										let differenceStr: string = "\u00A0";
										if (differenceInt != 0) {
											differenceStr =
												differenceInt < 0
													? `+${-differenceInt}`
													: `-${differenceInt}`;
										}
										return <span class={color}>{differenceStr}</span>;
									})}
								</div>
							</div>
						</div>
						{/* end of the Final values for each entry */}	
						{/* start of the Tip Rate values for each entry */}	
						<div class='grid grid-cols-[200px_auto]'>
							<div class='flex flex-col p-6 w-full'>
								<div class='flex justify-between items-center w-full'>
									<span class='font-medium'>Tip Rate</span>
									<svg
										class='fill-none stroke-icon-gray'
										stroke-width='2'
										xmlns='http://www.w3.org/2000/svg'
										stroke-linecap='round'
										stroke-linejoin='round'
										viewBox='0 0 24 24'
										height='1em'
										width='1em'
										style='overflow: visible; color: currentcolor;'
									>
										<path d='M12 1 12 23'></path>
										<path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'></path>
									</svg>
								</div>
								<span class='pt-3 font-bold text-2xl'>
									${sixRecentEntries[0].tipRate}
								</span>
							</div>
							<div class='my-4 px-4 grid grid-cols-[40px_auto_auto] border-l border-border-gray'>
								<div class='flex flex-col font-medium text-content-gray'>
									{sixRecentEntries.slice(1, 5).map((entry) => (
										<span>{entry.date.format("MM/DD")}</span>
									))}
								</div>
								<div class='pl-4 flex flex-col font-medium'>
									{sixRecentEntries.slice(1, 5).map((entry) => (
										<span>${entry.tipRate}</span>
									))}
								</div>
								<div class='pl-4 flex flex-col font-medium text-right'>
									{sixRecentEntries.slice(1, 5).map((entry, index) => {
										let differenceInt: number =
											sixRecentEntries[index + 2].tipRate -
											sixRecentEntries[index + 1].tipRate;
										let color: string =
											differenceInt < 0 ? "text-green" : "text-red";
										let differenceStr: string = "\u00A0";
										if (differenceInt != 0) {
											differenceStr =
												differenceInt < 0
													? `+${-differenceInt}`
													: `-${differenceInt}`;
										}
										return <span class={color}>{differenceStr}</span>;
									})}
								</div>
							</div>
						</div>
						{/* end of the Tip Rate values for each entry */}	
					</div>
					{/* end of the Classifications */}
				</Show>
				<Show when={tabSwitch()}>
					{/* start of the Employees tab to show tip distributions */}
					<div class='mt-3 p-2.5 h-[453px] flex flex-col overflow-auto gap-2 border border-border-gray rounded-md'>
						<For each={tipDistributions}>
							{(distribution, index) => (
								<div class='p-4 border border-border-gray rounded-md'>
									<div class='grid grid-cols-[25px_auto]'>
										<div class='font-medium text-table-header-gray'>
											{index() + 1}
										</div>
										<div class='flex flex-col'>
											<div class='flex justify-between items-center'>
												<span class='font-medium'>{distribution.name}</span>
												<span class='px-2 bg-white rounded-md font-medium text-black'>
													{distribution.title}
												</span>
											</div>
										</div>
									</div>
									<div class='mt-6 grid grid-cols-[66.5px_66.5px_66.5px_66.5px_55px] items-center font-medium'>
										<div class='flex flex-col gap-2'>
											<span class='pb-2 text-table-header-gray border-b border-border-gray'>
												Hours
											</span>
											<span>{distribution.hours}</span>
										</div>
										<div class='flex flex-col gap-2'>
											<span class='pb-2 text-table-header-gray border-b border-border-gray'>
												Initital
											</span>
											<span>${distribution.initial}</span>
										</div>
										<div class='flex flex-col gap-2'>
											<span class='pb-2 text-table-header-gray border-b border-border-gray'>
												Tips
											</span>
											<span>${distribution.tips_received}</span>
										</div>
										<div class='flex flex-col gap-2'>
											<span class='pb-2 text-table-header-gray border-b border-border-gray'>
												Total
											</span>
											<span>${distribution.total}</span>
										</div>
										<div class='flex flex-col gap-2'>
											<span class='pb-2 text-table-header-gray border-b border-border-gray'>
												Offset
											</span>
											<span>${distribution.offset}</span>
										</div>
									</div>
								</div>
							)}
						</For>
					</div>
					{/* end of the Employees tab to show tip distributions */}
				</Show>
			</Show>
		</div>
	);
};

export default OverviewEntries;
