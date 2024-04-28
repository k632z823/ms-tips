import { For, Component, createSignal, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";
import moment from "moment";
import axios from "axios";
import { Portal } from "solid-js/web";
import Modal from "./Utilities/Modal";
import { useNavigate } from "@solidjs/router";

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
	const navigate = useNavigate();
	// let sortedEntryRows: entryRow[] = [...entryRows];

	return (
		<>
			<Show when={tableShown()}>
				<div class='flex justify-center px-5'>
					<div class='border border-border-gray rounded-md w-full'>
						<div>
							<button>
								Export
							</button>
						</div>
						<table class='table-fixed text-sm font-normal w-full'>
							<thead>
								<tr class='text-start'>
									<td class='p-3 w-[44.5px] text-center border-r rounded-tl-md border-border-gray bg-input-gray'>
										#
									</td>
									<td class='p-3 w-[6.5rem] border-r border-border-gray  bg-input-gray'>
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
									<td class='p-3 border-r border-border-gray bg-input-gray'>
										Tags
									</td>
									<td class='p-3 w-[7rem] rounded-tr-md bg-input-gray'>
										Action
									</td>
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
											<td class='p-2 w-full relative grow font-normal'>
												<button
													id='dropdownDefaultButton'
													class='bg-black border border-border-gray rounded-md text-white text-center px-2 py-1 hover:bg-border-gray inline-flex items-center justify-between w-full'
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
															stroke='#505050'
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
													<div class='flex justify-start'>
														<div class='absolute py-1.5 z-50 w-full'>
															<div class='bg-black border border-border-gray rounded-md text-white'>
																<ul class='font-normal'>
																	<div class='px-1 pt-1'>
																		<li class='block px-3 py-2 hover:bg-input-gray hover:rounded'>
																			<button
																				class='w-full flex justify-start'
																				onclick={() => {
																					setEntry(selectedEntry(), (row) => ({
																						...row,
																						dropDownShown: false,
																					}));
																					setTableShown(false);
																					setConfirmDeleteShown(false);
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
																			class='block px-3 py-2 hover:bg-input-gray hover:rounded'
																			onClick={() => {
																				navigate("/Entries/" + entryRows[selectedEntry()].momentDate.format("MM-DD-YYYY"), {
																					replace: true,
																				});
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
																						fill='currentColor'
																						stroke-width='0'
																						xmlns='http://www.w3.org/2000/svg'
																						viewBox='0 0 448 512'
																						height='0.9em'
																						width='0.9em'
																						style='overflow: visible; color: currentcolor;'
																					>
																						<path d='m170.5 51.6-19 28.4h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6h-93.7c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6 36.7 55H424c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8v304c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128h-8c-13.3 0-24-10.7-24-24s10.7-24 24-24h69.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128v304c0 17.7 14.3 32 32 32h224c17.7 0 32-14.3 32-32V128H80zm80 64v208c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0v208c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0v208c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z'></path>
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
											</td>
										</tr>
									)}
								</For>
							</tbody>
						</table>
					</div>
				</div>
			</Show>
			<div>
				<Show when={rendered()}>
					<Show when={sortedEntryRows[selectedEntry()].viewShown}>
						<Portal>
							<div class='fixed top-[4.5rem] w-full'>
								<div class='flex justify-center px-5'>
									<div class='border border-border-gray rounded-md w-full'>
										<div class='p-3'>
											<div class='flex items-center justify-between'>
												<div class='pl-2 font-medium text-xs text-icon-gray'>
													{entryRows[selectedEntry()].momentDate
														.format("L")
														.toString()}
												</div>
												<svg
													onclick={() => {
														setTableShown(true);
														setSortedEntryRows(selectedEntry(), (entry) => ({
															...entry,
															viewShown: false,
														}));
													}}
													class='cursor-pointer h-7 w-7 p-1 hover:fill-white'
													fill='#505050'
													stroke-width='0'
													xmlns='http://www.w3.org/2000/svg'
													viewBox='0 0 16 16'
													height='1em'
													width='1em'
													style='overflow: visible; color: currentcolor;'
												>
													<path
														fill-rule='evenodd'
														d='m8 8.707 3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z'
														clip-rule='evenodd'
													></path>
												</svg>
											</div>
											<div class='pt-3'>
												<div class='border border-border-gray rounded-md'>
													<table class='table-fixed w-full text-sm font-light'>
														<tbody>
															<tr>
																<td class='p-3 w-2/6 border-r rounded-tl-md border-border-gray bg-input-gray'>
																	Drawer
																</td>
																<td class='p-3 text-content-gray'>
																	${entryRows[selectedEntry()].entry.drawer}
																</td>
															</tr>
															<tr>
																<td class='p-3 border-r border-t border-border-gray bg-input-gray'>
																	Tips
																</td>
																<td class='p-3 border-t border-border-gray text-content-gray'>
																	${entryRows[selectedEntry()].entry.tips}
																</td>
															</tr>
															<tr>
																<td class='p-3 border-r border-t border-border-gray bg-input-gray'>
																	Final
																</td>
																<td class='p-3 border-t border-border-gray text-content-gray'>
																	${entryRows[selectedEntry()].entry.final}
																</td>
															</tr>
															<tr>
																<td class='p-3 border-r border-t border-border-gray bg-input-gray'>
																	Tip Rate
																</td>
																<td class='p-3 border-t border-border-gray text-content-gray'>
																	${entryRows[selectedEntry()].entry.tipRate}
																</td>
															</tr>
															<tr>
																<td class='p-3 border-r border-t rounded-bl-md border-border-gray bg-input-gray'>
																	Tags
																</td>
																<td class='p-3 border-t border-border-gray text-content-gray'>
																	<div class='text-nowrap overflow-x-auto'>
																		{entryRows[selectedEntry()].entry.tags}
																	</div>
																</td>
															</tr>
														</tbody>
													</table>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</Portal>
					</Show>
				</Show>
			</div>
			<Show when={confirmDeleteShown()}>
				<Modal
					header={"Are you sure?"}
					body={
						<div>
							This will permanently delete the entry created on{" "}
							{entryRows[selectedEntry()].momentDate.format("L").toString()}.
						</div>
					}
					deny={"Cancel"}
					confirm={"Continue"}
					onDenyClick={() => setConfirmDeleteShown(false)}
					onConfirmClick={async function () {
						await deleteEntry(entryRows[selectedEntry()].entry.id);
						setRendered(false);
						entryRows = await getEntries();
						setSortedEntryRows((entry) => [...entryRows]);
						sortDate(sortedEntryRows, descDateSortOrder());
						setSelectedEntry(0);
						setRendered(true);
						setConfirmDeleteShown(false);
					}}
				></Modal>
			</Show>
		</>
	);
};

export default ArchiveTable;
