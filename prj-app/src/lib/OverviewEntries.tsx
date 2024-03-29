import { Component, createSignal, createEffect } from 'solid-js';

interface OverviewEntriesProps {
    drawer: number;
    tips: number;
    final: number;
    tipRate: number;
}

const OverviewEntries = (props: OverviewEntriesProps) => {

    const { drawer, tips, final, tipRate } = props;

    const [getDrawer, setDrawer] = createSignal(drawer);
    const [getTips, setTips] = createSignal(tips);
    const [getFinal, setFinal] = createSignal(final);
    const [getTipRate, setTipRate] = createSignal(tipRate);

    return (
        <div class='flex justify-center'>
            <div class='border border-border-gray rounded-md w-11/12'>
                <table class='table-auto w-full'>
                    <tbody>
                        <tr class='border-b border-border-gray'>
                            <td class='p-2 align-top text-sm'>Today's Entry</td>
                        </tr>
                        <tr class='border-b border-border-gray bg-menu-gray'>
                            <td class='p-2 align-top text-sm text-mini-gray'>Drawer</td>
                            <td class='p-4 flex justify-end text-4xl font-light'>${getDrawer()}</td>
                        </tr>
                        <tr class='border-b border-border-gray bg-menu-gray'>
                            <td class='p-2 align-top text-sm text-mini-gray'>Tips</td>
                            <td class='p-4 flex justify-end text-4xl'>${getTips()}</td>
                        </tr>
                        <tr class='border-b border-border-gray bg-menu-gray'>
                            <td class='p-2 align-top text-sm text-mini-gray'>Final</td>
                            <td class='p-4 flex justify-end text-4xl'>${getFinal()}</td>
                        </tr>
                        <tr class='bg-menu-gray'>
                            <td class='p-2 align-top text-sm text-mini-gray'>Tip Rate</td>
                            <td class='p-4 flex justify-end text-4xl'>${getTipRate()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default OverviewEntries;