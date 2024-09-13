import env from "app/config/env";
import SQLite from "better-sqlite3";
import { defineQueue } from "plainstack";

export default defineQueue({
  connection: new SQLite(env.DB_URL),
});
