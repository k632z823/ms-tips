import axios from "axios";

export interface EmployeeTipDistribution {
    hours: number;
    initial: number;
    tips_received: number;
    total: number;
    offset: number;
    name: string;
    title: string; 
}

 export async function getTipDistributions(archiveEntryId: number) {
	let response = await axios.get("http://localhost:3001/get-employee-tip-distribution/", {
		params: {
			archiveEntryId: archiveEntryId
		}
	});
	let responseData = response.data.tipDistributions;

	let tipDistributions: EmployeeTipDistribution[] = [];
	for (let item of responseData) {
		tipDistributions.push({
			hours: item.hours,
			initial: item.initial,
			tips_received: item.tips_received,
			total: item.total,
			offset: item.offset,
			name: item.name,
			title: item.title
		})
	}

	return tipDistributions;
}
