import { getDatabase } from "plainstack";
import config from "plainweb.config";

export const database = getDatabase(config);
export type Database = typeof database;
