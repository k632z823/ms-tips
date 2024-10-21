import { Component, createSignal, Show } from "solid-js";

interface TipConfigProps {
	tip_total: number;
	tip_rate: number;
	offset_total: number;
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
								<td class='p-2 align-top text-xs text-mini-gray'>
									Offset Overfill
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
								<td
									class={`px-2 pb-2 w-1/3 text-l text-right ${props.offset_total == 0
										? ""
										: props.offset_total > 0
											? "text-red"
											: "text-green"
										}`}
								>
									{props.offset_total == 0
										? ""
										: props.offset_total > 0
											? "-"
											: "+"}
									$
									{props.offset_total.toString().includes("-")
										? props.offset_total.toString().replace("-", "")
										: props.offset_total}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			<Show when={props.offset_total !== 0}>
				<div class="px-5 mt-4 flex justify-center">
					<div class="p-3 w-full flex flex-row rounded-md border border-border-red bg-select-red">
						<div class="flex flex-col">
							<div class="flex flex-row items-center">
								<svg
									class="mr-3 fill-red"
									stroke-width="0"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									height="1em"
									width="1em"
									style="overflow: visible; color: currentcolor;">
									<path d="M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.493 2 11.953 2zM12 20c-4.411 0-8-3.589-8-8s3.567-8 7.953-8C16.391 4 20 7.589 20 12s-3.589 8-8 8z"></path><path d="M11 7h2v7h-2zm0 8h2v2h-2z"></path>
								</svg>
								<div class="text-red text-sm font-bold">Alert</div>
							</div>
							<div class="ml-7 text-red text-sm text-pretty">
								{props.offset_total > 0
									? `There is an overfill of $${props.offset_total} that exceeds the total tip amount.`
									: `There is currently an unallocated amount of $${Math.abs(props.offset_total)} from the total tip amount.`
								}
							</div>
						</div>
					</div>
				</div>
			</Show>
		</>
	);
};

export default TipConfigBar;
