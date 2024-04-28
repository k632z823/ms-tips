import TipConfigBar from "./TipConfigBar";
import { ShiftData as ShiftData, pullSlingEmployeeData } from "./GetWorkers";
import { Component, createSignal, createEffect, For, on } from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";

export interface TipConfigProps {
	tip_total: number;
}

const [initialTipTotal, setInitialTipTotal] = createSignal<number>(0);
const [remainingTipTotal, setRemainingTipTotal] = createSignal<number>(0);
const [tipRate, setTipRate] = createSignal<number>(0);
const [employees, editEmployees] = createStore<ShiftData[]>(
	await pullSlingEmployeeData(),
);

function calculateTipRate(tipTotal: number, employeeData: ShiftData[]) {
	//stores the total hours worked between all employees on that shift
	let totalHours = 0;
	setInitialTipTotal(0);
	setRemainingTipTotal(0);
	setTipRate(0);

	let empData = [...employeeData];

	for (let entry of empData) {
		let index = empData.indexOf(entry);

		//bakers and dishwashers are not included in tip distribution -> skips them
		if (
			employees[index].position === "Baker" ||
			employees[index].position === "Dishwasher"
		) {
			continue;
		}

		totalHours += entry.hours_worked;

		//checks if the position is a server -> servers are the only ones who recieve an initial tip amount
		if (entry.position == "Server") {
			editEmployees(index, (entry) => ({
				...entry,
				initial_tip: entry.hours_worked * 3,
			}));
			setInitialTipTotal(initialTipTotal() + employees[index].initial_tip);
		}
	}

	//subtracts the total initial tips given to servers from the original tip count
	//the remaining is what is used to calculate the tip rate
	setRemainingTipTotal(tipTotal - initialTipTotal());
	let tipRate = remainingTipTotal() / totalHours;
	setTipRate(Math.round(tipRate));
}

function calculateTipDistribution(emps: ShiftData[]) {
	let empData: ShiftData[] = [...emps];

	for (let employee of empData) {
		let index = empData.indexOf(employee);

		//bakers and dishwashers are not included in tip distribution -> skips them
		if (
			employees[index].position === "Baker" ||
			employees[index].position === "Dishwasher"
		) {
			continue;
		}

		let tips = employee.hours_worked * tipRate();
		let total = tips + employee.initial_tip;

		editEmployees(index, (entry) => ({
			...entry,
			tips: tips,
			total: total,
		}));
	}
}

const TipConfig: Component<TipConfigProps> = (props: TipConfigProps) => {
	createEffect(
		on(
			() => props.tip_total,
			() => {
				if (props.tip_total != 0) {
					calculateTipRate(props.tip_total, employees);
					calculateTipDistribution(employees);
				}
			},
		),
	);

	return (
		<>
			<TipConfigBar
				tip_total={props.tip_total}
				tip_rate={tipRate()}
			></TipConfigBar>
			<div class='flex justify-center px-5'>
				<div class='border border-border-gray rounded-md w-full'>
					<table class='table-fixed text-sm font-light w-full'>
						<thead class='bg-input-gray'>
							<tr class='text-start'>
								<td class='p-3 w-[44.5px] border-r border-border-gray text-center'>
									#
								</td>
								<td class='p-3 w-[6.5rem] border-r border-border-gray'>Name</td>
								<td class='p-3 w-[6.5rem] border-r border-border-gray'>
									Position
								</td>
								<td class='p-3 w-[6.5rem] border-r border-border-gray'>
									Hours
								</td>
								<td class='p-3 w-[6.5rem] border-r border-border-gray'>
									Inital
								</td>
								<td class='p-3 w-[6.5rem] border-r border-border-gray'>Tips</td>
								<td class='p-3 w-[6.5rem] border-r border-border-gray'>
									Total
								</td>
								<td class='p-3 w-[6.5rem] border-r border-border-gray'>
									Offset
								</td>
							</tr>
						</thead>
						<tbody>
							<For each={employees}>
								{(entry) => (
									<tr class='border-t border-border-gray text-content-gray hover:bg-menu-gray'>
										<td class='p-3 border-r border-border-gray text-center'>
											{employees.indexOf(entry) + 1}
										</td>
										<td class='p-3 border-r border-border-gray'>
											{entry.name}
										</td>
										<td class='p-3 border-r border-border-gray'>
											{entry.position}
										</td>
										<td class='p-3 border-r border-border-gray'>
											{entry.hours_worked}
										</td>
										<td class='p-3 border-r border-border-gray'>
											{entry.initial_tip}
										</td>
										<td class='p-3 border-r border-border-gray'>
											{entry.tips}
										</td>
										<td class='p-3 border-r border-border-gray'>
											{entry.total}
										</td>
										<td class='p-3 border-r border-border-gray'>
											<input
												class='rounded-md border border-border-gray bg-input-gray text-center text-content-gray p-1 w-full'
												value={entry.offset}
												onChange={(e) => {
													if (Number.isNaN(parseInt(e.target.value))) {
														e.target.value =
															employees[
																employees.indexOf(entry)
															].offset.toString();
													}
												}}
												onFocus={(e) => {
													if (e.target.value == "0") {
														e.target.value = "";
													}
												}}
												onBlur={(e) => {
													if (e.target.value == "") {
														e.target.value = "0";
													}
												}}
											></input>
										</td>
									</tr>
								)}
							</For>
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
};

export default TipConfig;
