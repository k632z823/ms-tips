import TipConfigBar from "./TipConfigBar";
import { ShiftData as ShiftData, pullSlingEmployeeData } from "./GetWorkers";
import {
	Component,
	createSignal,
	createEffect,
	For,
	on,
	onMount,
} from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";

export interface TipConfigProps {
	tip_total: number;
	date: string;
	offset_total: number;
}

const [initialTipTotal, setInitialTipTotal] = createSignal<number>(0);
const [remainingTipTotal, setRemainingTipTotal] = createSignal<number>(0);
const [tipRate, setTipRate] = createSignal<number>(0);
const [employees, editEmployees] = createStore<ShiftData[]>([]);
const [expandedRow, setExpandedRow] = createSignal<number | null>(null); // Track expanded row
const [offsetTotal, setOffsetTotal] = createSignal<number>(0);

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
	onMount(async () => {
		editEmployees(await pullSlingEmployeeData(props.date));
	});
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

	// Function to toggle the expanded row
	const toggleRow = (index: number) => {
		setExpandedRow(expandedRow() === index ? null : index);
	};

	return (
		<>
			<TipConfigBar
				tip_total={props.tip_total}
				tip_rate={tipRate()}
				offset_total={offsetTotal()}
			></TipConfigBar>
			<div class='flex justify-center px-5 pt-4'>
				<div class='border border-border-gray rounded-md w-full overflow-x-auto'>
					<table class='table-fixed text-sm font-light w-full'>
						<thead class='bg-input-gray'>
							<tr class='text-start'>
								<td class='p-3 w-[42px] border-r border-border-gray text-center'>
									#
								</td>
								<td class='p-3 w-[6.5rem] border-r border-border-gray'>Name</td>
								{/* <td class='p-3 w-[6.5rem] border-r border-border-gray'>
									Position
								</td>
								<td class='p-3 w-[6.5rem] border-r border-border-gray'>
									Hours
								</td>
								<td class='p-3 w-[6.5rem] border-r border-border-gray'>
									Inital
								</td>
								<td class='p-3 w-[6.5rem] border-r border-border-gray'>
									Tips
								</td> */}
								<td class='p-3 w-[5rem] border-r border-border-gray'>Total</td>
								<td class='p-3 w-[5rem] border-r border-border-gray'>Offset</td>
								<td class='p-3 w-[3rem] border-border-gray'>
									<svg
										class="w-full fill-white"
										stroke-width="0"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 16 16"
										height="1.4em"
										width="1.4em"
										style="overflow: visible; color: currentcolor;">
										<path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm.256 7a4.474 4.474 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10c.26 0 .507.009.74.025.226-.341.496-.65.804-.918C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4s1 1 1 1h5.256Z"></path><path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-3.5-2a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 1 0V11a.5.5 0 0 0-.5-.5Zm0 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z"></path>
									</svg>
								</td>
							</tr>
						</thead>
						<tbody>
							<For each={employees}>
								{(entry, index) => (
									<>
										<tr class='border-t border-border-gray text-content-gray hover:bg-menu-gray'>
											<td class='p-3 border-r border-border-gray text-center'>
												{index() + 1}
											</td>
											<td class='p-3 border-r border-border-gray'>
												{entry.name}
											</td>
											{/* <td class='p-3 border-r border-border-gray'>
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
											</td> */}
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
														} else {
															if (parseInt(e.target.value) == 0) {
																console.log(
																	offsetTotal() -
																	employees[employees.indexOf(entry)].offset,
																);
																setOffsetTotal(
																	offsetTotal() -
																	employees[employees.indexOf(entry)].offset,
																);

																editEmployees(
																	employees.indexOf(entry),
																	(entry) => ({
																		...entry,
																		offset: 0,
																	}),
																);
															} else {
																editEmployees(
																	employees.indexOf(entry),
																	(entry) => ({
																		...entry,
																		offset: parseInt(e.target.value),
																	}),
																);

																setOffsetTotal(() => {
																	let total = 0;
																	for (let employee of employees) {
																		total += employee.offset;
																	}
																	return total;
																});
															}
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
											<td class='p-2 border-border-gray text-center'>
												<button
													class='p-1 border text-white border-border-gray hover:bg-border-gray rounded-md'
													onClick={() => toggleRow(index())}
												>
													{expandedRow() === index()
														? <svg
															fill="currentColor"
															stroke-width="0"
															xmlns="http://www.w3.org/2000/svg"
															viewBox="0 0 24 24"
															height="1.5em"
															width="1.5em"
															style="overflow: visible; color: currentcolor;">
															<path fill="currentColor" d="m12 11.828-2.828 2.829-1.415-1.414L12 9l4.243 4.243-1.415 1.414L12 11.828Z"></path>
														</svg>
														: <svg
															fill="currentColor"
															stroke-width="0"
															xmlns="http://www.w3.org/2000/svg"
															viewBox="0 0 24 24"
															height="1.5em"
															width="1.5em"
															style="overflow: visible; color: currentcolor;">
															<path fill="currentColor" d="m12 15-4.243-4.242 1.415-1.414L12 12.172l2.828-2.828 1.415 1.414L12 15.001Z"></path>
														</svg>
													}
												</button>
											</td>
										</tr>
										{expandedRow() === index() && (
											<tr class="border-t border-border-gray w-full">
												<td class="p-4 gap-4 flex flex-row">
													<div class='flex flex-col'>
														<div class="font-semibold">Position</div>
														<div class="">{entry.position}</div>
													</div>
													<div class='flex flex-col'>
														<div class="font-semibold">Hours</div>
														<div>{entry.hours_worked}</div>
													</div>
													<div class='flex flex-col'>
														<div class="font-semibold">Initial</div>
														<div>${entry.initial_tip}</div>
													</div>
													<div class='flex flex-col text-nowrap'>
														<div class="font-semibold">Tips received</div>
														<div>${entry.tips}</div>
													</div>
												</td>
											</tr>
										)}
									</>
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
