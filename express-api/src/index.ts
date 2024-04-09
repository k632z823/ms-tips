import "dotenv-safe/config";
import Knex from "knex";
import express, { response } from "express"
import bodyParser from "body-parser";
import { request } from "http";

import cors from "cors";
import axios from "axios";
import moment from "moment";

import { Entry } from "./interfaces" 
import {Sling} from "./sling";

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

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  optionSuccessStatus: 200
}

let sling_api = new Sling();

  const app = express();

  app.use(bodyParser.json());
  app.use(cors(corsOptions));

  //gets all rows from archive_entries db table
  app.get("/get-entries", async function(request, response) {
    let body = request.body;
    let entries = await getEntries();
    let formattedEntries: Entry[] = [];
    for (let item of entries) {
      formattedEntries.push({
        date: item.date,
        drawer: item.drawer,
        tips: item.tips,
        final: item.final,
        tipRate: item.tip_rate,
        tags: item.tags
      })
    }
    response.json({success: true, entries: formattedEntries})
  })

  //gets all the employees that worked for the day
  app.get("/get-shift-summary", async function (request, response) {
    let body = request.body;

    await sling_api.getUsers(); 
  })

  app.listen(process.env.HOST_PORT);

  async function getEntries() {
    return await db.withSchema("public").from("archive_entries").select("*");
  }

  //gets the current sling api key 
  async function getAuthKey() {
    let key = await db("auth").withSchema("public").select("auth_key").where("id", 1);
  }