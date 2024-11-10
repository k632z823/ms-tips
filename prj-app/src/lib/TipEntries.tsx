import {
	For,
	type Component,
	Show,
	createSignal,
	onCleanup,
	createEffect,
	type Setter,
	onMount,
} from "solid-js";
import { createStore } from "solid-js/store";
import TipConfig from "./TipConfig";
import axios from "axios";
import moment from "moment";

interface Entry {
	id: number;
	bill_amount: number;
	change_amount: number;
}
interface Label {
	bill_label: string;
	change_label: string;
}

export interface EntryProps {
	drawer: Entry[];
	tips: Entry[];
	final: Entry[];
}

const labels: Label[] = [
	{
		bill_label: "1",
		change_label: "0.01",
	},
	{
		bill_label: "5",
		change_label: "0.05",
	},
	{
		bill_label: "10",
		change_label: "0.10",
	},
	{
		bill_label: "20",
		change_label: "0.25",
	},
	{
		bill_label: "50",
		change_label: "0.50",
	},
	{
		bill_label: "100",
		change_label: "1",
	},
];

const starter = [
	{
		id: 0,
		bill_amount: 0,
		change_amount: 0,
	},
	{
		id: 1,
		bill_amount: 0,
		change_amount: 0,
	},
	{
		id: 2,
		bill_amount: 0,
		change_amount: 0,
	},
	{
		id: 3,
		bill_amount: 0,
		change_amount: 0,
	},
	{
		id: 4,
		bill_amount: 0,
		change_amount: 0,
	},
	{
		id: 5,
		bill_amount: 0,
		change_amount: 0,
	},
];

type entryTypes = keyof EntryProps;

const [billTotal, setBillTotal] = createSignal<number>(0);
const [changeTotal, setChangeTotal] = createSignal<number>(0);
const [total, setTotal] = createSignal<number>(0);
const [showConfig, setShowConfig] = createSignal<boolean>(false);
const [tipTotal, setTipTotal] = createSignal<number>(0);
const [entryType, setEntryType] = createSignal<entryTypes>("drawer");

const [entry, setEntry] = createStore({
	drawer: [
		{
			id: 0,
			bill_amount: 0,
			change_amount: 0,
		},
	],
	tips: [
		{
			id: 0,
			bill_amount: 0,
			change_amount: 0,
		},
	],
	final: [
		{
			id: 0,
			bill_amount: 0,
			change_amount: 0,
		},
	],
});

function calcTotals(entry: Entry[]) {
	setBillTotal(() => {
		let sum = 0;
		entry.forEach((entry: Entry) => (sum += entry.bill_amount));
		return sum;
	});

	setChangeTotal(() => {
		let sum = 0;
		entry.forEach((entry: Entry) => (sum += entry.change_amount));
		return sum;
	});

	setTotal(billTotal() + changeTotal());
}

async function requestEntryData(date: string) {
	let entries = await axios
		.get("http://localhost:3001/get-entries", {
			params: { date: date },
		})
		.then(async function (response) {
			return await response.data.entries;
		});

	setEntry("drawer", entries.drawer);
	setEntry("tips", entries.tips);
	setEntry("final", entries.final);
}

async function addEntry(entryDate: string) {
	let date = entryDate == "default" ? moment().format("L") : entryDate;

	await axios.post("http://localhost:3001/add-entry", {
		entry: {
			entry_date: date,
			type: entryType(),
			coin_01: entry[entryType()][0].change_amount,
			coin_05: entry[entryType()][1].change_amount,
			coin_10: entry[entryType()][2].change_amount,
			coin_25: entry[entryType()][3].change_amount,
			coin_50: entry[entryType()][4].change_amount,
			coin_1: entry[entryType()][5].change_amount,
			bill_1: entry[entryType()][0].bill_amount,
			bill_5: entry[entryType()][1].bill_amount,
			bill_10: entry[entryType()][2].bill_amount,
			bill_20: entry[entryType()][3].bill_amount,
			bill_50: entry[entryType()][4].bill_amount,
			bill_100: entry[entryType()][5].bill_amount,
		},
	});
}

const EntryDisplay: Component<{ entryDate: string }> = (props: any) => {
	let { entryDate } = props;
	let entries;

	const [allTotals, setAllTotals] = createStore({
		drawer: 0,
		tips: 0,
		final: 0,
	});

	const [dropDown, setDropDown] = createSignal<boolean>(false);

	onMount(async function () {
		//gets the entry data for the selected date
		await requestEntryData(entryDate);

		//prefills the total summary bar w/ the existing values totals otherwise they're 0
		calcTotals(entry.drawer);
		setAllTotals("drawer", () => total());
		calcTotals(entry.tips);
		setAllTotals("tips", total());
		setTipTotal(total());
		calcTotals(entry.final);
		setAllTotals("final", total());
		calcTotals(entry[entryType()]);
		setAllTotals(entryType(), total());
	});

	createEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const dropdownDefaultButton = document.getElementById(
				"dropdownDefaultButton",
			);
			const dropdown = document.getElementById("dropdown");

			if (
				dropdownDefaultButton &&
				!dropdownDefaultButton.contains(event.target as Node) &&
				dropdown &&
				!dropdown.contains(event.target as Node)
			) {
				setDropDown(false);
			}
		};

		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	});

	return (
		<>
			<div
				class='px-5 flex justify-center'
				id='entry-info'
			>
				<div class='border border-border-gray rounded-md w-full'>
					<table class='table-auto w-full'>
						<tbody>
							<tr class='border-border-gray font-medium'>
								<td class='p-2 align-top border-r border-border-gray text-xs text-mini-gray'>
									Drawer
								</td>
								<td class='p-2 align-top border-r border-border-gray text-xs text-mini-gray'>
									Tips
								</td>
								<td class='p-2 align-top text-xs text-mini-gray'>Final</td>
							</tr>
							<tr class='border-border-gray'>
								<td class='px-2 pb-2 w-1/3 border-r border-border-gray text-l text-right'>
									${allTotals.drawer}
								</td>
								<td class='px-2 pb-2 w-1/3 border-r border-border-gray text-l text-right'>
									${allTotals.tips}
								</td>
								<td class='px-2 pb-2 w-1/3 text-l text-right'>
									${allTotals.final}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			<div class='flex justify-center px-5 pt-4 pb-5'>
				<div class='border border-border-gray rounded-md w-full'>
					<div id='entry-select'>
						<div class='flex justify-center'>
							<div class='py-5 w-full relative grow text-sm font-normal'>
								<div class='px-5'>
									<button
										id='dropdownDefaultButton'
										data-dropdown-toggle='dropdown'
										class='border border-border-gray rounded-md text-white text-center px-2.5 py-1.5 hover:bg-border-gray inline-flex items-center justify-between w-full'
										type='button'
										onClick={() => setDropDown(!dropDown())}
									>
										{entryType().charAt(0).toUpperCase() + entryType().slice(1)}
										<svg
											class='w-1.5 h-1.5'
											aria-hidden='true'
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 10 6'
										>
											<path
												stroke='#505050'
												stroke-linecap='round'
												stroke-linejoin='round'
												stroke-width='2'
												d='m1 1 4 4 4-4'
											/>
										</svg>
									</button>
								</div>
								<Show when={dropDown()}>
									<div class='absolute px-5 py-1.5 w-full'>
										<div
											id='dropdown'
											class='border border-border-gray bg-black rounded-md text-white font-normal'
										>
											<ul aria-labelledby='dropdownDefaultButton'>
												<div class='p-1'>
													<li class='px-2 pt-2 font-semibold text-xs text-content-gray pointer-events-none'>
														Select a classification
													</li>
												</div>
												<a
													onClick={() => {
														setEntryType("drawer");
														calcTotals(entry[entryType()]);
													}}
													class=''
												>
													<div class='pt-1 px-1'>
														<li class='block px-3 py-2 hover:bg-input-gray hover:rounded cursor-pointer'>
															<div class='inline-flex gap-3'>
																<svg
																	fill='currentColor'
																	stroke-width='0'
																	xmlns='http://www.w3.org/2000/svg'
																	viewBox='0 0 16 16'
																	height='1.2em'
																	width='1.2em'
																	style='overflow: visible; color: currentcolor;'
																>
																	<path
																		fill='currentColor'
																		d='m15.89 10.188-4-5A.5.5 0 0 0 11.5 5h-7a.497.497 0 0 0-.39.188l-4 5A.5.5 0 0 0 0 10.5V15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4.5a.497.497 0 0 0-.11-.312zM15 11h-3.5l-2 2h-3l-2-2H1v-.325L4.74 6h6.519l3.74 4.675V11z'
																	></path>
																</svg>
																Drawer
															</div>
														</li>
													</div>
												</a>
												<a
													onClick={() => {
														setEntryType("tips");
														calcTotals(entry[entryType()]);
													}}
													class=''
												>
													<div class='px-1'>
														<li class='block px-3 py-2 hover:bg-input-gray hover:rounded cursor-pointer'>
															<div class='inline-flex items-center gap-3'>
																<svg
																	fill='currentColor'
																	stroke-width='0'
																	xmlns='http://www.w3.org/2000/svg'
																	viewBox='0 0 640 512'
																	height='1.2em'
																	width='1.2em'
																	style='overflow: visible; color: currentcolor;'
																>
																	<path d='M96 96v224c0 35.3 28.7 64 64 64h416c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H160c-35.3 0-64 28.7-64 64zm64 160c35.3 0 64 28.7 64 64h-64v-64zm64-160c0 35.3-28.7 64-64 64V96h64zm352 160v64h-64c0-35.3 28.7-64 64-64zM512 96h64v64c-35.3 0-64-28.7-64-64zM288 208a80 80 0 1 1 160 0 80 80 0 1 1-160 0zM48 120c0-13.3-10.7-24-24-24S0 106.7 0 120v240c0 66.3 53.7 120 120 120h400c13.3 0 24-10.7 24-24s-10.7-24-24-24H120c-39.8 0-72-32.2-72-72V120z'></path>
																</svg>
																Tips
															</div>
														</li>
													</div>
												</a>
												<a
													onClick={() => {
														setEntryType("final");
														calcTotals(entry[entryType()]);
													}}
													class=''
												>
													<div class='pb-1 px-1'>
														<li class='block px-3 py-2 hover:bg-input-gray hover:rounded cursor-pointer'>
															<div class='inline-flex items-center gap-3'>
																<svg
																	fill='currentColor'
																	stroke-width='0'
																	xmlns='http://www.w3.org/2000/svg'
																	viewBox='0 0 1024 1024'
																	height='1.2em'
																	width='1.2em'
																	style='overflow: visible; color: currentcolor;'
																>
																	<path d='M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z'></path>
																</svg>
																Final
															</div>
														</li>
													</div>
												</a>
											</ul>
										</div>
									</div>
								</Show>
							</div>
						</div>
					</div>
					<div class='pb-5 px-5 flex items-center'>
						<div class='flex-grow border-t border-border-gray'></div>
					</div>
					<div id='entry-input'>
						<div class='flex justify-center px-5'>
							<div class='border border-border-gray rounded-md grow'>
								<table
									class='table-auto w-full text-sm font-normal'
									id='bills'
								>
									<tbody>
										<For each={entry[entryType()]}>
											{(item) => (
												<tr class='text-center'>
													<td
														class={`p-4 w-1/6 ${
															item.id === 0
																? "rounded-tl-md border-b border-border-gray"
																: ""
														} ${
															item.id === 5
																? "rounded-bl-md border-t border-border-gray"
																: "border-b border-border-gray"
														} border-r border-border-gray bg-input-gray`}
													>
														{labels[item.id].bill_label}
													</td>
													<td
														class={`p-2 w-2/6 ${
															item.id === 0 ? "border-b border-border-gray" : ""
														} ${
															item.id === 5
																? "border-t border-border-gray"
																: "border-b border-border-gray"
														}`}
													>
														<input
															class='p-1 w-full rounded-md border border-border-gray bg-input-gray text-center text-content-gray'
															value={item.bill_amount}
															onChange={(e) => {
																if (Number.isNaN(parseInt(e.target.value))) {
																	e.target.value =
																		entry[entryType()][
																			item.id
																		].bill_amount.toString();
																	return;
																}
																setEntry(entryType(), item.id, (entry) => ({
																	...entry,
																	bill_amount: parseInt(e.target.value),
																}));
																calcTotals(entry[entryType()]);
																setAllTotals(entryType(), total());
															}}
															onFocus={(e) => {
																if (e.target.value == "0") {
																	e.target.value = "";
																}
															}}
															onBlur={(e) => {
																if (e.target.value == "") {
																	e.target.value = "0";
																}
															}}
														></input>
													</td>
													<td
														class={`p-4 w-1/6 ${
															item.id === 0 ? "border-b border-border-gray" : ""
														} ${
															item.id === 5
																? "border-t border-border-gray"
																: "border-b border-border-gray"
														} border-x border-border-gray bg-input-gray`}
													>
														{labels[item.id].change_label}
													</td>
													<td
														class={`p-2 w-2/6 ${
															item.id === 0 ? "border-b border-border-gray" : ""
														} ${
															item.id === 5
																? "border-t border-border-gray"
																: "border-b border-border-gray"
														}`}
													>
														<input
															class='p-1 w-full rounded-md border border-border-gray bg-input-gray text-center text-content-gray'
															value={item.change_amount}
															onChange={(e) => {
																if (Number.isNaN(parseInt(e.target.value))) {
																	e.target.value =
																		entry[entryType()][
																			item.id
																		].change_amount.toString();
																	return;
																}
																setEntry(
																	entryType(),
																	item.id,
																	"change_amount",
																	parseInt(e.target.value),
																);
																calcTotals(entry[entryType()]);
																setAllTotals(entryType(), total());
															}}
															onFocus={(e) => {
																if (e.target.value == "0") {
																	e.target.value = "";
																}
															}}
															onBlur={(e) => {
																if (e.target.value == "") {
																	e.target.value = "0";
																}
															}}
														></input>
													</td>
												</tr>
											)}
										</For>
										<tr class='text-center'>
											<td class='p-3 border-r border-y border-border-gray bg-input-gray'>
												Bill
											</td>
											<td class='p-3 w-2/6 border-y border-border-gray text-content-gray'>
												${billTotal()}
											</td>
											<td class='p-3 border-x border-y  border-border-gray bg-input-gray'>
												Coin
											</td>
											<td class='p-3 w-2/6 border-y border-border-gray text-content-gray'>
												${changeTotal()}
											</td>
										</tr>
										<tr class='text-center'>
											<td class='p-3 border-r border-border-gray rounded-bl-lg bg-input-gray'>
												Total
											</td>
											<td
												class='p-3 text-content-gray'
												colspan={3}
											>
												${total()}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						<div class='py-5 flex justify-center'>
							<div class='px-5 grid grid-cols-2 gap-5 text-sm font-normal w-full'>
								<button
									class='order-last p-1.5 text-black font-medium rounded-md bg-white hover:bg-white/90'
									onClick={async () => {
										if (entryType() == "tips") {
											setTipTotal(allTotals.tips);
										}
										await addEntry(entryDate);
									}}
								>
									Submit{" "}
									{entryType().charAt(0).toUpperCase() + entryType().slice(1)}
								</button>
								<button
									class='p-1.5 border border-border-gray hover:bg-border-gray rounded-md'
									onClick={() => {
										entry[entryType()].forEach((entry: Entry) => {
											setEntry(entryType(), entry.id, {
												...entry,
												bill_amount: 0,
												change_amount: 0,
											});
										});
										calcTotals(entry[entryType()]);
										setAllTotals(entryType(), total());
									}}
								>
									Clear
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			<TipConfig
				tip_total={tipTotal()}
				date={entryDate}
				offset_total={0}
			></TipConfig>
		</>
	);
};

export default EntryDisplay;
