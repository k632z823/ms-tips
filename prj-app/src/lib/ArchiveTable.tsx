import { For, Component, createSignal, onMount, Show, from } from "solid-js";
import { createStore } from "solid-js/store";
import moment from "moment";
import axios from "axios";
import { Portal } from "solid-js/web";
import Modal from "./Utilities/Modal";
import ExportModal from "./Utilities/ExportModal";
import { useNavigate } from "@solidjs/router";
import { fromJSON } from "postcss";
import { mkConfig, generateCsv } from "export-to-csv";
import {
	EmployeeTipDistribution as EmployeeTipDistribution,
	getTipDistributions as getTipDistributions,
} from "./GetTipEntries";

interface Entry {
	id: number;
	date: string;
	drawer: number;
	tips: number;
	final: number;
	tipRate: number;
	tags: string;
	entry_no: number;
}

interface EntryRow {
	entry: Entry;
	number: number;
	momentDate: any;
	dropDownShown: boolean;
	viewShown: boolean;
}

async function getEntries() {
	let response = await axios.get("http://localhost:3001/get-archive-entries");
	let responseData = response.data.entries;
	let archiveEntries: EntryRow[] = [];
	for (let item of responseData) {
		let tags: string = "";
		item.tags.forEach((tag: string) => {
			if (item.tags.indexOf(tag) != item.tags.length - 1) {
				tags += tag + ", ";
			} else {
				tags += tag;
			}
		});
		archiveEntries.push({
			entry: {
				id: item.id,
				date: item.date,
				tips: item.tips,
				final: item.final,
				tipRate: item.tipRate,
				tags: tags,
				drawer: item.drawer,
				entry_no: item.entry_no,
			},
			number: responseData.indexOf(item),
			momentDate: moment(item.date),
			dropDownShown: false,
			viewShown: false,
		});
	}
	return archiveEntries;
}

async function deleteEntry(idToDelete: number) {
	let response = await axios.delete("http://localhost:3001/delete-entry", {
		params: {
			id: idToDelete,
		},
	});
}

async function getExportEntries(fromDate: string, toDate: string) {
	let response = await axios.get("http://localhost:3001/get-export-entries", {
		params: {
			fromDate: fromDate,
			toDate: toDate,
		},
	});
	let entries: any = response.data.entries;
	return entries;
}

const sortDate = (entryRowsToSort: EntryRow[], sortByDesc: boolean) => {
	let copyEntryRowsToSort: EntryRow[] = [...entryRowsToSort];

	copyEntryRowsToSort.sort((a, b) => {
		// sort by the date of the entry first
		const dateComparison = sortByDesc
			? b.momentDate.valueOf() - a.momentDate.valueOf()
			: a.momentDate.valueOf() - b.momentDate.valueOf();

		// if entries have the same date, order by entry_no
		if (dateComparison === 0) {
			return sortByDesc
				? b.entry.entry_no - a.entry.entry_no // Descending: 2, 1, 0
				: a.entry.entry_no - b.entry.entry_no; // Ascending: 0, 1, 2
		}

		return dateComparison;
	});

	setSortedEntryRows((rows) => (rows = [...copyEntryRowsToSort]));
};

let entryRows: EntryRow[] = []; //await getEntries();

const [sortedEntryRows, setSortedEntryRows] = createStore<EntryRow[]>(entryRows);

// used in Export modal to add an averages row at the bottom of the CSV
const calculateEntryRowsAverages = (entries: Entry[]) => {
	let sums: { tips: number; final: number; drawer: number } = {
		tips: 0,
		final: 0,
		drawer: 0,
	};

	let count = entries.length;

	for (let entry of entries) {
		sums.tips += Number(entry.tips);
		sums.final += Number(entry.final);
		sums.drawer += Number(entry.drawer);
	}

	let averages = {
		date: "averages",
		tips: parseFloat((sums.tips / count).toFixed(2)),
		final: parseFloat((sums.final / count).toFixed(2)),
		tags: "N/A",
		drawer: parseFloat((sums.drawer / count).toFixed(2)),
	};

	return averages;
};

// used to export/download and name CSV files
let download = (config: any) => {
	return function (csvContent: any, fileName: string) {
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = fileName; // set the filename here
		link.click();
		URL.revokeObjectURL(url);
	};
};

// let sortedEntryRows: entryRow[] = [...entryRows];
const [currentPage, setCurrentPage] = createSignal<number>(1);

const getCurrentPageRows = () => {
	let rowsPerPage: number = 15;
	let pages: number = Math.ceil(sortedEntryRows.length / rowsPerPage);

	let startEntryIndex: number = (currentPage() - 1) * rowsPerPage;
	let endEntryIndex = startEntryIndex + rowsPerPage;

	return sortedEntryRows.slice(startEntryIndex, endEntryIndex);
};

const prevPage = (toFirstPage?: boolean) => {
	let firstPage: number = 1;
	if (currentPage() != firstPage && toFirstPage) {
		setCurrentPage(firstPage);
	}
	if (currentPage() != firstPage) {
		setCurrentPage(currentPage() - 1);
	}
};

const nextPage = (toLastPage?: boolean) => {
	let lastPage: number = Math.ceil(sortedEntryRows.length / 15);
	if (currentPage() != lastPage && toLastPage) {
		setCurrentPage(lastPage);
	}
	if (currentPage() != lastPage) {
		setCurrentPage(currentPage() + 1);
	}
};

const ArchiveTable: Component = () => {
	onMount(async function () {
		entryRows = await getEntries();
		setSortedEntryRows(...[entryRows]);
		setDescDateSortOrder(true);
		sortDate(sortedEntryRows, descDateSortOrder());
		for (let item of sortedEntryRows) {
			setSortedEntryRows(sortedEntryRows.indexOf(item), (entry) => ({
				...entry,
				viewShown: false,
			}));
		}
		setRendered(true);
	});

	const [entry, setEntry] = createStore<EntryRow[]>(entryRows);
	const [selectedEntry, setSelectedEntry] = createSignal<number>(0);
	const [descDateSortOrder, setDescDateSortOrder] = createSignal<boolean>(true);
	const [tableShown, setTableShown] = createSignal<boolean>(true);
	const [rendered, setRendered] = createSignal<boolean>(false);
	const [confirmDeleteShown, setConfirmDeleteShown] = createSignal<boolean>(false);
	const [exportModalShown, setExportModalShown] = createSignal<boolean>(false);
	const [fromDate, setFromDate] = createSignal<string>("");
	const [toDate, setToDate] = createSignal<string>(moment().format("L"));
	const [validDateRange, setValidDateRange] = createSignal<boolean>(false);
	const [pageButtonsShown, setPageButtonsShown] = createSignal<boolean>(true);
	const [tipDistributions, setTipDistributions] = createStore<EmployeeTipDistribution[]>([]);

	const navigate = useNavigate();

	return (
		<>
			<Show when={tableShown()}>
				<div class='px-5 pb-4 text-sm'>
					<div class='flex'>
						<button
							class='py-1.5 px-3 inline-flex items-center justify-between text-center bg-black border border-border-gray rounded-md hover:bg-border-gray font-normal'
							onclick={() => {
								setExportModalShown(true);
								setEntry(selectedEntry(), (row) => ({
									...row,
									dropDownShown: false,
								}));
								getCurrentPageRows();
							}}
						>
							<svg
								class='mr-4 fill-icon-gray'
								stroke-width='0'
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 24 24'
								height='1em'
								width='1em'
								style='overflow: visible; color: currentcolor;'
							>
								<path d='M18 22a2 2 0 0 0 2-2v-5l-5 4v-3H8v-2h7v-3l5 4V8l-6-6H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12zM13 4l5 5h-5V4z'></path>
							</svg>
							Export
						</button>
					</div>
				</div>
				{/* <div class='pb-5 px-5 flex items-center'>
						<div class='flex-grow border-t border-border-gray'></div>
				</div> */}
				<div class='flex justify-center px-5'>
					<div class='border border-border-gray rounded-md w-full'>
						<table class='table-fixed text-sm font-normal w-full'>
							<thead>
								<tr class='text-table-header-gray text-start font-medium hover:bg-menu-gray'>
									{/* <td class='p-3 w-[44.5px] text-center rounded-tl-md'>
										#
									</td> */}
									<td class='pl-1 pr-3 w-[7rem]'>
										<button
											class='inline-flex items-center justify-between w-full h-[2.2rem] rounded-md hover:bg-border-gray hover:text-white'
											onClick={() => {
												setDescDateSortOrder(!descDateSortOrder());
												sortDate(sortedEntryRows, descDateSortOrder());
											}}
										>
											<span class='pl-2'>Date</span>
											<Show when={descDateSortOrder()}>
												<svg
													class='mr-1 fill-table-header-gray icon'
													stroke-width='0'
													xmlns='http://www.w3.org/2000/svg'
													viewBox='0 0 24 24'
													height='1.5em'
													width='1.5em'
													style='overflow: visible; color: currentcolor;'
												>
													<path d='m12 15-4.243-4.242 1.415-1.414L12 12.172l2.828-2.828 1.415 1.414L12 15.001Z'></path>
												</svg>
											</Show>
											<Show when={!descDateSortOrder()}>
												<svg
													class='mr-1 fill-table-header-gray icon'
													stroke-width='0'
													xmlns='http://www.w3.org/2000/svg'
													viewBox='0 0 24 24'
													height='1.5em'
													width='1.5em'
													style='overflow: visible; color: currentcolor;'
												>
													<path d='m12 11.828-2.828 2.829-1.415-1.414L12 9l4.243 4.243-1.415 1.414L12 11.828Z'></path>
												</svg>
											</Show>
										</button>
									</td>
									<td class='p-3 w-[4.5rem]'>Drawer</td>
									<td class='p-3 w-[4.5rem]'>Tips</td>
									<td class='p-3 w-[4.5rem]'>Final</td>
									{/* <td class='p-3 border-r border-border-gray'>Tip Rate</td> */}
									{/* <th>Base</th> */}
									{/* <td class='p-3'>Tags</td> */}
									<td class='p-3 w-[2.5rem]'></td>
								</tr>
							</thead>
							<tbody>
								{/* <For each={sortedEntryRows}> */}
								<For each={getCurrentPageRows()}>
									{(entryRow) => (
										<tr class='border-t border-border-gray text-white hover:bg-menu-gray'>
											{/* <td class='p-3 text-center'>
												{sortedEntryRows.indexOf(entryRow) + 1}
											</td> */}
											<td class='p-3'>
												{moment(entryRow.momentDate).format("L")}
											</td>
											<td class='p-3'>${entryRow.entry.drawer}</td>
											<td class='p-3'>${entryRow.entry.tips}</td>
											<td class='p-3'>${entryRow.entry.final}</td>
											{/* <td class='p-3 border-r border-border-gray'>{entry.tipRate}</td> */}
											{/* <td>{entry.base}</td> */}
											{/* <td class='p-3'>
												<div class='text-nowrap overflow-x-auto'>
													{entryRow.entry.tags.toString()}
												</div>
											</td> */}
											<td class='text-center font-normal'>
												<button
													class='m-1 rounded-md items-center hover:bg-border-gray'
													onClick={async function () {
														if (selectedEntry() != entryRow.number) {
															setEntry(selectedEntry(), (row) => ({
																...row,
																dropDownShown: false,
															}));
															setSelectedEntry(entryRow.number);
															setConfirmDeleteShown(false);
															// get the tip distributions based on the selected row's ID in the database
															setTipDistributions(
																await getTipDistributions(entryRow.entry.id),
															);
														}

														setEntry(selectedEntry(), (row) => ({
															...row,
															dropDownShown: !row.dropDownShown,
														}));

														// for (let item of sortedEntryRows) {
														//     setSortedEntryRows(sortedEntryRows.indexOf(item), (entry) => ({
														//         ...entry,viewShown: false,
														//     }));
														// }
													}}
												>
													{/* row action list */}
													<Show
														when={
															selectedEntry() == entryRow.number &&
															entry[selectedEntry()].dropDownShown
														}
													>
														<div class='flex justify-end'>
															<div class='mt-8 py-1 z-50 w-[7rem] absolute'>
																<div class='bg-black border border-border-gray rounded-md text-white'>
																	<ul class='font-normal'>
																		<div class='px-1 pt-1'>
																			<li class='block px-3 py-2 hover:bg-input-gray hover:rounded'>
																				<button
																					class='w-full flex justify-start'
																					onclick={() => {
																						setEntry(
																							selectedEntry(),
																							(row) => ({
																								...row,
																								dropDownShown: false,
																							}),
																						);
																						setTableShown(false);
																						setConfirmDeleteShown(false);
																						setPageButtonsShown(false);
																						setSortedEntryRows(
																							selectedEntry(),
																							(entry) => ({
																								...entry,
																								viewShown: !entry.viewShown,
																							}),
																						);
																					}}
																				>
																					View
																				</button>
																			</li>
																		</div>
																		<div class='px-1 pb-1'>
																			<li
																				class='flex justify-start px-3 py-2 hover:bg-input-gray hover:rounded'
																				onClick={() => {
																					navigate(
																						"/Entries/" +
																							entryRows[
																								selectedEntry()
																							].momentDate.format(
																								"MM-DD-YYYY",
																							) +
																							"/" +
																							entryRows[selectedEntry()].entry
																								.entry_no,
																						{
																							replace: true,
																						},
																					);
																				}}
																			>
																				Edit
																			</li>
																		</div>
																		<div class='border-t border-border-gray'>
																			<div class='p-1'>
																				<li class='block px-3 py-2 hover:bg-select-red hover:rounded text-red'>
																					<button
																						class='w-full inline-flex justify-between items-center'
																						onclick={() => {
																							setConfirmDeleteShown(true);
																							setEntry(
																								selectedEntry(),
																								(row) => ({
																									...row,
																									dropDownShown: false,
																								}),
																							);
																						}}
																					>
																						Delete
																						<svg
																							class='stroke-red'
																							fill='none'
																							stroke-width='2'
																							xmlns='http://www.w3.org/2000/svg'
																							stroke='currentcolor'
																							stroke-linecap='round'
																							stroke-linejoin='round'
																							viewBox='0 0 24 24'
																							height='1em'
																							width='1em'
																							style='overflow: visible; color: currentcolor;'
																						>
																							<path d='M3 6 5 6 21 6'></path>
																							<path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'></path>
																							<path d='M10 11 10 17'></path>
																							<path d='M14 11 14 17'></path>
																						</svg>
																					</button>
																				</li>
																			</div>
																		</div>
																	</ul>
																</div>
															</div>
														</div>
													</Show>
													<svg
														class='p-1.5 fill-white w-full h-full'
														stroke-width='0'
														xmlns='http://www.w3.org/2000/svg'
														viewBox='0 0 24 24'
														height='1.5em'
														width='1.5em'
														style='overflow: visible; color: currentcolor;'
													>
														<path d='M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'></path>
													</svg>
												</button>
											</td>
										</tr>
									)}
								</For>
							</tbody>
						</table>
					</div>
				</div>
			</Show>
			{/* page buttons */}
			<Show when={pageButtonsShown()}>
				<div>
					<div class='px-5 pt-4 flex justify-between items-center'>
						{/* current page */}
						<div class='font-semibold text-content-gray text-sm'>
							Page {currentPage()} of {Math.ceil(sortedEntryRows.length / 15)}
						</div>
						<div class='space-x-2'>
							{/* go to first page */}
							<button
								class={`p-2 border border-border-gray rounded-md ${
									currentPage() === 1 ? "bg-black" : "hover:bg-border-gray"
								}`}
								onClick={() => {
									prevPage(true);
									setEntry(selectedEntry(), (row) => ({
										...row,
										dropDownShown: false,
									}));
								}}
								disabled={currentPage() === 1}
							>
								<svg
									class={`${
										currentPage() === 1 ? "fill-icon-gray" : "fill-white"
									}`}
									stroke-width='0'
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 24 24'
									height='1em'
									width='1em'
									style='overflow: visible; color: currentcolor;'
								>
									<path d='m16.293 17.707 1.414-1.414L13.414 12l4.293-4.293-1.414-1.414L10.586 12zM7 6h2v12H7z'></path>
								</svg>
							</button>
							{/* go to prev page */}
							<button
								class={`p-2 border border-border-gray rounded-md ${
									currentPage() === 1 ? "bg-black" : "hover:bg-border-gray"
								}`}
								onClick={() => {
									prevPage();
									setEntry(selectedEntry(), (row) => ({
										...row,
										dropDownShown: false,
									}));
								}}
								disabled={currentPage() === 1}
							>
								<svg
									class={`${
										currentPage() === 1 ? "fill-icon-gray" : "fill-white"
									}`}
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
							{/* go to next page */}
							<button
								class={`p-2 border border-border-gray rounded-md ${
									currentPage() === Math.ceil(sortedEntryRows.length / 15)
										? "bg-black"
										: "hover:bg-border-gray"
								}`}
								onClick={() => {
									nextPage();
									setEntry(selectedEntry(), (row) => ({
										...row,
										dropDownShown: false,
									}));
								}}
								disabled={
									currentPage() === Math.ceil(sortedEntryRows.length / 15)
								}
							>
								<svg
									class={`${
										currentPage() === Math.ceil(sortedEntryRows.length / 15)
											? "fill-icon-gray"
											: "fill-white"
									}`}
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
							{/* go to last page */}
							<button
								class={`p-2 border border-border-gray rounded-md ${
									currentPage() === Math.ceil(sortedEntryRows.length / 15)
										? "bg-black"
										: "hover:bg-border-gray"
								}`}
								onClick={() => {
									nextPage(true);
									setEntry(selectedEntry(), (row) => ({
										...row,
										dropDownShown: false,
									}));
								}}
								disabled={
									currentPage() === Math.ceil(sortedEntryRows.length / 15)
								}
							>
								<svg
									class={`${
										currentPage() === Math.ceil(sortedEntryRows.length / 15)
											? "fill-icon-gray"
											: "fill-white"
									}`}
									stroke-width='0'
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 24 24'
									height='1em'
									width='1em'
									style='overflow: visible; color: currentcolor;'
								>
									<path d='M7.707 17.707 13.414 12 7.707 6.293 6.293 7.707 10.586 12l-4.293 4.293zM15 6h2v12h-2z'></path>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</Show>
			<div>
				{/* VIEW ENTRY WINDOW, APEPARS AFTER CLICKING VIEW */}
				<Show when={rendered()}>
					<Show when={sortedEntryRows[selectedEntry()].viewShown}>
						<Portal>
							<div class='fixed top-[4.5rem] w-full'>
								<div class='flex flex-col justify-center px-5'>
									{/* New navigation bar */}
									<div class='p-1.5 grid grid-cols-3 items-center border border-border-gray rounded-md'>
										<div class='justify-self-start'>
											<button
												class='p-2 inline-flex justify-between items-center rounded-md hover:bg-border-gray text-sm'
												onclick={() => {
													setTableShown(true);
													setPageButtonsShown(true);
													setSortedEntryRows(selectedEntry(), (entry) => ({
														...entry,
														viewShown: false,
													}));
												}}
											>
												<svg
													class='fill-white'
													stroke-width='0'
													xmlns='http://www.w3.org/2000/svg'
													viewBox='0 0 384 512'
													height='1em'
													width='1em'
													style='overflow: visible; color: currentcolor; transform: rotate(-90deg);'
												>
													<path d='M32 448c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c53 0 96-43 96-96V109.3l73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l73.3-73.4V416c0 17.7-14.3 32-32 32H32z'></path>
												</svg>
											</button>
										</div>
										<div class='justify-self-center inline-flex items-center rounded-md '>
											{/* button to go to previous date's entry in view portal*/}
											<button
												class={`mr-1 p-2 rounded-md ${
													selectedEntry() == 0 ? "" : "hover:bg-border-gray"
												}`}
												onclick={async function () {
													setSortedEntryRows(selectedEntry(), (entry) => ({
														...entry,
														viewShown: false,
													}));
													setSelectedEntry(selectedEntry() - 1);
													setSortedEntryRows(selectedEntry(), (entry) => ({
														...entry,
														viewShown: true,
													}));
													setTipDistributions(
														await getTipDistributions(
															entryRows[selectedEntry()].entry.id,
														),
													);
												}}
												disabled={selectedEntry() == 0}
											>
												<svg
													class={`${
														selectedEntry() == 0
															? "fill-icon-gray"
															: "fill-white"
													}`}
													stroke-width='0'
													xmlns='http://www.w3.org/2000/svg'
													viewBox='0 0 24 24'
													height='1em'
													width='1em'
													style='overflow: visible; color: currentcolor;'
												>
													<path d='M13.939 4.939 6.879 12l7.06 7.061 2.122-2.122L11.121 12l4.94-4.939z'></path>
												</svg>
											</button>
											<span class='w-[6rem] text-center'>
												{entryRows[selectedEntry()].momentDate
													.format("L")
													.toString()}
											</span>
											{/* button to go to next date's entry in view portal*/}
											<button
												class={`ml-1 p-2 rounded-md ${
													selectedEntry() == sortedEntryRows.length - 1
														? ""
														: "hover:bg-border-gray"
												}`}
												onclick={async function () {
													setSortedEntryRows(selectedEntry(), (entry) => ({
														...entry,
														viewShown: false,
													}));
													setSelectedEntry(selectedEntry() + 1);
													setSortedEntryRows(selectedEntry(), (entry) => ({
														...entry,
														viewShown: true,
													}));
													setTipDistributions(
														await getTipDistributions(
															entryRows[selectedEntry()].entry.id,
														),
													);
												}}
												disabled={selectedEntry() == sortedEntryRows.length - 1}
											>
												<svg
													class={`${
														selectedEntry() == sortedEntryRows.length - 1
															? "fill-icon-gray"
															: "fill-white"
													}`}
													stroke-width='0'
													xmlns='http://www.w3.org/2000/svg'
													viewBox='0 0 24 24'
													height='1em'
													width='1em'
													style='overflow: visible; color: currentcolor;'
												>
													<path d='M10.061 19.061 17.121 12l-7.06-7.061-2.122 2.122L12.879 12l-4.94 4.939z'></path>
												</svg>
											</button>
										</div>
										<div class='justify-self-end'>
											{/* PENCIL - EDIT BUTTON */}
											<button
												class='mr-1 p-2 rounded-md hover:bg-border-gray'
												onClick={() => {
													navigate(
														"/Entries/" +
															entryRows[selectedEntry()].momentDate.format(
																"MM-DD-YYYY",
															) +
															"/0" +
															entryRows[selectedEntry()].entry.entry_no,
														{
															replace: true,
														},
													);
												}}
											>
												<svg
													class='fill-white'
													stroke-width='0'
													xmlns='http://www.w3.org/2000/svg'
													viewBox='0 0 1024 1024'
													height='1em'
													width='1em'
													style='overflow: visible; color: currentcolor;'
												>
													<path d='M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 0 0 0-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 0 0 9.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9zm67.4-174.4L687.8 215l73.3 73.3-362.7 362.6-88.9 15.7 15.6-89zM880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32z'></path>
												</svg>
											</button>
											{/* TRASH CAN - DELETE BUTTON */}
											<button
												class='p-2 rounded-md hover:bg-select-red'
												onclick={() => {
													setConfirmDeleteShown(true);
													setEntry(selectedEntry(), (row) => ({
														...row,
														dropDownShown: false,
													}));
												}}
											>
												<svg
													class='stroke-red'
													fill='none'
													stroke-width='2'
													xmlns='http://www.w3.org/2000/svg'
													stroke='currentcolor'
													stroke-linecap='round'
													stroke-linejoin='round'
													viewBox='0 0 24 24'
													height='1em'
													width='1em'
													style='overflow: visible; color: currentcolor;'
												>
													<path d='M3 6 5 6 21 6'></path>
													<path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'></path>
													<path d='M10 11 10 17'></path>
													<path d='M14 11 14 17'></path>
												</svg>
											</button>
										</div>
									</div>
									<div class='inline-flex justify-between items-center mt-3 py-2 px-3 border-x border-t border-border-gray rounded-t-md text-sm font-medium bg-menu-gray'>
										Entry details
										{/* <svg
											class="fill-border-gray"
											stroke-width="0"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 512 512"
											height="1.3em"
											width="1.3em"
											style="overflow: visible; color: currentcolor;">
											<path class="fill-none stroke-border-gray" stroke-linejoin="round" stroke-width="40" d="M416 221.25V416a48 48 0 0 1-48 48H144a48 48 0 0 1-48-48V96a48 48 0 0 1 48-48h98.75a32 32 0 0 1 22.62 9.37l141.26 141.26a32 32 0 0 1 9.37 22.62Z"></path><path class="fill-none stroke-border-gray" stroke-linecap="round" stroke-linejoin="round" stroke-width="40" d="M256 56v120a32 32 0 0 0 32 32h120"></path>
										</svg> */}
									</div>
									<div class='border border-border-gray rounded-b-md'>
										<table class='table-fixed w-full text-sm'>
											<tbody>
												<tr class='border-b border-border-gray font-medium text-table-header-gray'>
													<td class='p-3 w-1/2'>Classification</td>
													<td class='p-3'>Amount</td>
												</tr>
												<tr class='border-b border-border-gray'>
													<td class='p-3'>Drawer</td>
													<td class='p-3'>
														${entryRows[selectedEntry()].entry.drawer}
													</td>
												</tr>
												<tr class='border-b border-border-gray'>
													<td class='p-3'>Tips</td>
													<td class='p-3'>
														${entryRows[selectedEntry()].entry.tips}
													</td>
												</tr>
												<tr class='border-b border-border-gray'>
													<td class='p-3'>Final</td>
													<td class='p-3'>
														${entryRows[selectedEntry()].entry.final}
													</td>
												</tr>
												<tr class='border-b border-border-gray'>
													<td class='p-3'>Tip Rate</td>
													<td class='p-3'>
														${entryRows[selectedEntry()].entry.tipRate}
													</td>
												</tr>
												<tr class=''>
													<td class='p-3'>Tags</td>
													<td class='p-3'>
														<div class='text-nowrap overflow-x-auto'>
															{entryRows[selectedEntry()].entry.tags.length > 0
																? entryRows[selectedEntry()].entry.tags
																: "None"}
														</div>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
									<div class='mt-3 py-2 px-3 inline-flex justify-between items-center border-x border-t border-border-gray rounded-t-md text-sm font-medium bg-menu-gray'>
										Employee details
										{/* <svg
											class="fill-border-gray"
											stroke-width="0"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 16 16"
											height="1.4em"
											width="1.4em"
											style="overflow: visible; color: currentcolor;">
											<path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z"></path>
										</svg> */}
									</div>
									<div class='h-[405px] flex flex-col overflow-y-scroll border border-border-gray rounded-b-md text-sm'>
										<For each={tipDistributions}>
											{(distribution, index) => (
												<div class='border-b border-border-gray w-full'>
													<div class='p-3 grid grid-cols-[30px_auto] border-b border-border-gray w-full'>
														<div class='font-medium text-table-header-gray'>
															{index() + 1}
														</div>
														<div class="flex flex-col">
															<div class="flex justify-between">
																<span class="font-normal">{distribution.name}</span>
																<span class="font-medium text-content-gray">{distribution.title}</span>
															</div>
														</div>
													</div>
													<table class='table-fixed w-full text-sm'>
														<tbody>
															<tr class="border-b border-border-gray font-medium text-table-header-gray">
																{/* <td class="p-3 w-1/4">
																	Title
																</td> */}
																<td class="p-3">
																	Hours
																</td>
																<td class="p-3">
																	Initial
																</td>
																<td class="p-3">
																	Tips
																</td>
																<td class="p-3">
																	Total
																</td>
																<td class="p-3">
																	Offset
																</td>
															</tr>
															<tr>
																{/* <td class="p-3">
																	{distribution.title}
																</td> */}
																<td class="p-3">
																	{distribution.hours}
																</td>
																<td class="p-3">
																	${distribution.initial}
																</td>
																<td class="p-3">
																	${distribution.tips_received}
																</td>
																<td class='p-3'>${distribution.total}</td>
																<td class='p-3'>${distribution.offset}</td>
															</tr>
														</tbody>
													</table>
												</div>
											)}
										</For>
									</div>
								</div>
							</div>
						</Portal>
					</Show>
				</Show>
			</div>
			{/* delete modal */}
			<Show when={confirmDeleteShown()}>
				<Modal
					header={"Are you sure?"}
					body={
						<div>
							This will permanently delete the entry created on{" "}
							{entryRows[selectedEntry()].momentDate.format("L").toString()}.
						</div>
					}
					denyButton={
						<button
							class='w-full p-1.5 text-center border border-border-gray hover:bg-border-gray rounded-md'
							onclick={() => setConfirmDeleteShown(false)}
						>
							Cancel
						</button>
					}
					confirmButton={
						<button
							class='w-full p-1.5 text-center text-red font-medium border border-border-red rounded-md bg-select-red hover:bg-border-red hover:text-white'
							onclick={async function () {
								await deleteEntry(entryRows[selectedEntry()].entry.id);
								setRendered(false);
								entryRows = await getEntries();
								setSortedEntryRows((entry) => [...entryRows]);
								sortDate(sortedEntryRows, descDateSortOrder());
								setSelectedEntry(0);
								setRendered(true);
								setConfirmDeleteShown(false);
							}}
						>
							Continue
						</button>
					}
				></Modal>
			</Show>
			{/* export modal, appears when export button is clicked */}
			<Show when={exportModalShown()}>
				<ExportModal
					header='Export entries'
					body={
						<div class='w-full'>
							Select the start and end dates to export data within a specific
							range.
							<div class='flex flex-row justify-between items-center pt-5'>
								<input
									id='from-date'
									type='date'
									class='px-2 py-1 border border-border-gray rounded-md bg-black text-white appearance-none'
									onchange={(e) => {
										let invalidFromDateMsg =
											document.getElementById("invalid-from-date");
										if (moment(e.target.value).isAfter(moment(toDate()))) {
											setFromDate("");
											e.target.value = "";
											//@ts-ignore
											invalidFromDateMsg.innerHTML = "Invalid date";
											setValidDateRange(false);
										} else {
											setFromDate(e.target.value);
											//@ts-ignore
											invalidFromDateMsg.innerHTML = "";
											setValidDateRange(true);
											if (toDate() != "") {
												setValidDateRange(true);
											}
										}
									}}
								/>
								<svg
									class='fill-icon-gray'
									stroke-width='0'
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 24 24'
									height='1.5em'
									width='1.5em'
									style='overflow: visible; color: currentcolor;'
								>
									<path d='M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z'></path>
								</svg>
								<input
									id='to-date'
									type='date'
									class='border border-border-gray rounded-md bg-black text-white px-2 py-1'
									value={moment().format("YYYY-MM-DD")}
									onchange={(e) => {
										let invalidToDateMsg =
											document.getElementById("invalid-to-date");
										if (moment(e.target.value).isBefore(moment(fromDate()))) {
											setToDate("");
											e.target.value = "";
											//@ts-ignore
											invalidToDateMsg.innerHTML = "Invalid date";
											setValidDateRange(false);
										} else {
											setToDate(e.target.value);
											//@ts-ignore
											invalidToDateMsg.innerHTML = "";
											if (fromDate() != "") {
												setValidDateRange(true);
											}
										}
									}}
								/>
							</div>
							<div id='invalid-from-date'></div>
							<div id='invalid-to-date'></div>
						</div>
					}
					denyButton={
						<button
							class='py-1.5 px-6 w-full text-center border border-border-gray hover:bg-border-gray rounded-md'
							onclick={() => {
								setFromDate("");
								setToDate(moment().format("YYYY-MM-DD"));
								setExportModalShown(false);
							}}
						>
							Cancel
						</button>
					}
					confirmButton={
						<button
							class={
								validDateRange()
									? "py-1.5 px-6 w-full text-center text-black font-medium rounded-md bg-white hover:bg-white/90"
									: "py-1.5 px-6 w-full text-center text-black font-medium rounded-md bg-white hover:bg-white/90"
							}
							onclick={async function (e) {
								if (validDateRange()) {
									let entries = await getExportEntries(fromDate(), toDate());
									entries.push(calculateEntryRowsAverages(entries));
									const csvConfig = mkConfig({ useKeysAsHeaders: true });
									const csv = generateCsv(csvConfig)(entries);
									const fileName = `${fromDate()}_to_${moment(toDate()).format(
										"YYYY-MM-DD",
									)}_tippyExport`;
									download(csvConfig)(csv, fileName);
								} else if (!validDateRange()) {
								}
							}}
						>
							Export
						</button>
					}
				></ExportModal>
			</Show>
		</>
	);
};

export default ArchiveTable;
