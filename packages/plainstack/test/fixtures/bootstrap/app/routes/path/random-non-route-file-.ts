import { defineHandler } from "../../../../../../src/plainstack";

export const GET = defineHandler(async () => {
  return { status: 200 };
});
