import TipConfigBar from "./TipConfigBar";
import { EmployeeData, pullSlingEmployeeData } from "./GetWorkers";
import { Component, createSignal, createEffect } from "solid-js";

export interface TipConfigProps {
	tip_total: number;
}

const [initialTipTotal, setInitialTipTotal] = createSignal<number>(0);
const [remainingTipTotal, setRemainingTipTotal] = createSignal<number>(0);
const [tipRate, setTipRate] = createSignal<number>(0);

function calculateTipRate(tipTotal: number, employees: EmployeeData[]) {
	//stores the total hours worked between all employees on that shift
	let totalHours = 0;
	setInitialTipTotal(0);
	setRemainingTipTotal(0);
	setTipRate(0);

	for (let employee of employees) {
		totalHours += employee.hours_worked;

		if (employee.position == "Server") {
			employee.initial_tip = employee.hours_worked * 3;
			setInitialTipTotal(initialTipTotal() + employee.initial_tip);
		}
	}

	setRemainingTipTotal(tipTotal - initialTipTotal());
	let tipRate = remainingTipTotal() / totalHours;
	setTipRate(Math.round(tipRate));
}

const TipConfig: Component<TipConfigProps> = (props: TipConfigProps) => {
	let employees: EmployeeData[] = pullSlingEmployeeData();
	createEffect(() => {
		calculateTipRate(props.tip_total, employees);
	});

	return (
		<>
			<TipConfigBar
				tip_total={props.tip_total}
				tip_rate={tipRate()}
			></TipConfigBar>
		</>
	);
};

export default TipConfig;
