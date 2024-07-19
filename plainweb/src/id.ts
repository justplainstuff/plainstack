import { createId } from "@paralleldrive/cuid2";

/** Return a random cuid2 id with an optional prefix.
 * @example
 * randomId("usr") // usr_1a2b3c4d
 * randomId() // 1a2b3c4d
 */
export function randomId(prefix?: string) {
  if (prefix) return `${prefix}_${createId()}`;
  return createId();
}
