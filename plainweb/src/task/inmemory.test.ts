import { beforeEach, describe, expect, it } from "vitest";
import { defineInmemoryTask, inmemoryTasks } from "./inmemory";
import {
  type PersistedTask,
  type Task,
  _runTasks,
  composeStartableTask,
  perform,
} from "./task";

async function processUntil(
  tasks: Task<unknown>[],
  {
    f,
    until = (i) => i.size === 0,
    debug = false,
  }: {
    f: () => Promise<void>;
    until?: (inmemoryTasks: Map<string, PersistedTask<unknown>>) => boolean;
    debug?: boolean;
  },
): Promise<void> {
  const runnableTasks = tasks.map((task, idx) =>
    composeStartableTask(task, `task-${idx}`, { debug: true }),
  );
  const timeouts = _runTasks(runnableTasks, { debug: true });
  await f();
  while (!until(inmemoryTasks)) {
    debug && console.log(inmemoryTasks);
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
  Object.values(timeouts).forEach((timeout) => clearInterval(timeout));
}

describe("inmemory task", () => {
  beforeEach(() => {
    inmemoryTasks.clear();
  });

  it("process task", async () => {
    let success = false;
    const task = defineInmemoryTask<{ doesItWork: boolean }>({
      process: async ({ data }) => {
        success = data.doesItWork;
      },
      pollIntervall: 1,
    });
    await processUntil([task], {
      async f() {
        await perform(task, { doesItWork: true });
      },
    });
    expect(success).toBe(true);
  });

  it("process 2 task instances", async () => {
    let total = 0;
    const task = defineInmemoryTask<{ add: number }>({
      process: async ({ data }) => {
        total = data.add + total;
      },
      pollIntervall: 1,
    });
    await processUntil([task], {
      async f() {
        await perform(task, { add: 3 });
        await perform(task, { add: 5 });
      },
    });
    expect(total).toBe(8);
  });

  it("process 2 task instances with different tasks", async () => {
    let total = 0;
    const task1 = defineInmemoryTask<{ add: number }>({
      process: async ({ data }) => {
        total = data.add + total;
      },
      pollIntervall: 1,
    });
    const task2 = defineInmemoryTask<{ add: number }>({
      process: async ({ data }) => {
        total = data.add + total;
      },
      pollIntervall: 1,
    });
    await processUntil([task1, task2], {
      async f() {
        await perform(task1, { add: 3 });
        await perform(task2, { add: 5 });
      },
    });
    expect(total).toBe(8);
  });

  it("process task with failure", async () => {
    let failure = false;
    const task = defineInmemoryTask<{ fail: boolean }>({
      process: async ({ data }) => {
        if (data.fail) {
          throw new Error("Task failed");
        }
      },
      failure: async () => {
        console.log("Task failed");
        failure = true;
      },
      pollIntervall: 1,
    });
    await processUntil([task], {
      until(store) {
        return Array.from(store.values()).some((task) => task.failedLast);
      },
      async f() {
        await perform(task, { fail: false });
        await perform(task, { fail: true });
      },
    });
    expect(failure).toBe(true);
  });

  it("process task with failure and retry", async () => {
    let tries = 0;
    const task = defineInmemoryTask({
      process: async () => {
        tries = tries + 1;
        if (tries == 6) return; // finally succeed
        throw new Error("Task failed");
      },
      batchSize: 1,
      pollIntervall: 1,
      retryIntervall: 1,
      maxRetries: 5,
    });
    await processUntil([task], {
      async f() {
        await perform(task);
      },
    });
    expect(tries).toBe(6);
  });

  it("process task with batch size 2", async () => {
    let total = 0;
    const task = defineInmemoryTask<{ add: number }>({
      process: async ({ data }) => {
        total = data.add + total;
      },
      pollIntervall: 1,
      batchSize: 5,
    });
    await processUntil([task], {
      async f() {
        await perform(task, { add: 3 });
        await perform(task, { add: 5 });
      },
    });
    expect(total).toBe(8);
  });
});
