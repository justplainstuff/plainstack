import { defineJob } from "../../../../../src/job";

export default defineJob({
  name: __filename,
  run: async () => {
    console.log("Hello from a job!");
  },
});
