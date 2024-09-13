import { defineHandler } from "../../../../src/plainstack";

export const GET = defineHandler(async () => {
  return <h1>GET</h1>;
});
