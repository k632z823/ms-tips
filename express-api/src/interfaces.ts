// for ArchiveTable.tsx
export interface Entry {
    date: string;
    drawer: number;
    tips: number;
    final: number;
    tipRate: number;
    tags: string[];
}

export interface Auth {
    created_at: string;
    auth_key: string;
}

//simplified body of a response from https://api.getsling.com/v1/reports/timesheets
export interface Timesheet_Entry {
    id: string;
    status: string;
    type: string;
    user: {
        id: number;
    }
    position: {
        id: number;
    }
    timesheetProjections: TimeSheet_Projection[];
}

interface TimeSheet_Projection {
    clockIn: string;
    clockOut: string;
    paidMinutes: number;
}

//simplified response body from https://api.getsling.com/v1/groups
//will show the available positions
export interface Group {
    id: number;
    type: string;
    name: string;
}

//simplified response body from https://api.getsling.com/v1/users
//shows all users/employees
export interface User {
    id: number;
    name: string;
    lastname: string;
}

export interface ShiftData {
	name: string;
	hours_worked: number;
	position: string;
	initial_tip: number;
	tips: number;
	total: number;
	offset: number;
}