import "dotenv-safe/config";
import Knex from "knex";
import moment from "moment";
import axios from "axios";

import { Auth, User } from "./interfaces" 

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

    constructor() {
        this.init();
    }

    async init() {
        await this.getAuthKey();
    }

    //pulls current auth key from db
    //requests a new one if current has expired (1 hour expiration)
    async getAuthKey() {
        let auth_data: Auth[] = await db("auth").withSchema("public").select("*").where("id", 1);

        let created_at = moment(auth_data[0].created_at);

        if (moment().isAfter(created_at.add(1, "hours"))) {
            console.log('ALERT::: auth_key has expired -> requesting new auth token');
            await this.generateAuthKey();
            auth_data = await db("auth").withSchema("public").select("*").where("id", 1);
            
        }

        this.auth_key = auth_data[0].auth_key;
    }

//uses sling api to generate a new auth token
    async generateAuthKey() {
        let url = <string>process.env.SLING_API_URL + "/account/login"
        let data = await axios.post(url, {
            email: process.env.SLING_API_EMAIL,
            password: process.env.SLING_API_PASS});
        
        let auth = data.headers.authorization;

        await db('auth').withSchema("public").update("auth_key", auth).where("id", 1);
    }

    async refreshUsersCache() {
        let url = <string>process.env.SLING_API_URL + "/users"
        let users = await axios.get(url, {
            headers: {
                "Authorization": this.auth_key
            }
        });

        let groups;

        let db_users: User[] = [];

    }

    async getGroups() {
        let url = <string>process.env.SLING_API_URL + "/groups";
        let groups = await axios.get(url, {
            headers: {
                "Authorization": this.auth_key
            }
        }) 
    }

    async getUsers() {
        console.log('requesting users');
        
        // let all_users: {[key: number]: User} = {}; 
        // for (let user of users.data) {
        //     all_users[user.id] = {
        //         id: user.id,
        //         type: user.type,
        //         name: user.name,
        //         lastname: user.lastname
        //     }
        // }



        

        console.log('stop');
    }

    async getTimeSheet() {}

    async getShiftSummary() {}
    
    
}