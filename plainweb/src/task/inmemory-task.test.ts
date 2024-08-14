import { beforeEach, describe, expect, it } from "vitest";
import { getLogger } from "../log";
import { defineInmemoryTask, inmemoryTasks } from "./inmemory-task";
import type { PersistedTask } from "./persisted-task";
import type { Task } from "./task";
import { perform, workLoadedTasks } from "./work-tasks";

const log = getLogger("test");

async function processUntil(
  tasks: Task<unknown>[],
  {
    f,
    until = (i) => i.size === 0,
  }: {
    f: () => Promise<void>;
    until?: (inmemoryTasks: Map<string, PersistedTask<unknown>>) => boolean;
  },
): Promise<void> {
  const runnableTasks = tasks;
  const timeouts = workLoadedTasks(runnableTasks);
  await f();
  while (!until(inmemoryTasks)) {
    log.info(inmemoryTasks);
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
  for (const timeout of Object.values(timeouts)) {
    clearInterval(timeout);
  }
}

describe("inmemory task", () => {
  beforeEach(() => {
    inmemoryTasks.clear();
  });

  it("process task", async () => {
    let success = false;
    const task = defineInmemoryTask<{ doesItWork: boolean }>({
      name: "task",
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
      name: "task",
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
      name: "task1",
      process: async ({ data }) => {
        total = data.add + total;
      },
      pollIntervall: 1,
    });
    const task2 = defineInmemoryTask<{ add: number }>({
      name: "task2",
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
      name: "task",
      process: async ({ data }) => {
        if (data.fail) {
          throw new Error("Task failed");
        }
      },
      failure: async () => {
        log.info("Task failed");
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
      name: "task",
      process: async () => {
        tries = tries + 1;
        if (tries === 6) return; // finally succeed
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
      name: "task",
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
