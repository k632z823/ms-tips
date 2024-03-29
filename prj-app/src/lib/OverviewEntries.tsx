import { Component, createSignal, createEffect } from 'solid-js';

interface OverviewEntriesProps {
    drawer: number;
    tips: number;
    final: number;
    tipRate: number;
}

const OverviewEntries: Component<OverviewEntriesProps> = (props) => {

    const { drawer, tips, final, tipRate } = props;

    const [getDrawer, setDrawer] = createSignal(drawer);
    const [getTips, setTips] = createSignal(tips);
    const [getFinal, setFinal] = createSignal(final);
    const [getTipRate, setTipRate] = createSignal(tipRate);

    return (
        <div class='flex justify-center'>
            <div class='border border-border-gray rounded-md w-11/12'>
                <table class='table-auto w-full'>
                    <tbody class='bg-input-gray'>
                        <tr>
                            <td class='text-sm text-mini-gray'>Drawer</td>
                            <td>${getDrawer()}</td>
                        </tr>
                        <tr>
                            <td class='text-sm text-mini-gray'>Tips</td>
                            <td>${getTips()}</td>
                        </tr>
                        <tr>
                            <td class='text-sm text-mini-gray'>Final</td>
                            <td>${getFinal()}</td>
                        </tr>
                        <tr>
                            <td class='text-sm text-mini-gray'>Tip Rate</td>
                            <td>${getTipRate()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default OverviewEntries;