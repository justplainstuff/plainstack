import { randomId } from "../id";

export type PersistedTask<T> = {
  data: T;
  id: string;
  name: string;
  created: number;
  failedLast: number | null;
  failedNr: number | null;
  failedError: string | null;
};

export function createPersistedTask<T>({
  data,
  name,
}: {
  data: T;
  name: string;
}): PersistedTask<T> {
  return {
    data,
    id: randomId("task"),
    name,
    created: Date.now(),
    failedLast: null,
    failedNr: null,
    failedError: null,
  };
}
