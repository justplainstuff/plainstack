// import type { ExpandedPlainwebConfig } from "config";
// import { log } from "./task/task";
// import { workTasks } from "./task/work-tasks";

// /**
//  * Return a worker instance given a plainweb config.
//  * When a worker is started, it starts pulling tasks from the database and performing them.
//  * */
// export function getWorker(
//   config: Pick<
//     ExpandedPlainwebConfig<Record<string, unknown>>,
//     "database" | "paths" | "nodeEnv"
//   >,
// ) {
//   return {
//     /** Load all tasks and work them. This must be called before any tasks can be enqueued. */
//     start: () => {
//       log.verbose("start task worker");
//       return workTasks(config);
//     },
//   };
// }
