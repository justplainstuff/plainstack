import { migrate } from "plainweb";
import { connection, db } from "~/app/database/database";

migrate(db);
connection.close();
