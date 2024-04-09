import "dotenv-safe/config";
import Knex from "knex";
import express, { response } from "express"
import bodyParser from "body-parser";
import { request } from "http";
import { Entry } from "./interfaces" 

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

  const app = express();

  app.use(bodyParser.json());

  app.get("/get-entries", async function(request, response) {
    console.log("MEOW")
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

  app.listen(process.env.HOST_PORT);

  async function getEntries() {
    return await db.withSchema("public").from("archive_entries").select("*");
  }