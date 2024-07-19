import { describe, test } from "vitest";
import { getLogger } from "./log";

describe("log", () => {
  test("getLogger", () => {
    getLogger("short").info("this is an information message");
    getLogger("longer label").info("this is an information message");
    const log = getLogger("test");
    log.verbose("this is super verbose");
    log.debug("this is a debug message");
    log.warn("last warning!");
    log.error("oh no, an error occurred!");
    log.error(new Error("oh no, an error occurred!"));
  });
});
