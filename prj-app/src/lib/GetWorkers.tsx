import axios from "axios";

export interface ShiftData {
	name: string;
	hours_worked: number;
	position: string;
	initial_tip: number;
	tips: number;
	total: number;
	offset: number;
	user_id: number;
	position_id: number;
}

export interface Tip_Distribution_Entry {
	date: string;
	user_id: number;
	group_id: number;
	hours: number;
	initial: number;
	tips_received: number;
	total: number;
	offset: number;
}

// type Position = "Server" | "Cook";

// let data: EmployeeData[] = [
// 	{
// 		name: "Cecil Heimerdinger",
// 		hours_worked: 10,
// 		position: "Server",
// 		initial_tip: 0,
// 		tips: 0,
// 		total: 0,
// 		offset: 0,
// 	},
// 	{
// 		name: "Luxanna Crownguard",
// 		hours_worked: 8,
// 		position: "Server",
// 		initial_tip: 0,
// 		tips: 0,
// 		total: 0,
// 		offset: 0,
// 	},
// 	{
// 		name: "Jarvan Lightshield IV",
// 		hours_worked: 12,
// 		position: "Cook",
// 		initial_tip: 0,
// 		tips: 0,
// 		total: 0,
// 		offset: 0,
// 	},
// 	{
// 		name: "Viego Santiarul Molach vol Kalah Heigaari",
// 		hours_worked: 4,
// 		position: "Cook",
// 		initial_tip: 0,
// 		tips: 0,
// 		total: 0,
// 		offset: 0,
// 	},
// ];

export async function pullSlingEmployeeData(date: string) {
	let data = await axios
		.get(import.meta.env.VITE_API_URL + "get-shift-summary", {
			params: { date: date },
		})
		.then(function (response) {
			return response.data.shift_data;
		});

	return data;
}
