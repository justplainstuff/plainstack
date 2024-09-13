import express from "express";
import { defineHttp } from "../../../../../src/web/http";

export default defineHttp(async ({ paths }) => {
  return express();
});
