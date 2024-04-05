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
			const dropdownDefaultButton = document.getElementById(
				"dropdownDefaultButton",
			);
			if (
				dropdownDefaultButton &&
				!dropdownDefaultButton.contains(event.target as Node)
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
			<div class='flex justify-center px-5' id='entry-info'>
				<div class='border border-border-gray rounded-md w-full'>
					<table class='table-auto w-full'>
						<tbody>
							<tr class='border-border-gray'>
								<td class='p-2 align-top border-r border-border-gray text-xs text-mini-gray'>Drawer</td>
								<td class='p-2 align-top border-r border-border-gray text-xs text-mini-gray'>Tips</td>
								<td class='p-2 align-top text-xs text-mini-gray'>Final</td>
							</tr>
							<tr class='border-border-gray'>
								<td class='px-2 pb-2 w-1/3 border-r border-border-gray text-l text-right'>${allTotals.Drawer}</td>
								<td class='px-2 pb-2 w-1/3 border-r border-border-gray text-l text-right'>${allTotals.Tips}</td>
								<td class='px-2 pb-2 w-1/3 text-l text-right'>${allTotals.Final}</td>
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
										class='border border-border-gray rounded-md text-content-gray text-center px-2 py-1 hover:bg-border-gray inline-flex items-center justify-between w-full'
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
												stroke='currentColor'
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
											class='border border-border-gray bg-menu-gray rounded-md text-content-gray'
										>
											<ul
												class='py-2'
												aria-labelledby='dropdownDefaultButton'
											>
												<li>
													<a
														onClick={() => {
															setEntryType("Drawer");
															calcTotals(entry[entryType()]);
														}}
														class='block px-4 py-1 hover:bg-input-gray'
													>
														Drawer
													</a>
												</li>
												<li>
													<a
														onClick={() => {
															setEntryType("Tips");
															calcTotals(entry[entryType()]);
														}}
														class='block px-4 py-1 hover:bg-input-gray'
													>
														Tips
													</a>
												</li>
												<li>
													<a
														onClick={() => {
															setEntryType("Final");
															calcTotals(entry[entryType()]);
														}}
														class='block px-4 py-1 hover:bg-input-gray'
													>
														Final
													</a>
												</li>
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
																setEntry(entryType(), item.id, (entry) => ({
																	...entry,
																	bill_amount: parseInt(e.target.value),
																}));
																calcTotals(entry[entryType()]);
																setAllTotals(entryType(), total());
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
																setEntry(
																	entryType(),
																	item.id,
																	"change_amount",
																	parseInt(e.target.value),
																);
																calcTotals(entry[entryType()]);
																setAllTotals(entryType(), total());
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
							<div class='px-5 grid grid-cols-2 gap-5 text-sm font-light w-full'>
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
				<TipConfig tipTotal={400}></TipConfig>
			</Show>
		</>
	);
};

export default EntryDisplay;
