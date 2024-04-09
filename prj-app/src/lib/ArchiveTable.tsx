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
    tags: string;
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
        let tags: string = "";
        item.tags.forEach((tag: string) => {
            if (item.tags.indexOf(tag) != item.tags.length - 1) {
                tags += tag + ", ";
            } else {
                tags += tag;
            }
        })
        archiveEntries.push({
            entry: {
                date: item.date,
                tips: item.tips,
                final: item.final,
                tipRate: item.tip_rate,
                tags:  tags,
                drawer: item.drawer
            }, dropDownShown: false, number: responseData.indexOf(item), momentDate: moment(item.date)
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
                                    <Show when={descDateSortOrder()}>
                                        <svg 
                                            fill="currentColor" 
                                            stroke-width="0" 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            baseProfile="tiny" version="1.2" 
                                            viewBox="0 0 24 24" height="1em" 
                                            width="1em" 
                                            style="overflow: visible; color: currentcolor;">
                                            <path d="M5.8 9.7 12 16l6.2-6.3c.2-.2.3-.5.3-.7s-.1-.5-.3-.7c-.2-.2-.4-.3-.7-.3h-11c-.3 0-.5.1-.7.3-.2.2-.3.4-.3.7s.1.5.3.7z"></path>
                                        </svg>
                                    </Show>
                                    <Show when={!descDateSortOrder()}>
                                        <svg 
                                            fill="currentColor" 
                                            stroke-width="0" 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            baseProfile="tiny" 
                                            version="1.2" 
                                            viewBox="0 0 24 24" 
                                            height="1em" 
                                            width="1em" 
                                            style="overflow: visible; color: currentcolor;">
                                            <path d="M18.2 13.3 12 7l-6.2 6.3c-.2.2-.3.5-.3.7s.1.5.3.7c.2.2.4.3.7.3h11c.3 0 .5-.1.7-.3.2-.2.3-.5.3-.7s-.1-.5-.3-.7z"></path>
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
                                    <td class='p-3 border-r border-border-gray text-center'>{sortedEntryRows.indexOf(entryRow) + 1}</td>
                                    <td class='p-3 border-r border-border-gray'>{moment(entryRow.momentDate).format("L")}</td>
                                    {/* <td>{entry.drawer}</td> */}
                                    {/* <td>{entry.tips}</td> */}
                                    {/* <td class='p-3 border-r border-border-gray'>${entryRow.entry.final}</td> */}
                                    {/* <td class='p-3 border-r border-border-gray'>{entry.tipRate}</td> */}
                                    {/* <td>{entry.base}</td> */}
                                    <td class='p-3 border-r border-border-gray '>
                                        <div class='text-nowrap overflow-x-auto'>{entryRow.entry.tags.toString()}</div>
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