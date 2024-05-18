import expressListRoutes from "express-list-routes";
import { http } from "../http";

async function list() {
  expressListRoutes(await http());
}

void list();
