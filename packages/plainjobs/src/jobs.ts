export type JobStatus = "pending" | "processing" | "done" | "failed";

export type PersistedJob = {
  id: number;
  type: string;
  data: string;
  status: JobStatus;
  createdAt: number;
  nextRun?: number;
  failedAt?: number;
  error?: string;
};

export type ScheduledJobStatus = "idle" | "processing";

export type PersistedScheduledJob = {
  id: number;
  type: string;
  status: ScheduledJobStatus;
  createdAt: number;
  cronExpression: string;
  nextRun: number;
};

export type Job = {
  id: number;
  type: string;
  data: string;
};

export type Logger = {
  error(message: string, ...meta: unknown[]): void;
  warn(message: string, ...meta: unknown[]): void;
  info(message: string, ...meta: unknown[]): void;
  debug(message: string, ...meta: unknown[]): void;
};
