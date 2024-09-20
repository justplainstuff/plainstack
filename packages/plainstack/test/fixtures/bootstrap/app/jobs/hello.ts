import { defineJob } from "../../../../../src/job";

export default defineJob({
  name: import.meta.filename,
  run: async () => {
    console.log("Hello from a job!");
  },
});
