import TipConfigBar from "./TipConfigBar";
import {
	ShiftData as ShiftData,
	pullSlingEmployeeData,
	Tip_Distribution_Entry as Tip_Distribution_Entry,
} from "./GetWorkers";
import {
	Component,
	createSignal,
	createEffect,
	For,
	on,
	onMount,
} from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";
import axios from "axios";

export interface TipConfigProps {
	tip_total: number;
	date: string;
	entry_no: number;
}

const [initialTipTotal, setInitialTipTotal] = createSignal<number>(0);
const [remainingTipTotal, setRemainingTipTotal] = createSignal<number>(0);
const [tipRate, setTipRate] = createSignal<number>(0);
const [employees, editEmployees] = createStore<ShiftData[]>([]);
const [expandedRow, setExpandedRow] = createSignal<number | null>(null); // Track expanded row
const [offsetTotal, setOffsetTotal] = createSignal<number>(0);

function calculateTipRate(tipTotal: number, employeeData: ShiftData[]) {
	//stores the total hours worked between all employees on that shift
	//console.log(tipTotal);
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
		if (entry.position.toLowerCase() == "server") {
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
	let calculatedRate = remainingTipTotal() / totalHours;
	setTipRate(Math.round(calculatedRate));
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

async function addTipDistribution(date: string) {
	//let date = entryDate == "default" ? moment().format("L") : entryDate;
	let tip_distribution: Tip_Distribution_Entry[] = [];

	for (let employee of employees) {
		tip_distribution.push({
			date: date,
			user_id: employee.user_id,
			group_id: employee.position_id,
			hours: employee.hours_worked,
			initial: employee.initial_tip,
			tips_received: employee.tips,
			total: employee.total,
			offset: employee.offset,
		});
	}

	await axios.post("http://localhost:3001/add-tip-distribtion-records", {
		date: date,
		tip_distribution: tip_distribution,
	});
}

const TipConfig: Component<TipConfigProps> = (props: TipConfigProps) => {
	onMount(async () => {
		let employeesShiftData: ShiftData[][] = await pullSlingEmployeeData(
			props.date,
		);
		editEmployees(employeesShiftData[props.entry_no]);
		if (props.tip_total != 0 && employees.length > 0) {
			calculateTipRate(props.tip_total, employees);
			calculateTipDistribution(employees);
		}
	});
	createEffect(
		on(
			() => props.tip_total,
			() => {
				if (props.tip_total != 0 && employees.length > 0) {
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
				tip_rate={tipRate() ? tipRate() : 0}
			></TipConfigBar>
			<div class='flex justify-center px-5 pt-4'>
				<div class='border border-border-gray rounded-md w-full overflow-x-auto'>
					<table class='table-fixed text-sm font-light w-full'>
						<thead class='bg-input-gray'>
							<tr class='text-start'>
								<td class='p-3 w-[3rem] border-r border-border-gray text-center'>
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
										class='w-full fill-white'
										stroke-width='0'
										xmlns='http://www.w3.org/2000/svg'
										viewBox='0 0 16 16'
										height='1.2em'
										width='1.2em'
										style='overflow: visible; color: currentcolor;'
									>
										<path d='M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z'></path>
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
													{expandedRow() === index() ? (
														<svg
															fill='currentColor'
															stroke-width='0'
															xmlns='http://www.w3.org/2000/svg'
															viewBox='0 0 24 24'
															height='1.5em'
															width='1.5em'
															style='overflow: visible; color: currentcolor;'
														>
															<path
																fill='currentColor'
																d='m12 11.828-2.828 2.829-1.415-1.414L12 9l4.243 4.243-1.415 1.414L12 11.828Z'
															></path>
														</svg>
													) : (
														<svg
															fill='currentColor'
															stroke-width='0'
															xmlns='http://www.w3.org/2000/svg'
															viewBox='0 0 24 24'
															height='1.5em'
															width='1.5em'
															style='overflow: visible; color: currentcolor;'
														>
															<path
																fill='currentColor'
																d='m12 15-4.243-4.242 1.415-1.414L12 12.172l2.828-2.828 1.415 1.414L12 15.001Z'
															></path>
														</svg>
													)}
												</button>
											</td>
										</tr>
										{expandedRow() === index() && (
											<tr class='border-t border-border-gray w-full'>
												<td class='p-2 flex flex-col'>
													<div class='p-2 flex flex-col'>
														<div class='flex flex-row items-center'>
															<svg
																class='mr-4 fill-icon-gray'
																stroke-width='0'
																xmlns='http://www.w3.org/2000/svg'
																viewBox='0 0 16 16'
																height='1em'
																width='1em'
																style='overflow: visible; color: currentcolor;'
															>
																<path d='M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z'></path>
															</svg>
															<div class='font-semibold'>Position</div>
														</div>
														<div class='ml-[30px] text-content-gray font-medium'>
															{entry.position}
														</div>
													</div>
													<div class='p-2 flex flex-col'>
														<div class='flex flex-row items-center'>
															<svg
																stroke-width='2'
																xmlns='http://www.w3.org/2000/svg'
																class='mr-4 stroke-icon-gray icon icon-tabler icon-tabler-moneybag'
																width='1em'
																height='1em'
																viewBox='0 0 24 24'
																stroke-linecap='round'
																stroke-linejoin='round'
																style='overflow: visible; color: currentcolor;'
															>
																<path
																	stroke='none'
																	d='M0 0h24v24H0z'
																	fill='none'
																></path>
																<path d='M9.5 3h5a1.5 1.5 0 0 1 1.5 1.5a3.5 3.5 0 0 1 -3.5 3.5h-1a3.5 3.5 0 0 1 -3.5 -3.5a1.5 1.5 0 0 1 1.5 -1.5z'></path>
																<path d='M4 17v-1a8 8 0 1 1 16 0v1a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z'></path>
															</svg>
															<div class='font-semibold'>Initial</div>
														</div>
														<div class='ml-[30px] text-content-gray font-medium'>
															${entry.initial_tip}
														</div>
													</div>
												</td>
												<td></td>
												<td class='p-2 flex flex-col'>
													<div class='p-2 flex flex-col'>
														<div class='flex flex-row items-center'>
															<svg
																class='mr-4 fill-icon-gray'
																stroke-width='0'
																xmlns='http://www.w3.org/2000/svg'
																viewBox='0 0 1024 1024'
																height='1em'
																width='1em'
																style='overflow: visible; color: currentcolor;'
															>
																<path d='M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z'></path>
																<path d='M686.7 638.6 544.1 535.5V288c0-4.4-3.6-8-8-8H488c-4.4 0-8 3.6-8 8v275.4c0 2.6 1.2 5 3.3 6.5l165.4 120.6c3.6 2.6 8.6 1.8 11.2-1.7l28.6-39c2.6-3.7 1.8-8.7-1.8-11.2z'></path>
															</svg>
															<div class='font-semibold'>Hours</div>
														</div>
														<div class='ml-[30px] text-content-gray font-medium'>
															{entry.hours_worked}
														</div>
													</div>
													<div class='p-2 flex flex-col text-nowrap'>
														<div class='flex flex-row items-center'>
															<svg
																class='mr-4 fill-icon-gray'
																stroke-width='0'
																xmlns='http://www.w3.org/2000/svg'
																viewBox='0 0 576 512'
																height='1em'
																width='1em'
																style='overflow: visible; color: currentcolor;'
															>
																<path d='M64 64C28.7 64 0 92.7 0 128v256c0 35.3 28.7 64 64 64h448c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm64 320H64v-64c35.3 0 64 28.7 64 64zM64 192v-64h64c0 35.3-28.7 64-64 64zm384 192c0-35.3 28.7-64 64-64v64h-64zm64-192c-35.3 0-64-28.7-64-64h64v64zm-224-32a96 96 0 1 1 0 192 96 96 0 1 1 0-192z'></path>
															</svg>
															<div class='font-semibold'>Tips received</div>
														</div>
														<div class='ml-[30px] text-content-gray font-medium'>
															${entry.tips}
														</div>
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
			{/*TODO: This is the reset and submit button for tip rate have */}
			<button
				class='text-black font-medium rounded-md bg-green hover:bg-white/90'
				onClick={async () => {
					//await addTipDistribution(props.date);
				}}
			>
				Reset Tip Rate
			</button>

			<button
				class='text-black font-medium rounded-md bg-green hover:bg-white/90'
				onClick={async () => {
					await addTipDistribution(props.date);
				}}
			>
				Save Tip Calculations
			</button>
		</>
	);
};

export default TipConfig;
