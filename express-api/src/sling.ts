import "dotenv-safe/config";
import Knex from "knex";
import moment from "moment";
import axios, { all } from "axios";

import { Auth, Group, ShiftData, Timesheet_Entry, User } from "./interfaces" 

const db = Knex({
    client: "pg",
    connection: {
      host: <string>process.env.DB_HOST,
      user: <string>process.env.DB_USER,
      password: <string>process.env.DB_PASS,
      database: <string>process.env.DB_NAME,
    },
    pool: { min: 0, max: 30 },
});

export class Sling {
    private auth_key: string = "";
    private users: {[key: number]: User} = {};
    private positions: {[key: number]: Group} = {};

    constructor() {
        this.init();
    }

    async init() {
        await this.getAuthKey();
        await this.getUsers();
        await this.getGroups();
    }

    //pulls current auth key from db
    //requests a new one if current has expired (1 hour expiration)
    async getAuthKey() {
        let auth_data: Auth[] = await db("auth").withSchema("public").select("*").where("id", 1);

        let created_at = moment(auth_data[0].created_at);

        if (moment().isAfter(created_at.add(1, "hours"))) {
            console.log('ALERT::: auth_key has expired -> requesting new auth token');
            await this.refreshAuthKey();
            auth_data = await db("auth").withSchema("public").select("*").where("id", 1);
            
        }

        this.auth_key = auth_data[0].auth_key;
    }

//uses sling api to generate a new auth token
    async refreshAuthKey() {
        let url = <string>process.env.SLING_API_URL + "/account/login"
        let data = await axios.post(url, {
            email: process.env.SLING_API_EMAIL,
            password: process.env.SLING_API_PASS});
        
        let auth = data.headers.authorization;

        await db('auth').withSchema("public").update("auth_key", auth).where("id", 1);
    }

    // refreshes user table to include the new users/update user names etc.
    async refreshUsersCache() {
        let url = <string>process.env.SLING_API_URL + "/users"
        let requestData = await axios.get(url, {
            headers: {
                "Authorization": this.auth_key
            }
        }).then(function(response) {
            return response.data
        });

        let users: User[] = [];

        for (let user of requestData) {
            users.push({
                id: user.id,
                name: user.name,
                lastname: user.lastname
            });  
        }

        await db("users").withSchema('public').insert(users).onConflict("id").merge(["name", "lastname"]);
    }

    async refreshGroups() {
        let url = <string>process.env.SLING_API_URL + "/groups";
        let requestData = await axios.get(url, {
            headers: {
                "Authorization": this.auth_key
            }
        }).then(function (response) {
            return response.data;
        });

        let groups: Group[] = [];

        for (let group of requestData) {
            groups.push({
                id: group.id,
                type: group.type,
                name: group.name
            })
        }

        await db("groups").withSchema('public').insert(groups).onConflict("id").merge(["name", "type"]);
    }

    async getUsers() {
        let users = await db('users').withSchema('public').select("*");
        
        let all_users: {[key: number]: User} = {}; 
        for (let user of users) {
            all_users[user.id] = {
                id: user.id,
                name: user.name,
                lastname: user.lastname
            }
        }

        this.users = all_users;
    }

    //gets all positions stored in groups db table
    async getGroups() {
        let groups = await db('groups').withSchema('public').select("*").where("type", "position");

        let positions: {[key: number]: Group} = {};
        for (let group of groups) {
            positions[group.id] = {
                id: group.id,
                type: group.type,
                name: group.name
            }
        }
        this.positions = positions;
    }

    async getTimeSheet(date: string) {
        let url = <string>process.env.SLING_API_URL + "/reports/timesheets"
        let timeSheet: Timesheet_Entry[] = await axios.get(url, {
            params: {
                dates: date
            },
            headers: {
                "Authorization": this.auth_key
            }
        }).then(function (response) {
            return response.data;
        });

        let shiftData: ShiftData[][] = [];

        for (let entry of timeSheet) {
            //skips entries that don't have a p
            if (entry.timesheetProjections.length == 0) {
                continue;
            } 

            let user_id = entry.user.id;
            let position_id = entry.position.id;

            //checks if the user_id is stored in cache
            //if not tries refreshing to get new users
            if (!(user_id in this.users)) {
                await this.refreshUsersCache();
                await this.getUsers();

                if (!(user_id in this.users)) {
                    console.log('eroror');
                    continue;
                }

            }

            //checks if position_id is stored in cache
            //if not, tries refreshing to get new groups
            if (!(position_id in this.positions)) {
                await this.refreshGroups();
                await this.getGroups();

                if (!(position_id in this.positions)) {
                    console.log('eroror');
                    continue;
                }

            }

            for (let projection of entry.timesheetProjections) {
                let index = entry.timesheetProjections.indexOf(projection);

                if (!shiftData[index]) {
                    shiftData[index] = []; // Initialize the sub-array
                }
                
                let hours = projection.paidMinutes / 60;

                shiftData[index].push({
                    name: this.users[user_id].name,
                    hours_worked: parseFloat((Math.round(hours * 4) / 4).toFixed(2)),
                    position: this.positions[position_id].name,
                    position_id: position_id,
                    initial_tip: 0,
                    tips: 0,
                    total: 0,
                    offset: 0,
                    user_id: user_id,
                })
            }

            

            // console.log(hours);
            // console.log(Math.round(hours * 4))
            // console.log(Math.round(hours * 4) / 4);
            // console.log((Math.round(hours * 4) / 4).toFixed(2));
            // console.log(parseFloat((Math.round(hours * 4) / 4).toFixed(2)));
        }

        return shiftData
    }
}