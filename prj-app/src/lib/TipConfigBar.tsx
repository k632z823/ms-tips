import { Component } from "solid-js";

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
								<td class='px-2 pb-2 w-1/3 border-r border-border-gray text-l text-right'>
									${props.tip_rate}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
};

export default TipConfigBar;
