import { For, Component, createSignal, onMount, onCleanup, createEffect, Show } from 'solid-js';
import { createStore } from "solid-js/store";
import moment from 'moment';
import axios from 'axios';

interface Entry {
    date: string;
    drawer: number;
    tips: number;
    final: number;
    tipRate: number;
    tags: string[];
}

interface EntryRow {
    entry: Entry;
    dropDownShown: boolean;
    number: number;
    momentDate: any;
}

async function getEntries() {
    let response = await axios.get("http://localhost:3001/get-entries");
    let responseData = response.data.entries; 
    let archiveEntries: EntryRow[] = [];
    for (let item of responseData) {
        archiveEntries.push({
            entry: item, dropDownShown: false, number: responseData.indexOf(item), momentDate: moment(item.date)
        });
    }
    return archiveEntries;
}


const sortDate = (entryRowsToSort: EntryRow[], sortByDesc: boolean) => {
    let copyEntryRowsToSort: EntryRow[] = [...entryRowsToSort];
    if (sortByDesc) {
        copyEntryRowsToSort.sort((a, b) => b.momentDate.valueOf() - a.momentDate.valueOf())
    } else {
        copyEntryRowsToSort.sort((a, b) => a.momentDate.valueOf() - b.momentDate.valueOf())
    }
    setSortedEntryRows((rows) => rows = [...copyEntryRowsToSort])
}

let entryRows: EntryRow[] = await getEntries();

const[sortedEntryRows, setSortedEntryRows] = createStore<EntryRow[]>(entryRows);

const ArchiveTable: Component = () => {

    onMount(async function() {
        setDescDateSortOrder(true);
        sortDate(sortedEntryRows, descDateSortOrder());
        entryRows = await getEntries();
    })

    const[entry, setEntry] = createStore<EntryRow[]>(entryRows);
    const[selectedEntry, setSelectedEntry] = createSignal<number>(0);
    const[descDateSortOrder, setDescDateSortOrder] = createSignal<boolean>(true);
    
   // let sortedEntryRows: entryRow[] = [...entryRows];

    return (
        <div class='flex justify-center px-5'>
            <div class='border border-border-gray rounded-md w-full'>
                <table class='table-fixed text-sm font-light w-full'>
                    <thead class='bg-input-gray'>
                        <tr class='text-start'>
                            <td class='p-3 w-[44.5px] border-r border-border-gray text-center'>#</td>
                            <td class='p-3 w-[6.5rem] border-r border-border-gray'>
                                <button 
                                    class='inline-flex items-center justify-between w-full'
                                    onClick={
                                        () => {
                                            setDescDateSortOrder(!descDateSortOrder());
                                            sortDate(sortedEntryRows, descDateSortOrder());
                                        }
                                    }
                                >
                                    Date
                                    <svg 
                                        fill="#505050" 
                                        stroke-width="0" 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        viewBox="0 0 24 24" 
                                        height="1em" width="1em" 
                                        style="overflow: visible; color: currentcolor;">
                                        <path 
                                            d="M6.227 11h11.547c.862 0 1.32-1.02.747-1.665L12.748 2.84a.998.998 0 0 0-1.494 0L5.479 9.335C4.906 9.98 5.364 11 6.227 11zm5.026 10.159a.998.998 0 0 0 1.494 0l5.773-6.495c.574-.644.116-1.664-.747-1.664H6.227c-.862 0-1.32 1.02-.747 1.665l5.773 6.494z">    
                                        </path>
                                    </svg>
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
                                    <td class='p-3 border-r border-border-gray text-center'>{sortedEntryRows.indexOf(entryRow) + 1}</td>
                                    <td class='p-3 border-r border-border-gray'>{moment(entryRow.momentDate).format("L")}</td>
                                    {/* <td>{entry.drawer}</td> */}
                                    {/* <td>{entry.tips}</td> */}
                                    {/* <td class='p-3 border-r border-border-gray'>${entryRow.entry.final}</td> */}
                                    {/* <td class='p-3 border-r border-border-gray'>{entry.tipRate}</td> */}
                                    {/* <td>{entry.base}</td> */}
                                    <td class='p-3 border-r border-border-gray '>
                                        <div class='text-nowrap overflow-x-auto'>{entryRow.entry.tags}</div>
                                    </td>
                                    <td class='p-3 w-full relative grow font-normal'>
                                        <button
                                            id='dropdownDefaultButton'
                                            class='border border-border-gray rounded-md text-content-gray text-center px-2 py-1 hover:bg-border-gray inline-flex items-center justify-between w-full'
                                            onClick={
                                                () => {
                                                    if (selectedEntry() != entryRow.number) {
                                                        setEntry(selectedEntry(), (row) => ({
                                                            ...row,
                                                            dropDownShown: false,
                                                        }));
                                                        setSelectedEntry(entryRow.number);
                                                    }
    
                                                    setEntry(selectedEntry(), (row) => ({
                                                        ...row,
                                                        dropDownShown: !row.dropDownShown,
                                                    }));
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
                                        <Show when={selectedEntry() == entryRow.number &&
                                                    entry[selectedEntry()].dropDownShown}>
                                            <div class='flex justify-center'>
                                                <div class='absolute px-3 py-1.5 z-50 w-full'>
                                                    <div class='border border-border-gray bg-menu-gray rounded-md text-content-gray'>
                                                        <ul class='py-2'>
                                                            <li class='block px-4 py-1 hover:bg-input-gray'>
                                                                View
                                                            </li>
                                                            <li class='block px-4 py-1 hover:bg-input-gray'>
                                                                Export
                                                            </li>
                                                            <li class='block px-4 py-1 hover:bg-input-gray'>
                                                                Edit
                                                            </li>
                                                            <li class='block px-4 py-1 hover:bg-input-gray'>
                                                                Delete
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
            </div>
        </div>
    )
}

export default ArchiveTable;