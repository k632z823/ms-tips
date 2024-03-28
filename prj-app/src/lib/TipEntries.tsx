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

interface Entry {
	id: number;
	bill_amount: number;
	change_amount: number;
}
interface Label {
	bill_label: string;
	change_label: string;
}

interface EntryProps {
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

const EntryTable: Component = () => {
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
		setEntry(entry[entryType()]);
	});

	return (
		<>
			<div id='entry-table'>
				<div id='entry-info'>
					<div class='flex'>
						<div class='flex'>
							<label>Drawer: </label> <p>{allTotals.Drawer}</p>
						</div>
						<div class='flex'>
							<label>Tips: </label> <p>{allTotals.Tips}</p>
						</div>
						<div class='flex'>
							<label>Final: </label> <p>{allTotals.Final}</p>
						</div>
					</div>
					<button
						id='dropdownDefaultButton'
						data-dropdown-toggle='dropdown'
						class='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
						type='button'
						onClick={() => setDropDown(!dropDown())}
					>
						{entryType()}
						<svg
							class='w-2.5 h-2.5 ms-3'
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

					<Show when={dropDown()}>
						<div
							id='dropdown'
							class='z-10 bg-gray-500 divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700'
						>
							<ul
								class='py-2 text-sm text-gray-700 dark:text-gray-200'
								aria-labelledby='dropdownDefaultButton'
							>
								<li>
									<a
										onClick={() => {
											setEntryType("Drawer");
											calcTotals(entry[entryType()]);
										}}
										class='block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white'
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
										class='block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white'
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
										class='block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white'
									>
										Final
									</a>
								</li>
							</ul>
						</div>
					</Show>
				</div>
				<div id='entry-input'>
					<div class='flex justify-center'>
						<div class='border border-border-gray rounded-md w-11/12'>
							<table
								class='table-auto w-full'
								id='bills'
							>
								<tbody>
									<For each={entry[entryType()]}>
										{(item) => (
											<tr class='text-center text-sm'>
												<td class='border-r border-b border-border-gray bg-input-gray px-8'>
													{labels[item.id].bill_label}
												</td>
												<td class='border-b border-border-gray p-2'>
													<input
														class='rounded-md border border-border-gray bg-input-gray text-center text-content-gray p-1 w-20'
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
														class='rounded-md border border-border-gray bg-input-gray text-center text-content-gray p-1 w-20'
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
										<td class='border-r border-b border-border-gray text-sm p-4 bg-input-gray'>
											Bill Total
										</td>
										<td class='border-b border-border-gray text-sm text-content-gray'>
											{billTotal()}
										</td>
										<td class='border-t border-l border-r border-b border-border-gray text-sm bg-input-gray'>
											Coin Total
										</td>
										<td class='border-b border-border-gray text-sm text-content-gray'>
											{changeTotal()}
										</td>
									</tr>
									<tr class='text-center'>
										<td class='border-r border-border-gray rounded-bl-lg text-sm p-4 bg-input-gray'>
											Total
										</td>
										<td
											class='text-sm text-content-gray'
											colspan={3}
										>
											{total()}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
					<button
						class='m-5 border border-border-gray'
						onClick={() => {
							calcTotals(entry[entryType()]);
						}}
					>
						Submit
					</button>
				</div>
			</div>
		</>
	);
};

export default EntryTable;
