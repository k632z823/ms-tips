import "dotenv-safe/config";
import Knex from "knex";
import express from "express"
import bodyParser from "body-parser";

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

  app.listen(process.env.HOST_PORT);