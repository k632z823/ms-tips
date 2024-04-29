import "dotenv-safe/config";
import Knex from "knex";
import express, { response } from "express"
import bodyParser from "body-parser";
import { request } from "http";

import cors from "cors";
import axios from "axios";
import moment from "moment";

import { Archive_Entry, ShiftData, Entry_type, Entry } from "./interfaces" 
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

console.log("Initiating Express Api Script...");

let sling_api = new Sling();

  const app = express();

  app.use(bodyParser.json());
  app.use(cors(corsOptions));

  app.get("/get-entries", async function(request, response) {

    let date = request.query.date;
    let entries;

    if (date == "default") {
      entries = await getEntries('04-28-2024');
    } else {
      // @ts-ignore
      entries = await getEntries(date);
    }
   
   response.json({success: true, entries: entries})

  });

  app.post("/add-entry", async function(request, response) {

  })

  //gets all rows from archive_entries db table
  app.get("/get-archive-entries", async function(request, response) {
    console.log("Request Recieved: GET all entries from archive_entries");
    let entries = await getArchiveEntries();
    let formattedEntries: Archive_Entry[] = [];
    for (let item of entries) {
      formattedEntries.push({
        id: item.id,
        date: item.date,
        drawer: item.drawer,
        tips: item.tips,
        final: item.final,
        tipRate: item.tip_rate,
        tags: item.tags
      })
    }
    response.json({success: true, entries: formattedEntries})
  });

  app.get("/get-export-entries", async function(request, response) {
    let fromDate = request.query.fromDate;
    let toDate = request.query.toDate;
    // @ts-ignore
    let entries = await getEntriesToExport(fromDate, toDate);
    response.json({success: true, entries: entries})
  })

  app.get("/add-archive-entry", async function(request, response) {

  })

  app.delete("/delete-entry", async function(request, response) {
    let id = request.query.id;
    console.log('Request Recieved: DELETE row from archive_entries on id ' + id);
    // @ts-ignore
    await deleteArchiveEntry(parseInt(id));
    response.json({success: true});
  });

  //gets all the employees that worked for the day
  app.get("/get-shift-summary", async function (request, response) {
    console.log('Request Recieved: GET shift summary');
    let body = request.body;

    let shiftSummary: ShiftData[] =  await sling_api.getTimeSheet("2024-04-05T00:00:00Z/2024-04-05T23:00:00Z"); 

    response.json({succes: true, shift_data: shiftSummary})
  })

  app.listen(process.env.HOST_PORT);

  async function getArchiveEntries() {
    return await db.withSchema("public").from("archive_entries").select("*");
  }

  async function deleteArchiveEntry(idToDelete: number) {
    await db.withSchema("public").from("archive_entries").where("id", idToDelete).del();
  }

  async function getEntries(date: string) {
    const starter: Entry[] = [
      {
        id: 0,
        bill_amount: 0,
        change_amount: 0,
      },
      {
        id: 1,
        bill_amount: 0,
        change_amount: 0,
      },
      {
        id: 2,
        bill_amount: 0,
        change_amount: 0,
      },
      {
        id: 3,
        bill_amount: 0,
        change_amount: 0,
      },
      {
        id: 4,
        bill_amount: 0,
        change_amount: 0,
      },
      {
        id: 5,
        bill_amount: 0,
        change_amount: 0,
      },
    ];

    let entries: {
      tips: Entry[];
      drawer: Entry[];
      final: Entry[];
    } = {
      tips: [],
      drawer: [],
      final: []
    }

    let dbRecords = {
      tips: await db.withSchema('public').from('entries').select('*').where('entry_date', date).andWhere('type', Entry_type.tips_label),
      drawer: await db.withSchema('public').from('entries').select('*').where('entry_date', date).andWhere('type', Entry_type.drawer_label),
      final: await db.withSchema('public').from('entries').select('*').where('entry_date', date).andWhere('type', Entry_type.final_label)
    }

    let keys = Object.keys(dbRecords);

    for (let key of keys) {
      //@ts-ignore
      if (dbRecords[key].length != 0) {
        //@ts-ignore
        let entry = dbRecords[key][0];
        //@ts-ignore
        entries[key] = [
          {
            id: 0,
            bill_amount: entry.bill_1,
            change_amount: entry.coin_01,
          },
          {
            id: 1,
            change_amount: entry.coin_05,
            bill_amount: entry.bill_5,
          },
          {
            id: 2,
            change_amount: entry.coin_10,
            bill_amount: entry.bill_10,
          },
          {
            id: 3,
            change_amount: entry.coin_25,
            bill_amount: entry.bill_20,
          },
          {
            id: 4,
            change_amount: entry.coin_50,
            bill_amount: entry.bill_50,
          },
          {
            id: 5,
            change_amount: entry.coin_1,
            bill_amount: entry.bill_100,
          }
        ]
      } else {
        //@ts-ignore
        entries[key] = JSON.parse(JSON.stringify(starter))
      }
    }

    return entries;
  }

  async function addEntry() {

  }

  async function getEntriesToExport(fromDate: string, toDate: string) {
    return await db.withSchema("public").from("archive_entries").select("*").where("date", ">=", fromDate).andWhere("date", "<=", toDate);
  }