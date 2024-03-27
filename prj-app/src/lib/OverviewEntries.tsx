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
        <div>
            <table style={{ border: '1px solid grey' }}>
                <tbody>
                    <tr>
                        <td>Drawer ${getDrawer()}</td>
                    </tr>
                    <tr>
                        <td>Tips ${getTips()}</td>
                    </tr>
                    <tr>
                        <td>Final ${getFinal()}</td>
                    </tr>
                    <tr>
                        <td>Tip Rate ${getTipRate()}</td>
                    </tr>
                </tbody>
            </table>
        </div>

    );
}

export default OverviewEntries;