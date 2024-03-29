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
				final: 90, tipRate: 10, base: 8, tags: ["Evening Event"]},
                {number: 2, date: "03-29-2024", drawer: 90, tips: 30, 
				final: 120, tipRate: 13, base: 10, tags: []}];

const ArchiveTable: Component = () => {

    const[entries, setEntries] = createStore<Entry[]>(meow);
    const [dropDown, setDropDown] = createSignal<boolean>(false);

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Drawer</th>
                        <th>Tips</th>
                        <th>Final</th>
                        <th>Tip Rate</th>
                        <th>Base</th>
                        <th>Tags</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <For each={entries}>
                        {(entry) => (
                            <tr>
                                <td>{entry.number}</td>
                                <td>{moment(entry.date).format("L")}</td>
                                <td>{entry.drawer}</td>
                                <td>{entry.tips}</td>
                                <td>{entry.final}</td>
                                <td>{entry.tipRate}</td>
                                <td>{entry.base}</td>
                                <td>{entry.tags}</td>
                                <td>
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
    )
}

export default ArchiveTable;