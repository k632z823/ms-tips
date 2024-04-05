import { For, Component, createSignal, createEffect, Show } from 'solid-js';
import { createStore } from "solid-js/store";
import moment from 'moment';

interface Entry {
    date: string;
    drawer: number;
    tips: number;
    final: number;
    tipRate: number;
    base: number;
    tags: string[];
}

interface entryRow {
    entry: Entry;
    dropDownShown: boolean;
    number: number;
}

const meow = [{date: "03-29-2024", drawer: 40, tips: 50, 
			    final: 586.23, tipRate: 10, base: 8, tags: ["Evening Event"]},
                {date: "03-28-2024", drawer: 90, tips: 30, 
				final: 490.15, tipRate: 13, base: 10, tags: []},
                {date: "03-27-2024", drawer: 70, tips: 40, 
				final: 540.15, tipRate: 15, base: 12, tags: []}];

let entryRows: entryRow[] = [];

for (let item of meow) {
    entryRows.push({
        entry: item, dropDownShown: false, number: meow.indexOf(item)
    });
}

    
const ArchiveTable: Component = () => {

    const[entry, setEntry] = createStore<entryRow[]>(entryRows);
    const[selectedEntry, setSelectedEntry] = createSignal<number>(0);
    const[dateSortOrder, setDateSortOrder] = createSignal<string>("desc");

    return (
        <div class='flex justify-center px-5'>
            <div class='border border-border-gray rounded-md w-full'>
                <table class='table-auto text-sm font-light w-full'>
                    <thead class='border-b border-border-gray bg-input-gray'>
                        <tr class='text-start'>
                            <td class='p-3 border-r border-border-gray text-center'>#</td>
                            <td class='p-3 border-r border-border-gray'>
                                <button class='inline-flex items-center justify-between w-full'>
                                    Date
                                    <svg 
                                        fill="currentColor" 
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
                            <td class='p-3'>Action</td>
                        </tr>
                    </thead>
                    <tbody>
                        <For each={entryRows}>
                            {(entryRow) => (
                                <tr class='border-b border-border-gray text-content-gray hover:bg-menu-gray'>
                                    <td class='p-3 border-r border-border-gray text-center'>{entryRow.number + 1}</td>
                                    <td class='p-3 border-r border-border-gray'>{moment(entryRow.entry.date).format("L")}</td>
                                    {/* <td>{entry.drawer}</td> */}
                                    {/* <td>{entry.tips}</td> */}
                                    {/* <td class='p-3 border-r border-border-gray'>${entryRow.entry.final}</td> */}
                                    {/* <td class='p-3 border-r border-border-gray'>{entry.tipRate}</td> */}
                                    {/* <td>{entry.base}</td> */}
                                    <td class='p-3 border-r border-border-gray overflow-x-auto max-w-1'>{entryRow.entry.tags}</td>
                                    <td class='p-3'>
                                        <button
                                            class='inline-flex items-center justify-between w-full'
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
                                            <div>
                                                <div>
                                                    <ul>
                                                        <li>
                                                            View
                                                        </li>
                                                        <li>
                                                            Export
                                                        </li>
                                                        <li>
                                                            Edit
                                                        </li>
                                                        <li>
                                                            Delete
                                                        </li>
                                                    </ul>
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