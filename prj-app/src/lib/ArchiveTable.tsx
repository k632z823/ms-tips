import { For, Component, createSignal, onMount, Show, from, createEffect, onCleanup } from "solid-js";
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

// interface for entries pulled from the archive_entries table
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

// interface for the rows in the table for each entry
interface EntryRow {
	entry: Entry;
	number: number;
	momentDate: any;
	dropDownShown: boolean;  // the dropdown opened by clicking the three dots at the end of each row, provides actions
	viewShown: boolean;      // after clicking View from that action dropdown, extra info about that entry will be displayed
}

// pulls every entry from the archive_entries table
async function getEntries() {
	let response = await axios.get(
		import.meta.env.VITE_API_URL + "get-archive-entries"
	);
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

// deletes an entry from the database, removing rows in the archive_entries, tip_distribution_records, and entries tables
async function deleteEntry(idToDelete: number) {
	let response = await axios.delete(
		import.meta.env.VITE_API_URL + "delete-entry", {
		params: {
			id: idToDelete,
		},
	});
}

// pulls entries with in a date range to be exported in a spreadsheet
async function getExportEntries(fromDate: string, toDate: string) {
	let response = await axios.get(
		import.meta.env.VITE_API_URL + "get-export-entries", {
		params: {
			fromDate: fromDate,
			toDate: toDate,
		},
	});
	let entries: any = response.data.entries;
	return entries;
}

// switches the sorting of entry rows between ascending and descending by date
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

// initializes the list to hold every entry pulled to an empty array
let entryRows: EntryRow[] = []; 

// this array contains all those rows pulled but sorted by date, the rows that are populating the table on this page
const [sortedEntryRows, setSortedEntryRows] = createStore<EntryRow[]>(entryRows);

// function used in Export modal to add an averages row at the bottom of the CSV
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

// function to export/download and name CSV files
let download = (config: any) => {
	return function (csvContent: any, fileName: string) {
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = fileName;
		link.click();
		URL.revokeObjectURL(url);
	};
};

// tracks the current page of the table
const [currentPage, setCurrentPage] = createSignal<number>(1);

// function to get the rows that should show depending on the current table page
const getCurrentPageRows = () => {
	let rowsPerPage: number = 15;
	let pages: number = Math.ceil(sortedEntryRows.length / rowsPerPage);

	let startEntryIndex: number = (currentPage() - 1) * rowsPerPage;
	let endEntryIndex = startEntryIndex + rowsPerPage;

	return sortedEntryRows.slice(startEntryIndex, endEntryIndex);
};

// function to go to the previous table page or first page
const prevPage = (toFirstPage?: boolean) => {
	let firstPage: number = 1;
	if (currentPage() != firstPage && toFirstPage) {
		setCurrentPage(firstPage);
	}
	if (currentPage() != firstPage) {
		setCurrentPage(currentPage() - 1);
	}
};

// function to go to the next table page or last page
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
	// on mount the entries are pulled and sorted by descending order
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
	const [invalidFromDateMsg, setInvalidFromDateMsg] = createSignal("");
	const [invalidToDateMsg, setInvalidToDateMsg] = createSignal("");

	const navigate = useNavigate();

	// this createEffect is used only for closing the dropDown when clicking anywhere else on the page
	let buttonRef: any;
	let dropdownRef: any;
	createEffect(() => {
	  const handleClickOutside = (e: any) => {
		if (
		  buttonRef &&
		  !buttonRef.contains(e.target) &&
		  dropdownRef &&
		  !dropdownRef.contains(e.target)
		) {
		  setEntry(selectedEntry(), (row) => ({
			...row,
			dropDownShown: false,
		  }));
		}
	  };
  
	  // re-add the event listener to the document when a dropdown is opened
	  if (selectedEntry() != null && entry[selectedEntry()]?.dropDownShown) {
		document.addEventListener("click", handleClickOutside);
	  }
  
	  onCleanup(() => {
		document.removeEventListener("click", handleClickOutside);
	  });
	});

	return (
		<>
			<Show when={tableShown()}>
				{/* start of the div containg the Export button */}
				<div class='px-5 pb-4 text-sm'>					
					<div class='flex'>
						<button
							class='py-1.5 px-3 inline-flex items-center justify-between text-center bg-black border border-border-gray rounded-md hover:bg-border-gray font-medium'
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
				{/* end of the div containg the Export button */}
				<div class='flex justify-center px-5'>
					<div class='border border-border-gray rounded-md w-full'>
						<table class='table-fixed text-sm font-normal w-full'>
							<thead>
								{/* start of the header row of the table */}
								<tr class='text-table-header-gray text-start font-medium hover:bg-menu-gray'>
									<td class='pl-1 pr-3 w-[6.2rem]'>
										<button
											class='inline-flex items-center justify-between w-full h-[2rem] rounded hover:bg-border-gray hover:text-white'
											// switch between descending and ascending date by clicking
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
									<td class='p-3 w-[4rem]'>Drawer</td>
									<td class='p-3 w-[4rem]'>Tips</td>
									<td class='p-3 w-[4rem]'>Final</td>
									<td class='p-3 w-[2.5rem]'></td>
								</tr>
								{/* end of the header row of the table */}
							</thead>
							<tbody>
								{/* start of displaying each row for that current page */}
								<For each={getCurrentPageRows()}>
									{(entryRow) => (
										<tr class='border-t border-border-gray text-white font-medium hover:bg-menu-gray'>
											{/* the first four columns values for each row */}
											<td class='p-3'>
												{moment(entryRow.momentDate).format("L")}
											</td>
											<td class='p-3'>${entryRow.entry.drawer}</td>
											<td class='p-3'>${entryRow.entry.tips}</td>
											<td class='p-3'>${entryRow.entry.final}</td>
											{/* start of the three dots button */}
											<td class='text-center font-normal'>
												<button
													ref={buttonRef}
													class='m-1 rounded-md items-center hover:bg-border-gray'
													onClick={async function () {
														// when clicking on the three dots, selectedEntry, a number, is set to the entry of that row's number,
														// if that selectedEntry number does not equal the current entryRow's number, that means a new row was clicked on,
														// then set dropDownShown for the new row to true and set the old row's to false									
														if (selectedEntry() != entryRow.number) {
															setEntry(selectedEntry(), (row) => ({
																...row,
																dropDownShown: false,
															}));
															setSelectedEntry(entryRow.number);
															setConfirmDeleteShown(false);

															// get the tip distributions of the selected row based on the selected row's ID in the database
															setTipDistributions(
																await getTipDistributions(entryRow.entry.id),
															);
														}
															
														setEntry(selectedEntry(), (row) => ({
															...row,
															dropDownShown: !row.dropDownShown,
														}));
													}}
												>
													{/* start of the row action options, the actual dropdown element*/}
													<Show
														when={
															selectedEntry() == entryRow.number &&
															entry[selectedEntry()].dropDownShown
														}
													>
														<div ref={dropdownRef} class='flex justify-end'>
															<div class='mt-8 py-1 z-50 w-[7rem] absolute'>
																<div class='bg-black border border-border-gray rounded-md text-white'>
																	<ul class='font-medium'>
																		{/* start of the view button */}
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
																		{/* end of the view button */}
																		{/* start of the edit button */}
																		<div class='px-1 pb-1'>
																			<li
																				class='flex justify-start px-3 py-2 hover:bg-input-gray hover:rounded'
																				onClick={() => {
																					// go to the create entry page with this entry's data loaded for editing
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
																		{/* end of the edit button */}
																		{/* start of the delete button */}
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
																		{/* end of the delete button */}
																	</ul>
																</div>
															</div>
														</div>
													</Show>
													{/* end of the row action options, the actual dropdown element*/}
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
											{/* end of the three dots drop down */}
										</tr>
									)}
								</For>
								{/* end of displaying each row for that current page */}
							</tbody>
						</table>
					</div>
				</div>
			</Show>
			{/* start of the buttons to navigate the table pages*/}
			<Show when={pageButtonsShown()}>
				<div>
					<div class='px-5 pt-4 flex justify-between items-center'>
						{/* current page display*/}
						<div class='font-semibold text-content-gray text-sm'>
							Page {currentPage()} of {Math.ceil(sortedEntryRows.length / 15)}
						</div>
						<div class='space-x-2'>
							{/* start of go to first page button*/}
							<button
								class={`p-2 border border-border-gray rounded-md ${currentPage() === 1 ? "bg-black" : "hover:bg-border-gray"
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
									class={`${currentPage() === 1 ? "fill-icon-gray" : "fill-white"
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
							{/* end of go to first page button*/}
							{/* start of go to prev page button */}
							<button
								class={`p-2 border border-border-gray rounded-md ${currentPage() === 1 ? "bg-black" : "hover:bg-border-gray"
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
									class={`${currentPage() === 1 ? "fill-icon-gray" : "fill-white"
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
							{/* end of go to prev page button */}
							{/* start of go to next page button */}
							<button
								class={`p-2 border border-border-gray rounded-md ${currentPage() === Math.ceil(sortedEntryRows.length / 15)
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
									class={`${currentPage() === Math.ceil(sortedEntryRows.length / 15)
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
							{/* end of go to next page button */}
							{/* start of go to last page button */}
							<button
								class={`p-2 border border-border-gray rounded-md ${currentPage() === Math.ceil(sortedEntryRows.length / 15)
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
									class={`${currentPage() === Math.ceil(sortedEntryRows.length / 15)
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
							{/* end of go to last page button */}
						</div>
					</div>
				</div>
			</Show>
			{/* end of the buttons to navigate the table pages*/}
			<div>
				{/* start of the view window for an entry, hides table and opens up the view window when clicking View in the dropdown for a row */}
				<Show when={rendered()}>
					<Show when={sortedEntryRows[selectedEntry()].viewShown}>
						<Portal>
							<div class='pb-[1.5rem] absolute top-[4.5rem] w-full z-50'>
								<div class='flex flex-col justify-center px-5'>
									{/* New navigation bar */}
									<div class='p-1.5 grid grid-cols-3 items-center border border-border-gray rounded-md'>
										{/* start of button to close view window and return to the table */}
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
										{/* end of button to close view window and return to the table */}
										<div class='justify-self-center inline-flex items-center rounded-md '>
											{/* start button to go to previous date's entry in view portal*/}
											<button
												class={`mr-1 p-2 rounded-md ${selectedEntry() == 0 ? "" : "hover:bg-border-gray"
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
													class={`${selectedEntry() == 0
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
											{/* end button to go to previous date's entry in view portal*/}
											<span class='w-[6rem] text-center'>
												{entryRows[selectedEntry()].momentDate
													.format("L")
													.toString()}
											</span>
											{/* start of button to go to next date's entry in view portal*/}
											<button
												class={`ml-1 p-2 rounded-md ${selectedEntry() == sortedEntryRows.length - 1
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
													class={`${selectedEntry() == sortedEntryRows.length - 1
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
											{/* end of button to go to next date's entry in view portal*/}
										</div>
										<div class='justify-self-end'>
											{/* start of PENCIL - EDIT ENTRY BUTTON */}
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
											{/* end of PENCIL - EDIT ENTRY BUTTON */}
											{/* start of TRASH CAN - DELETE ENTRY BUTTON */}
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
											{/* end of TRASH CAN - DELETE ENTRY BUTTON */}
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
									{/* start of entry's info display */}
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
									{/* end of entry's info display */}
									{/* start of employee tip distributions list */}
									<div class='mt-3 py-2 px-3 inline-flex justify-between items-center border-x border-t border-border-gray rounded-t-md text-sm font-medium bg-menu-gray'>
										Employee details
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
															<div class="flex justify-between font-medium">
																<span>{distribution.name}</span>
																<span class="text-content-gray">{distribution.title}</span>
															</div>
														</div>
													</div>
													<table class='table-fixed w-full text-sm font-medium'>
														<tbody>
															<tr class="border-b border-border-gray text-table-header-gray">
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
									{/* end of employee tip distributions list */}
								</div>
							</div>
						</Portal>
					</Show>
				</Show>
				{/* end of the view window for an entry, hides table and opens up the view window when clicking View in the dropdown for a row */}
			</div>
			{/* start of the delete modal, appears after clicking the delete from the dropdown or the trashcan button */}
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
							class='w-full p-1.5 text-center border border-border-gray rounded-md bg-black hover:bg-border-gray'
							onclick={() => setConfirmDeleteShown(false)}
						>
							Cancel
						</button>
					}
					confirmButton={
						<button
							class='w-full p-1.5 text-center text-red font-medium border border-red rounded-md bg-select-red hover:bg-red hover:text-white'
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
					onClose={() => setConfirmDeleteShown(false)}
				></Modal>
			</Show>
			{/* end of the delete modal */}
			{/* start of the export modal */}
			<Show when={exportModalShown()}>
				<ExportModal
					header='Export entries'
					body={
						<div class='w-full'>
							<span class="text-table-header-gray">Select the start and end dates to export data within a specific range.</span>
							<div class='flex flex-row justify-between items-center pt-5'>
								<input
									id='from-date'
									type='date'
									class='px-2 py-1 border border-border-gray rounded-md bg-black text-white appearance-none hover:bg-border-gray'
									onchange={(e) => {
										// let invalidFromDateMsg =
										// 	document.getElementById("invalid-from-date");
										if (moment(e.target.value).isAfter(moment(toDate()))) {
											setFromDate("");
											e.target.value = "";
											//@ts-ignore
											// invalidFromDateMsg.innerHTML = "Invalid from date.";
											setInvalidFromDateMsg("Invalid from date.");
											setValidDateRange(false);
										} else {
											setFromDate(e.target.value);
											//@ts-ignore
											// invalidFromDateMsg.innerHTML = "";
											setValidDateRange(true);
											setInvalidFromDateMsg("");
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
									class='px-2 py-1 border border-border-gray rounded-md bg-black text-white appearance-none hover:bg-border-gray'
									value={moment().format("YYYY-MM-DD")}
									onchange={(e) => {
										// let invalidToDateMsg =
										// 	document.getElementById("invalid-to-date");
										if (moment(e.target.value).isBefore(moment(fromDate()))) {
											setToDate("");
											e.target.value = "";
											//@ts-ignore
											// invalidToDateMsg.innerHTML = "Invalid to date.";
											setValidDateRange(false);
											setInvalidToDateMsg("Invalid to date.");
										} else {
											setToDate(e.target.value);
											//@ts-ignore
											// invalidToDateMsg.innerHTML = "";
											setInvalidToDateMsg("");
											if (fromDate() != "") {
												setValidDateRange(true);
											}
										}
									}}
								/>
							</div>
							<div
								class={`${invalidFromDateMsg() ? "mt-2 p-2 flex flex-row items-center text-center border border-red rounded-md bg-select-red text-red" : ""}`}
							>
								{invalidFromDateMsg() && (
									<>
										<svg
											class="ml-1 mr-3 fill-red"
											stroke-width="0"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 16 16"
											height="1.2em"
											width="1.2em"
											style="overflow: visible; color: currentcolor;"
										>
											<path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"></path>
											<path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"></path>
										</svg>
										{invalidFromDateMsg()}
									</>
								)}
							</div>
							<div
								class={`${invalidToDateMsg() ? "mt-2 p-2 flex flex-row items-center text-center border border-red rounded-md bg-select-red text-red" : ""}`}
							>
								{invalidToDateMsg() && (
									<>
										<svg
											class="ml-1 mr-3 fill-red"
											stroke-width="0"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 16 16"
											height="1.2em"
											width="1.2em"
											style="overflow: visible; color: currentcolor;"
										>
											<path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"></path>
											<path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"></path>
										</svg>
										{invalidToDateMsg()}
									</>
								)}
							</div>
						</div>
					}
					denyButton={
						<button
							class='py-1.5 px-6 w-full text-center border border-border-gray rounded-md bg-black hover:bg-border-gray'
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
					onClose={() => setExportModalShown(false)}
				></ExportModal>
			</Show>
			{/* end of the export modal */}
		</>
	);
};

export default ArchiveTable;
