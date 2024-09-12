import { defineHandler } from "plainstack";

export const GET = defineHandler(async ({ res }) => {
  return () => {
    res.set("Content-Type", "text/plain");
    res.send("User-agent: *\nAllow: /");
  };
});
