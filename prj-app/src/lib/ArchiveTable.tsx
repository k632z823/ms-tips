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

const meow = [{date: "03-28-2024", drawer: 40, tips: 50, 
				final: 586.23, tipRate: 10, base: 8, tags: ["Evening Event"]},
                {date: "03-29-2024", drawer: 90, tips: 30, 
				final: 490.15, tipRate: 13, base: 10, tags: []}];

let entryRows: entryRow[] = [];

for (let item of meow) {
    entryRows.push({
        entry: item, dropDownShown: false, number: meow.indexOf(item) + 1
    });
}

    
const ArchiveTable: Component = () => {

    const[entry, setEntry] = createStore<entryRow[]>(entryRows);
    const[selectedEntry, setSelectedEntry] = createSignal<number>(0);
    const [dropDown, setDropDown] = createSignal<boolean>(false);

    return (
        <div class='flex justify-center'>
            <div class='border border-border-gray rounded-md w-11/12'>
                <table class='table-auto text-sm font-light w-full'>
                    <thead class='border-b border-border-gray bg-input-gray'>
                        <tr class='text-start'>
                            <td class='p-3 border-r border-border-gray text-center'>#</td>
                            <td class='p-3 border-r border-border-gray'>Date</td>
                            {/* <th>Drawer</th> */}
                            {/* <th>Tips</th> */}
                            <td class='p-3 border-r border-border-gray'>Final</td>
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
                                    <td class='p-3 border-r border-border-gray text-center'>{entryRow.number}</td>
                                    <td class='p-3 border-r border-border-gray'>{moment(entryRow.entry.date).format("L")}</td>
                                    {/* <td>{entry.drawer}</td> */}
                                    {/* <td>{entry.tips}</td> */}
                                    <td class='p-3 border-r border-border-gray'>${entryRow.entry.final}</td>
                                    {/* <td class='p-3 border-r border-border-gray'>{entry.tipRate}</td> */}
                                    {/* <td>{entry.base}</td> */}
                                    <td class='p-3 border-r border-border-gray'>{entryRow.entry.tags}</td>
                                    <td class='p-3'>
                                        <button
                                            class='inline-flex items-center justify-between w-full'
                                            onClick={
                                                () => {
                                                    setSelectedEntry(entryRow.number);
                                                    setEntry(selectedEntry(), (row) => ({
                                                        ...row, dropDownShown: !row.dropDownShown
                                                        })
                                                    )
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
                                        <Show when={entryRow.dropDownShown}>
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