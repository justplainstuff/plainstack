import { defineHandler } from "../../../src/plainstack";

export const POST = defineHandler(async () => {
  return { message: "POST /" };
});

export default defineHandler(async () => {
  return <h1>GET /</h1>;
});
