import { _runTasks, composeStartableTask } from "./task";

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// describe.skip("transient task", () => {
//   test("process simple task succeeds", async () => {
//     let result = 0;
//     const task = defineTransientTask<number, number>({
//       fetch: async () => 1,
//       process: async ({ data }) => data,
//       success: async ({ processed }) => {
//         result = processed;
//       },
//       failure: async () => {
//         result = -1; // this should not happen
//       },
//       cleanup: async () => {
//         clearTimeout(simple);
//       },
//       pollIntervall: 1,
//     });
//     const runnableTask = composeStartableTask(task, "simple", { debug: true });
//     const { simple } = _runTasks([runnableTask], { debug: true });
//     await new Promise((resolve) => setTimeout(resolve, 5));
//     await sleep(5);
//     assert.equal(result, 1);
//   });

//   test("process simple task fails", async () => {
//     let error: unknown = undefined;
//     const task = defineTransientTask<number, number>({
//       fetch: async () => {
//         return [1];
//       },
//       process: async () => {
//         throw new Error("Error processing task");
//       },
//       success: async () => {},
//       failure: async ({ err }) => {
//         error = err;
//         clearTimeout(simple);
//       },
//       pollIntervall: 1,
//     });
//     const runnableTask = composeStartableTask(task, "simple", { debug: true });
//     const { simple } = _runTasks([runnableTask], { debug: true });
//     await sleep(5);
//     clearTimeout(simple);
//     assert.equal(
//       error instanceof Error,
//       true,
//       "error should be an instance of Error"
//     );
//     assert.equal((error as unknown as Error).message, "Error processing task");
//   });

//   test.skip("process simple task times out", async () => {
//     // TODO implement
//   });
// });
