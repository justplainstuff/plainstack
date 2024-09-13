import { defineHandler } from "../../../../src/plainstack";

export const GET = defineHandler(async ({ req }) => {
  const rest = req.params.rest ?? null;
  return { rest };
});
