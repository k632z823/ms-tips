import { Component, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";

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
	const navigate = useNavigate();

	return (
		<div class='flex justify-center px-5'>
			<div class='border border-border-gray rounded-md w-full'>
				<table class='table-auto w-full'>
					<tbody>
						<tr class='border-b border-border-gray bg-menu-gray'>
							<td class='p-3 text-sm'>Today's Entry</td>
							<td class='p-2 text-sm flex justify-end'>
								<button
									class='p-1 px-8 border border-border-gray rounded-md bg-black hover:bg-border-gray'
									onClick={() => {
										navigate("/Entries/default", {
											replace: true,
										});
									}}
								>
									Edit
								</button>
							</td>
						</tr>
						<tr class='border-b border-border-gray'>
							<td class='p-2 align-top text-sm text-mini-gray'>Drawer</td>
							<td class='p-4 flex justify-end text-4xl'>${getDrawer()}</td>
						</tr>
						<tr class='border-b border-border-gray'>
							<td class='p-2 align-top text-sm text-mini-gray'>Tips</td>
							<td class='p-4 flex justify-end text-4xl'>${getTips()}</td>
						</tr>
						<tr class='border-b border-border-gray'>
							<td class='p-2 align-top text-sm text-mini-gray'>Final</td>
							<td class='p-4 flex justify-end text-4xl'>${getFinal()}</td>
						</tr>
						<tr class=''>
							<td class='p-2 align-top text-sm text-mini-gray'>Tip Rate</td>
							<td class='p-4 flex justify-end text-4xl'>${getTipRate()}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default OverviewEntries;
