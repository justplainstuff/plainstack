import { defineHandler } from "../../../../../src/plainstack";

export const GET = defineHandler(async ({ req }) => {
  return <h1 safe>GET /path/{req.params.id}</h1>;
});
