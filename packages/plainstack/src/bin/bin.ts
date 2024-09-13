#!/usr/bin/env -S npx tsx

import { cwd } from "node:process";
import { registerAppLoader } from "../bootstrap/load";
import { runCommand } from "../command/command";

registerAppLoader();
void runCommand({ cwd: cwd() }).then(() => process.exit(0));
