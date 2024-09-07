import { CamelCasePlugin } from "kysely";
import { defineConfig } from "kysely-ctl";
import { connection } from "./app/config/database";

export default defineConfig({
  dialect: connection,
  migrations: {
    migrationFolder: "migrations",
  },
  plugins: [new CamelCasePlugin()],
  seeds: {
    seedFolder: "seeds",
  },
});
