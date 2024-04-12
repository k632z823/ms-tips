import {
	For,
	type Component,
	Show,
	createSignal,
	onCleanup,
	createEffect,
	type Setter,
} from "solid-js";
import { createStore } from "solid-js/store";
import TipConfig from "./TipConfig";

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
	Drawer: Entry[];
	Tips: Entry[];
	Final: Entry[];
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

const EntryDisplay: Component = () => {
	const [entryType, setEntryType] = createSignal<entryTypes>("Drawer");

	const [entry, setEntry] = createStore({
		Drawer: JSON.parse(JSON.stringify(starter)),
		Tips: JSON.parse(JSON.stringify(starter)),
		Final: JSON.parse(JSON.stringify(starter)),
	});
	const [allTotals, setAllTotals] = createStore({
		Drawer: 0,
		Tips: 0,
		Final: 0,
	});
	const [dropDown, setDropDown] = createSignal<boolean>(false);

	createEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const dropdownDefaultButton = document.getElementById("dropdownDefaultButton");
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
				class='flex justify-center px-5'
				id='entry-info'
			>
				<div class='border border-border-gray rounded-md w-full'>
					<table class='table-auto w-full'>
						<tbody>
							<tr class='border-border-gray'>
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
									${allTotals.Drawer}
								</td>
								<td class='px-2 pb-2 w-1/3 border-r border-border-gray text-l text-right'>
									${allTotals.Tips}
								</td>
								<td class='px-2 pb-2 w-1/3 text-l text-right'>
									${allTotals.Final}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			<div class='flex justify-center px-5 py-5'>
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
										{entryType()}
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
											<ul
												class=''
												aria-labelledby='dropdownDefaultButton'
											>
												<div class='p-1'>
													<li class='px-2 pt-2 font-semibold text-xs text-content-gray pointer-events-none'>
														Select a classification
													</li>
												</div>
												<div class='pt-1 px-1'>
													<li class='block px-3 py-2 hover:bg-input-gray hover:rounded-md cursor-pointer'>
														<div class='inline-flex gap-3'>
														<svg
															fill="currentColor"
															stroke-width="0"
															xmlns="http://www.w3.org/2000/svg"
															viewBox="0 0 16 16"
															height="1em"
															width="1em"
															style="overflow: visible; color: currentcolor;"
														>
															<path fill="currentColor" d="m15.89 10.188-4-5A.5.5 0 0 0 11.5 5h-7a.497.497 0 0 0-.39.188l-4 5A.5.5 0 0 0 0 10.5V15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4.5a.497.497 0 0 0-.11-.312zM15 11h-3.5l-2 2h-3l-2-2H1v-.325L4.74 6h6.519l3.74 4.675V11z"></path>
														</svg>
															<a
																onClick={() => {
																	setEntryType("Drawer");
																	calcTotals(entry[entryType()]);
																}}
																class=''
															>
																Drawer
															</a>
														</div>
													</li>
												</div>
												<div class='px-1'>
													<li class='block px-3 py-2 hover:bg-input-gray hover:rounded-md cursor-pointer'>
														<div class='inline-flex items-center gap-3'>
														<svg 
															fill="currentColor"
															stroke-width="0"
															xmlns="http://www.w3.org/2000/svg"
															viewBox="0 0 640 512"
															height="1em" 
															width="1em" 
															style="overflow: visible; color: currentcolor;"
														>
															<path d="M96 96v224c0 35.3 28.7 64 64 64h416c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H160c-35.3 0-64 28.7-64 64zm64 160c35.3 0 64 28.7 64 64h-64v-64zm64-160c0 35.3-28.7 64-64 64V96h64zm352 160v64h-64c0-35.3 28.7-64 64-64zM512 96h64v64c-35.3 0-64-28.7-64-64zM288 208a80 80 0 1 1 160 0 80 80 0 1 1-160 0zM48 120c0-13.3-10.7-24-24-24S0 106.7 0 120v240c0 66.3 53.7 120 120 120h400c13.3 0 24-10.7 24-24s-10.7-24-24-24H120c-39.8 0-72-32.2-72-72V120z"></path>
														</svg>
															<a
																onClick={() => {
																	setEntryType("Tips");
																	calcTotals(entry[entryType()]);
																}}
																class=''
															>
																Tips
															</a>
														</div>
													</li>
												</div>
												<div class='pb-1 px-1'>
													<li class='block px-3 py-2 hover:bg-input-gray hover:rounded-md cursor-pointer'>
														<div class='inline-flex items-center gap-3'>
															<svg
																fill="currentColor"
																stroke-width="0"
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 1024 1024"
																height="1.2em"
																width="1.2em"
																style="overflow: visible; color: currentcolor;"
															>
																<path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"></path>
															</svg>
															<a
																onClick={() => {
																	setEntryType("Final");
																	calcTotals(entry[entryType()]);
																}}
																class=''
															>
																Final
															</a>
														</div>
													</li>
												</div>
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
									class='table-auto w-full text-sm font-light'
									id='bills'
								>
									<tbody>
										<For each={entry[entryType()]}>
											{(item) => (
												<tr class='text-center'>
													<td class='border-r border-b border-border-gray bg-input-gray px-8'>
														{labels[item.id].bill_label}
													</td>
													<td class='border-b border-border-gray p-2'>
														<input
															class='rounded-md border border-border-gray bg-input-gray text-center text-content-gray p-1 w-full'
															value={item.bill_amount}
															onChange={(e) => {
																if (Number.isNaN(parseInt(e.target.value))) {
																	e.target.value =
																		entry[entryType()][item.id].bill_amount;
																	return;
																}
																setEntry(entryType(), item.id, (entry) => ({
																	...entry,
																	bill_amount: parseInt(e.target.value),
																}));
																calcTotals(entry[entryType()]);
																setAllTotals(entryType(), total());
																setTipTotal(allTotals.Tips);
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
													<td class='border-l border-r border-b border-border-gray bg-input-gray px-8'>
														{labels[item.id].change_label}
													</td>
													<td class='border-b border-border-gray p-2'>
														<input
															class='rounded-md border border-border-gray bg-input-gray text-center text-content-gray p-1 w-full'
															value={item.change_amount}
															onChange={(e) => {
																if (Number.isNaN(parseInt(e.target.value))) {
																	e.target.value =
																		entry[entryType()][item.id].change_amount;
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
																setTipTotal(allTotals.Tips);
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
											<td class='border-r border-b border-border-gray p-4 bg-input-gray'>
												Bill Total
											</td>
											<td class='border-b border-border-gray text-content-gray w-1/4'>
												${billTotal()}
											</td>
											<td class='border-t border-l border-r border-b border-border-gray bg-input-gray'>
												Coin Total
											</td>
											<td class='border-b border-border-gray text-content-gray w-1/4'>
												${changeTotal()}
											</td>
										</tr>
										<tr class='text-center'>
											<td class='border-r border-border-gray rounded-bl-lg p-4 bg-input-gray'>
												Total
											</td>
											<td
												class='text-content-gray'
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
									onClick={() => {
										setShowConfig(!showConfig());
									}}
								>
									Calculate Tip Rate
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
										setTipTotal(allTotals.Tips);
									}}
								>
									Clear Entry
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Show when={showConfig()}>
				<br></br>
				<TipConfig tip_total={tipTotal()}></TipConfig>
			</Show>
		</>
	);
};

export default EntryDisplay;
