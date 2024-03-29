import { For, Component, createSignal, createEffect, Show } from 'solid-js';
import { createStore } from "solid-js/store";
import moment from 'moment';

interface Entry {
    number: number;
    date: string;
    drawer: number;
    tips: number;
    final: number;
    tipRate: number;
    base: number;
    tags: string[];
}

const meow = [{number: 1, date: "03-28-2024", drawer: 40, tips: 50, 
				final: 586.23, tipRate: 10, base: 8, tags: ["Evening Event"]},
                {number: 2, date: "03-29-2024", drawer: 90, tips: 30, 
				final: 490.15, tipRate: 13, base: 10, tags: []}];

const ArchiveTable: Component = () => {

    const[entries, setEntries] = createStore<Entry[]>(meow);
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
                        <For each={entries}>
                            {(entry) => (
                                <tr class='border-b border-border-gray text-content-gray hover:bg-input-gray'>
                                    <td class='p-3 border-r border-border-gray text-center'>{entry.number}</td>
                                    <td class='p-3 border-r border-border-gray'>{moment(entry.date).format("L")}</td>
                                    {/* <td>{entry.drawer}</td> */}
                                    {/* <td>{entry.tips}</td> */}
                                    <td class='p-3 border-r border-border-gray'>${entry.final}</td>
                                    {/* <td class='p-3 border-r border-border-gray'>{entry.tipRate}</td> */}
                                    {/* <td>{entry.base}</td> */}
                                    <td class='p-3 border-r border-border-gray'>{entry.tags}</td>
                                    <td class='p-3'>
                                        <button
                                            class='inline-flex items-center'
                                            onClick={() => setDropDown(!dropDown())}
                                        >
                                            Edit
                                        </button>
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