import { defineHandler } from "../../../../src/plainstack";

export const POST = defineHandler(async () => {
  return { status: 200 };
});

export const GET = defineHandler(async () => {
  return <h1>GET</h1>;
});
