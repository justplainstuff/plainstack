import { defineHandler } from "../../../../../src/plainstack";

export default defineHandler(async ({ req }) => {
  return <h1 safe>GET /path/{req.params.id}/level-3</h1>;
});
