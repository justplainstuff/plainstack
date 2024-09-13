import express from "express";
import { defineHttp } from "../../../../../src/middleware";

export default defineHttp(async ({ paths }) => {
  return express();
});
