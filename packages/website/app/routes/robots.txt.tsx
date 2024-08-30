import type { Handler } from "plainstack";

export const GET: Handler = async ({ res }) => {
  return () => {
    res.set("Content-Type", "text/plain");
    res.send("User-agent: *\nAllow: /");
  };
};
