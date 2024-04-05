export interface EmployeeData {
	name: string;
	hours_worked: number;
	position: Position;
	initial_tip: number;
	tips: number;
	total: number;
	offset: number;
}

type Position = "Server" | "Cook";

let data: EmployeeData[] = [
	{
		name: "Cecil Heimerdinger",
		hours_worked: 10,
		position: "Server",
		initial_tip: 0,
		tips: 0,
		total: 0,
		offset: 0,
	},
	{
		name: "Luxanna Crownguard",
		hours_worked: 8,
		position: "Server",
		initial_tip: 0,
		tips: 0,
		total: 0,
		offset: 0,
	},
	{
		name: "Jarvan Lightshield IV",
		hours_worked: 12,
		position: "Cook",
		initial_tip: 0,
		tips: 0,
		total: 0,
		offset: 0,
	},
	{
		name: "Viego Santiarul Molach vol Kalah Heigaari",
		hours_worked: 4,
		position: "Cook",
		initial_tip: 0,
		tips: 0,
		total: 0,
		offset: 0,
	},
];

export function pullSlingEmployeeData() {
	return data;
}
