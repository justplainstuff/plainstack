#!/usr/bin/env -S npx tsx

import { cwd } from "node:process";
import { runCommand } from "./command";

void runCommand({ cwd: cwd() }).then(() => process.exit(0));
