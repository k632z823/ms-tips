// for ArchiveTable.tsx
import moment, { Moment } from "moment";

export interface Archive_Entry {
    id: number;
    date: string;
    drawer: number;
    tips: number;
    final: number;
    tipRate: number;
    tags: string[];
}

export interface Archive_Entry_TagsNotArray {
    id: number;
    date: Moment;
    drawer: number;
    tips: number;
    final: number;
    tipRate: number;
    tags: string;
}

export interface Archive_Entry_TagsNotArray_DateString {
    id: number;
    date: string;
    drawer: number;
    tips: number;
    final: number;
    tipRate: number;
    tags: string;
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
    user_id: number;
    position_id: number;
}

export enum Entry_type {
    drawer_label = 'drawer',
    final_label ='final', 
    tips_label= 'tips'
}

export interface Entry {
    id: number;
    bill_amount: number;
    change_amount: number;
}

