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
	drawer: Entry[];
	tips: Entry[];
	final: Entry[];
}

const labels: Label[] = [
	{
		bill_label: '1',
		change_label: '0.01',
	},
	{
		bill_label: '5',
		change_label: '0.05',
	},
	{
		bill_label: '10',
		change_label: '0.10',
	},
	{
		bill_label: '20',
		change_label: '0.25',
	},
	{
		bill_label: '50',
		change_label: '0.50',
	},
	{
		bill_label: '100',
		change_label: '1',
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
	const [entryType, setEntryType] = createSignal<entryTypes>("drawer");
	const [entry, setEntry] = createStore({
		drawer: JSON.parse(JSON.stringify(starter)),
		tips: JSON.parse(JSON.stringify(starter)),
		final: JSON.parse(JSON.stringify(starter)),
	});

	createEffect(() => {
		setEntry(entry[entryType()]);
	});

	return (
		<>
			<div id='entry-table'>
				<div id='entry-info'></div>
				<div id='entry-input'>
					<h1>{entryType()}</h1>
					<table
						class='table-auto'
						id='bills'
					>
						<tbody>
							<For each={entry[entryType()]}>
								{(item) => (
									<tr class='text-center text-sm border-2 border-border-gray'>
										<td class ='border-2 border-border-gray bg-input-gray'>{labels[item.id].bill_label}</td>
										<td class ='p-2'>
											<input
												class='rounded border-2 border-border-gray bg-input-gray text-center text-content-gray p-1 w-20'
												value={item.bill_amount}
												onChange={(e) => {
													setEntry(entryType(), item.id, (entry) => ({
														...entry,
														bill_amount: parseInt(e.target.value),
													}));
												}}
											></input>
										</td>
										<td class='border-2 border-border-gray bg-input-gray'>{labels[item.id].change_label}</td>
										<td class ='p-2'>
											<input
												class='rounded border-2 border-border-gray bg-input-gray text-center text-content-gray p-1 w-20'
												value={item.change_amount}
												onChange={(e) => {
													setEntry(
														entryType(),
														item.id,
														"change_amount",
														parseInt(e.target.value),
													);
												}}
											></input>
										</td>
									</tr>
								)}
							</For>
							<tr class='border-2 border-border-gray text-center border-t-2 border-orange-500'>
								<td class='border-2 border-border-gray text-sm p-4 bg-input-gray'>Bill Total</td>
								<td class='text-sm text-content-gray'>{billTotal()}</td>
								<td class ='border-2 border-border-gray text-sm bg-input-gray'>Coin Total</td>
								<td class='text-sm text-content-gray'>{changeTotal()}</td>
							</tr>
							<tr class='border-2 border-border-gray text-center border-t-2 border-orange-500'>
								<td class='border-2 border-border-gray text-sm p-4 bg-input-gray'>Total</td>
								<td class= 'text-sm text-content-gray' colspan={3}>{total()}</td>
							</tr>
						</tbody>
					</table>
					<button
						class='m-5 border-2 border border-border-gray'
						onClick={() => {
							setEntryType("tips");

							calcTotals(entry[entryType()]);
						}}
					>
						Tips
					</button>
					<button
						class='m-5 border-2 border border-border-gray'
						onClick={() => {
							setEntryType("drawer");

							calcTotals(entry[entryType()]);
						}}
					>
						Drawer
					</button>
					<button
						class='m-5 border-2 border border-border-gray'
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
