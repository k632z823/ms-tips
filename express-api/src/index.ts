import "dotenv-safe/config";
import Knex from "knex";
import express, { response } from "express"
import bodyParser from "body-parser";
import { request } from "http";

import cors from "cors";
import axios from "axios";
import moment, { now } from "moment";

import { Archive_Entry, ShiftData, Entry_type, Entry, Archive_Entry_TagsNotArray, Archive_Entry_TagsNotArray_DateString, EmployeeTipDistribution } from "./interfaces" 
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

// const corsOptions = {
//   origin: "http://localhost:3000",
//   credentials: true,
//   optionSuccessStatus: 200
// }

console.log("Initiating Express Api Script...");

let sling_api = new Sling();

  const app = express();

  app.use(bodyParser.json());
  //app.use(cors(corsOptions));

  app.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    const staticUsername = process.env.LOGIN_USER;
    const staticPassword = process.env.LOGIN_PASSWORD;
  
    if (username === staticUsername && password === staticPassword) {
      res.json({ success: true, message: "Login successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  app.get("/get-entries", async function(request, response) {

    

    let date = request.query.date;
    console.log(date);
    if (date !== null) {
      let entries;

      if (date == "default") {
        entries = await getEntries(moment().format("L"));
      } else {
        // @ts-ignore
        entries = await getEntries(date);
      }
     
     response.json({success: true, entries: entries})
    } else {
      response.status(404).json('Malformed request - missing/incorrect parameter(s)');
    }
    

  });

  app.post("/update-entry", async function(request, response) {
    let entry = request.body.entry;
    await addEntry(entry, request.body.entry_no);

    response.json({success: true})
  })

  app.get("/new-entry", async function (request, response) {
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

    response.json({success: true, entry: {
      tips: [...starter],
      drawer: [...starter],
      final: [...starter]
    }})
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
        tags: item.tags,
        entry_no: item.entry_no
      })
    }
    response.json({success: true, entries: formattedEntries})
  });

  app.get("/get-todays-entry", async function(request,response) {
    let todaysDate: string = moment().format("YYYY-MM-DD");
    let data = await getTodaysEntry(todaysDate);
    let todaysEntry: Archive_Entry;
    if (data.length != 0) {
      todaysEntry = {
        id: data[0].id,
        date: data[0].date,
        drawer: data[0].drawer,
        tips: data[0].tips,
        final: data[0].final,
        tipRate: data[0].tip_rate,
        tags: data[0].tags,
        entry_no: data[0].entry_no
      }
    } else {
      todaysEntry = {
        id: 0,
        date: "",
        drawer: 0,
        tips: 0,
        final: 0,
        tipRate: 0,
        tags: [],
        entry_no: 0
      }
    }
    response.json({success: true, todaysEntry: todaysEntry});
  });

  app.get("/get-most-recent-entry", async function(request,response) {
    let data = await getMostRecentEntry();
    let mostRecentEntry: Archive_Entry;
    if (data) {
      mostRecentEntry = {
        id: data.id,
        date: data.date,
        drawer: data.drawer,
        tips: data.tips,
        final: data.final,
        tipRate: data.tip_rate,
        tags: data.tags,
        entry_no: data.entry_no
      }
    } else {
      mostRecentEntry = {
        id: 0,
        date: "",
        drawer: 0,
        tips: 0,
        final: 0,
        tipRate: 0,
        tags: [],
        entry_no: 0
      }
    }
    response.json({success: true, mostRecentEntry: mostRecentEntry});
  });

  app.get("/get-six-recent-entries", async function(request, response) {
    console.log("Request Recieved: GET six most recent entries from archive_entries");
    let entries = await getSixRecentEntries();
    let formattedEntries: Archive_Entry[] = [];
    for (let item of entries) {
      formattedEntries.push({
        id: item.id,
        date: item.date,
        drawer: item.drawer,
        tips: item.tips,
        final: item.final,
        tipRate: item.tip_rate,
        tags: item.tags,
        entry_no: item.entry_no
      })
    }
    response.json({success: true, entries: formattedEntries})
  });

  // get the tip distrubtions for a shift
  app.get("/get-employee-tip-distribution", async function(request, response) {
    let archiveEntryId = request.query.archiveEntryId;

    if (archiveEntryId !== null) {
      // @ts-ignore
      let data = await getEmployeeTipDistribution(parseInt(archiveEntryId));
      let tipDistributions: EmployeeTipDistribution[] = [];

      for (let item of data) {
        tipDistributions.push({
          hours: item.hours,
          initial: item.initial,
          tips_received: item.tips_received,
          total: item.total,
          offset: item.offset,
          name: item.user_name,
          title: item.group_name
        })
      }
    response.json({success: true, tipDistributions: tipDistributions});
    } else {
      response.status(404).json('Malformed request - missing/incorrect parameter(s)');
    }
    
  })

  app.get("/get-export-entries", async function(request, response) {
    console.log("Request Recieved: GET export entries from archive_entries");
    let fromDate = request.query.fromDate;
    let toDate = request.query.toDate;
    // @ts-ignore
    let data = await getEntriesToExport(fromDate, toDate);
    let entriesTagsNotArray: Archive_Entry_TagsNotArray[] = [];
    for (let item of data) {
      let tags: string = "";
      item.tags.forEach((tag: string) => {
        if (item.tags.indexOf(tag) != item.tags.length - 1) {
          tags += tag + ", ";
        } else {
          tags += tag;
        }
      });
      entriesTagsNotArray.push({
        id: item.id,
        date: moment(item.date),
        tips: item.tips,
        final: item.final,
        tipRate: item.tipRate,
        tags: tags,
        drawer: item.drawer,
      });
      entriesTagsNotArray.sort(
        (a, b) => b.date.valueOf() - a.date.valueOf()
      );
    }
    let entries: Archive_Entry_TagsNotArray_DateString[] = [];
    for (let item of entriesTagsNotArray) {
      entries.push({
        id: item.id,
        date: moment(item.date).format("MM-DD-YYYY"),
        tips: item.tips,
        final: item.final,
        tipRate: item.tipRate,
        tags: item.tags,
        drawer: item.drawer,
      })
    }
    response.json({success: true, entries: entries})
  })

  app.post("/add-archive-entry", async function(request, response) {
    if (request.body === null ) response.status(404).json('Malformed request - missing/incorrect parameter(s)');
    console.log("Request Recieved: INSERT record for archive_entries on " + request.body.date);
    let entry = request.body.entry;
    await addArchiveEntry(entry, request.body.entry_no);
    response.json({success: true});
  })

  app.post("/add-tip-distribtion-records", async function(request, response) {
    if (request.body === null ) response.status(404).json('Malformed request - missing/incorrect parameter(s)');
    console.log("Request Recieved: UPSERT record for tip_distribution_records on " + request.body.date);
    let tip_distribution = request.body.tip_distribution;
    await addTipDistributionEntry(tip_distribution);
    response.json({success: true})
  })

  app.delete("/delete-entry", async function(request, response) {
    if (request.query.id === null ) response.status(404).json('Malformed request - missing/incorrect parameter(s)');
    let id = request.query.id;
    console.log('Request Recieved: DELETE row from archive_entries on id ' + id);
    // @ts-ignore
    await deleteEntry(parseInt(id));
    response.json({success: true});
  });

  //gets all the employees that worked for the day
  app.get("/get-shift-summary", async function (request, response) {
    console.log('Request Recieved: GET shift summary');
    if (request.query.date === null ) response.status(404).json('Malformed request - missing/incorrect parameter(s)');

    //@ts-ignore
    let date = request.query.date === 'default' ? moment().format("YYYY-MM-DD") : moment(request.query.date).format("YYYY-MM-DD");

    let shiftSummary: ShiftData[][] =  await sling_api.getTimeSheet(`${date}T00:00:00Z/${date}T23:00:00Z`); 

    response.json({success: true, shift_data: shiftSummary})
  })



  app.listen(process.env.HOST_PORT);

  async function getArchiveEntries() {
    return await db.withSchema("public").from("archive_entries").select("*").orderBy("date", "asc").orderBy("entry_no", "asc");
  }

  async function deleteEntry(idToDelete: number) {
    await db.withSchema("public").from("entries").where("archive_entry_id", idToDelete).del();
    await db.withSchema("public").from("tip_distribution_records").where("archive_entry_id", idToDelete).del();
    await db.withSchema("public").from("archive_entries").where("id", idToDelete).del();
  }

  async function getEntries(date: string) {
    let currentArchiveEntries = await db.withSchema('public').from('archive_entries').select('*').where('date', date);

    let entries: {
      tips: Entry[];
      drawer: Entry[];
      final: Entry[];
    }[] = [];

    if (currentArchiveEntries.length === 0) {
      entries.push(await organizeEntries(date, 0));
    } else {
      for (let entry of currentArchiveEntries) {
        entries.push(await organizeEntries(date, entry.id));
      }
    }

    return entries;
    
  }

  async function organizeEntries(date: string, entry_id: number) {
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
    };

    let dbRecords = {
      tips: await db.withSchema('public').from('entries').select('*').where('entry_date', date).andWhere('type', Entry_type.tips_label).andWhere('archive_entry_id', entry_id),
      drawer: await db.withSchema('public').from('entries').select('*').where('entry_date', date).andWhere('type', Entry_type.drawer_label).andWhere('archive_entry_id', entry_id),
      final: await db.withSchema('public').from('entries').select('*').where('entry_date', date).andWhere('type', Entry_type.final_label).andWhere('archive_entry_id', entry_id)
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

  async function addEntry(entry: any, entry_no: number) {
    let archiveEntry = await db.withSchema('public').from('archive_entries').select('*').where('date', entry.entry_date).andWhere('entry_no', entry_no);
    let existingEntry = await db.withSchema("public").from('entries').select("*").where('entry_date', entry.entry_date).andWhere('type', entry.type).andWhere('archive_entry_id', archiveEntry[0].id);

    if (existingEntry.length != 0) {
      await db('public.entries').update({
        coin_01: entry.coin_01,
        coin_05: entry.coin_05,
        coin_10: entry.coin_10,
        coin_25: entry.coin_25,
        coin_50: entry.coin_50,
        coin_1: entry.coin_1,
        bill_1: entry.bill_1,
        bill_5: entry.bill_5,
        bill_10: entry.bill_10,
        bill_20: entry.bill_20,
        bill_50: entry.bill_50,
        bill_100: entry.bill_100
      }).where('entry_date', entry.entry_date).andWhere('type', entry.type).andWhere('archive_entry_id', archiveEntry[0].id);
    } else {
      entry.archive_entry_id = archiveEntry[0].id;
      await db.withSchema("public").insert(entry).into('entries');
    }
    
  }

  async function addArchiveEntry(archive_entry:any, entry_no: number) {
    //checks if an entry already exists in the archive, if not creates a new one
    let existingEntry = await db.withSchema("public").from('archive_entries').select('*').where('date', archive_entry.date).andWhere('entry_no', entry_no);

    if (existingEntry.length !=0) {
      if (archive_entry.tip_rate === 0 && existingEntry[0].tip_rate !=0) {
        delete archive_entry.tip_rate;

      }
      await db.withSchema("public").update(archive_entry).where('date', archive_entry.date).andWhere('entry_no', entry_no).into('archive_entries');
    } else {
      await db.withSchema("public").insert(archive_entry).into('archive_entries');
    }
  }

  async function addTipDistributionEntry(tip_distribution_entry: any) {
    await db.withSchema("public").insert(tip_distribution_entry).into("tip_distribution_records").onConflict(['date', 'user_id', 'group_id']).merge();
  }

  async function getEntriesToExport(fromDate: string, toDate: string) {
    return await db.withSchema("public").from("archive_entries").select("date", "tips", "final", "tip_rate","tags", "drawer").where("date", ">=", fromDate).andWhere("date", "<=", toDate);
  }

  async function getTodaysEntry(todaysDate: string) {
    return await db.withSchema("public").from("archive_entries").select("*").where("date",todaysDate);
  }

  async function getMostRecentEntry() {
    return await db.withSchema("public").from("archive_entries").select("*").orderBy("date", "desc").first();
  }

  async function getSixRecentEntries() {
    return await db.withSchema("public").from("archive_entries").select("*").orderBy("date", "desc").orderBy("entry_no","desc").limit(6);
  }
  
  async function getEmployeeTipDistribution(archiveEntryId: number) {
    return await db
      .withSchema("public")
      .from("tip_distribution_records")
      .select(
        "tip_distribution_records.hours",
        "tip_distribution_records.initial",
        "tip_distribution_records.tips_received",
        "tip_distribution_records.total",
        "tip_distribution_records.offset",
        db.raw("CONCAT(users.name, ' ', users.lastname) AS user_name"),
        "groups.name AS group_name"
      )
      .join("users", "tip_distribution_records.user_id", "=", "users.id")
      .join("groups", "tip_distribution_records.group_id", "=", "groups.id")
      .where("tip_distribution_records.archive_entry_id", archiveEntryId);
  }