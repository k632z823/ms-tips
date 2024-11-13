import { Component, createSignal, Show } from "solid-js";

interface TipConfigProps {
	tip_total: number;
	tip_rate: number;
}

const TipConfigBar: Component<TipConfigProps> = (props: TipConfigProps) => {
	return (
		<>
			<div
				class='flex justify-center px-5'
				id='tip-config-bar'
			>
				<div class='border border-border-gray rounded-md w-full'>
					<table class='table-auto w-full'>
						<tbody>
							<tr class='border-border-gray'>
								<td class='p-2 align-top border-r border-border-gray text-xs text-mini-gray'>
									Total Tip Amount
								</td>
								<td class='p-2 align-top border-r border-border-gray text-xs text-mini-gray'>
									Tip Rate
								</td>
							</tr>
							<tr class='border-border-gray'>
								<td class='px-2 pb-2 w-1/3 border-r border-border-gray text-l text-right'>
									${props.tip_total}
								</td>
								<td
									class={`px-2 pb-2 w-1/3 border-r border-border-gray text-l text-right `}
								>
									${props.tip_rate}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			{/* <Show when={props.offset_total !== 0}>
				<div class='px-5 mt-4 flex justify-center'>
					<div class='p-2 w-full flex flex-row rounded-md border border-border-red bg-select-red'>
						<div class='flex flex-col'>
							<div class='flex flex-row items-center'>
								<svg
									class='mr-3 ml-1 mt-1 fill-red'
									stroke-width='0'
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 16 16'
									height='1.2em'
									width='1.2em'
									style='overflow: visible; color: currentcolor;'
								>
									<path d='M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z'></path>
									<path d='M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z'></path>
								</svg>
								<div class='text-red text-sm font-bold'>Alert</div>
							</div>
							<div class='ml-[35px] pb-[2px] text-red text-sm text-pretty font-medium'>
								{props.offset_total > 0
									? `There is an overfill of $${props.offset_total} that exceeds the total tip amount.`
									: `There is currently an unallocated amount of $${Math.abs(
											props.offset_total,
									  )} from the total tip amount.`}
							</div>
						</div>
					</div>
				</div>
			</Show> */}
		</>
	);
};

export default TipConfigBar;
