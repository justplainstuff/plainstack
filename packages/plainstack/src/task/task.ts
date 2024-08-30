import { getLogger } from "log";

export const log = getLogger("tasks");

export type ErrorHandler = ({ err }: { err: unknown }) => Promise<void>;

export type Task<T> = {
  name: string;
  start(opts?: {
    error?: ErrorHandler;
  }): NodeJS.Timeout;
  perform(data: T): Promise<void>;
};

export function isTask(task: unknown): task is Task<unknown> {
  return (
    typeof task === "object" &&
    task !== null &&
    "perform" in task &&
    "start" in task &&
    typeof task.start === "function" &&
    typeof task.perform === "function"
  );
}
