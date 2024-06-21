import { Handler } from "plainweb";

export const GET: Handler = async ({ res }) => {
  return () => {
    res.set("Content-Type", "text/plain");
    res.send("User-agent: *\nAllow: /");
  };
};
