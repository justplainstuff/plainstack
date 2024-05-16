import express, { type Express } from "express";
import { fileRouter } from "plainweb";

export async function http(): Promise<Express> {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use(await fileRouter({ dir: "app/routes" }));
  return app;
}
