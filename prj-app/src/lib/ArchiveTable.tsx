import { For, Component, createSignal, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";
import moment from "moment";
import axios from "axios";
import { Portal } from "solid-js/web";

interface Entry {
	id: number;
	date: string;
	drawer: number;
	tips: number;
	final: number;
	tipRate: number;
	tags: string;
}

interface EntryRow {
	entry: Entry;
	number: number;
	momentDate: any;
	dropDownShown: boolean;
	viewShown: boolean;
}

async function getEntries() {
	let response = await axios.get("http://localhost:3001/get-entries");
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

const sortDate = (entryRowsToSort: EntryRow[], sortByDesc: boolean) => {
	let copyEntryRowsToSort: EntryRow[] = [...entryRowsToSort];
	if (sortByDesc) {
		copyEntryRowsToSort.sort(
			(a, b) => b.momentDate.valueOf() - a.momentDate.valueOf(),
		);
	} else {
		copyEntryRowsToSort.sort(
			(a, b) => a.momentDate.valueOf() - b.momentDate.valueOf(),
		);
	}
	setSortedEntryRows((rows) => (rows = [...copyEntryRowsToSort]));
};

let entryRows: EntryRow[] = []; //await getEntries();

const [sortedEntryRows, setSortedEntryRows] =
	createStore<EntryRow[]>(entryRows);

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

	// let sortedEntryRows: entryRow[] = [...entryRows];

	return (
		<div class='flex justify-center px-5'>
			<div class='border border-border-gray rounded-md w-full'>
				<Show when={tableShown()}>
					<table class='table-fixed text-sm font-light w-full'>
						<thead class='bg-input-gray'>
							<tr class='text-start'>
								<td class='p-3 w-[44.5px] border-r border-border-gray text-center'>
									#
								</td>
								<td class='p-3 w-[6.5rem] border-r border-border-gray'>
									<button
										class='inline-flex items-center justify-between w-full'
										onClick={() => {
											setDescDateSortOrder(!descDateSortOrder());
											sortDate(sortedEntryRows, descDateSortOrder());
										}}
									>
										Date
										<Show when={descDateSortOrder()}>
											<svg
												fill='currentColor'
												stroke-width='0'
												xmlns='http://www.w3.org/2000/svg'
												baseProfile='tiny'
												version='1.2'
												viewBox='0 0 24 24'
												height='1em'
												width='1em'
												style='overflow: visible; color: currentcolor;'
											>
												<path d='M5.8 9.7 12 16l6.2-6.3c.2-.2.3-.5.3-.7s-.1-.5-.3-.7c-.2-.2-.4-.3-.7-.3h-11c-.3 0-.5.1-.7.3-.2.2-.3.4-.3.7s.1.5.3.7z'></path>
											</svg>
										</Show>
										<Show when={!descDateSortOrder()}>
											<svg
												fill='currentColor'
												stroke-width='0'
												xmlns='http://www.w3.org/2000/svg'
												baseProfile='tiny'
												version='1.2'
												viewBox='0 0 24 24'
												height='1em'
												width='1em'
												style='overflow: visible; color: currentcolor;'
											>
												<path d='M18.2 13.3 12 7l-6.2 6.3c-.2.2-.3.5-.3.7s.1.5.3.7c.2.2.4.3.7.3h11c.3 0 .5-.1.7-.3.2-.2.3-.5.3-.7s-.1-.5-.3-.7z'></path>
											</svg>
										</Show>
									</button>
								</td>
								{/* <th>Drawer</th> */}
								{/* <th>Tips</th> */}
								{/* <td class='p-3 border-r border-border-gray'>Final</td> */}
								{/* <td class='p-3 border-r border-border-gray'>Tip Rate</td> */}
								{/* <th>Base</th> */}
								<td class='p-3 border-r border-border-gray'>Tags</td>
								<td class='p-3 w-[7rem]'>Action</td>
							</tr>
						</thead>
						<tbody>
							<For each={sortedEntryRows}>
								{(entryRow) => (
									<tr class='border-t border-border-gray text-content-gray hover:bg-menu-gray'>
										<td class='p-3 border-r border-border-gray text-center'>
											{sortedEntryRows.indexOf(entryRow) + 1}
										</td>
										<td class='p-3 border-r border-border-gray'>
											{moment(entryRow.momentDate).format("L")}
										</td>
										{/* <td>{entry.drawer}</td> */}
										{/* <td>{entry.tips}</td> */}
										{/* <td class='p-3 border-r border-border-gray'>${entryRow.entry.final}</td> */}
										{/* <td class='p-3 border-r border-border-gray'>{entry.tipRate}</td> */}
										{/* <td>{entry.base}</td> */}
										<td class='p-3 border-r border-border-gray '>
											<div class='text-nowrap overflow-x-auto'>
												{entryRow.entry.tags.toString()}
											</div>
										</td>
										<td class='p-3 w-full relative grow font-normal'>
											<button
												id='dropdownDefaultButton'
												class='border border-border-gray rounded-md text-content-gray text-center px-2 py-1 hover:bg-border-gray inline-flex items-center justify-between w-full'
												onClick={() => {
													if (selectedEntry() != entryRow.number) {
														setEntry(selectedEntry(), (row) => ({
															...row,
															dropDownShown: false,
														}));
														setSelectedEntry(entryRow.number);
														setConfirmDeleteShown(false);
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
												Select
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
											<Show
												when={
													selectedEntry() == entryRow.number &&
													entry[selectedEntry()].dropDownShown
												}
											>
												<div class='flex justify-center'>
													<div class='absolute px-3 py-1.5 z-50 w-full'>
														<div class='border border-border-gray bg-menu-gray rounded-md text-content-gray'>
															<ul class='py-2'>
																<li class='block px-4 py-1 hover:bg-input-gray'>
																	<button
																		onclick={() => {
																			setTableShown(false);
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
																<li class='block px-4 py-1 hover:bg-input-gray'>
																	Edit
																</li>
																<li class='block px-4 py-1 hover:bg-input-gray'>
																	<button 
																		onclick={() => setConfirmDeleteShown(true)}
																	>
																		Delete
																	</button>
																</li>
															</ul>
														</div>
													</div>
												</div>
											</Show>
										</td>
									</tr>
								)}
							</For>
						</tbody>
					</table>
				</Show>
				<div>
					<Show when={rendered()}>
						<Show when={sortedEntryRows[selectedEntry()].viewShown}>
							<Portal>
								<div>
									<button
										onclick={() => {
											setTableShown(true);
											setSortedEntryRows(selectedEntry(), (entry) => ({
												...entry,
												viewShown: false,
											}));
										}}
									>
										THIS IS A FUCKING BUTTON CLICK TO CLOSE THIS VIEW WINDOW
									</button>
								</div>
								<div>
									<table>
										<tbody>
											<tr>
												<td>Date</td>
												<td>{entryRows[selectedEntry()].momentDate.format("L").toString()}</td>
											</tr>
											<tr>
												<td>Drawer</td>
												<td>${entryRows[selectedEntry()].entry.drawer}</td>
											</tr>
											<tr>
												<td>Tips</td>
												<td>${entryRows[selectedEntry()].entry.tips}</td>
											</tr>
											<tr>
												<td>Final</td>
												<td>${entryRows[selectedEntry()].entry.final}</td>
											</tr>
											<tr>
												<td>Tip Rate</td>
												<td>${entryRows[selectedEntry()].entry.tipRate}</td>
											</tr>
											<tr>
												<td>Tags</td>
												<td>{entryRows[selectedEntry()].entry.tags}</td>
											</tr>
										</tbody>
									</table>
								</div>
							</Portal>
						</Show>  
					</Show>
				</div>
				<Show when={confirmDeleteShown()}>
					<Portal>
						<section>  
							<div>Are you sure you want to delete entry on {entryRows[selectedEntry()].momentDate.format("L").toString()}?</div>
							<div>
								<button
									onclick={() => setConfirmDeleteShown(false)}
								>
									No
								</button>
								<button
									onclick={async function() {
										await deleteEntry(
											entryRows[selectedEntry()].entry.id,
										);
										setRendered(false);
										entryRows = await getEntries();
										setSortedEntryRows((entry) => [
											...entryRows,
										]);
										sortDate(
											sortedEntryRows,
											descDateSortOrder(),
										);
										setSelectedEntry(0);
										setRendered(true);
										setConfirmDeleteShown(false);
									}}
								>
									Yes
								</button>
							</div>
						</section>
        			</Portal>
				</Show>
			</div>
		</div>
	);
};

export default ArchiveTable;
