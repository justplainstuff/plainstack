// Adapted from https://github.com/withastro/cli-kit
// MIT License Copyright (c) 2022 Nate Moore
// Adapted from https://github.com/remix-run/remix/blob/main/packages/create-remix/copy-template.ts
// MIT License Copyright (c) Remix Software Inc. 2020-2021 Copyright (c) Shopify Inc. 2022-2024
import process from "node:process";
import ora from "ora";

import { sleep, color } from "./utils";

export async function renderLoadingIndicator({
  start,
  end,
  while: update = () => sleep(100),
  stdin = process.stdin,
  stdout = process.stdout,
}: {
  start: string;
  end: string;
  while: (...args: any) => Promise<any>;
  noMotion?: boolean;
  stdin?: NodeJS.ReadStream & { fd: 0 };
  stdout?: NodeJS.WriteStream & { fd: 1 };
}) {
  let act = update();
  let tooSlow = Object.create(null);
  let result = await Promise.race([sleep(500).then(() => tooSlow), act]);
  if (result === tooSlow) {
    const spinner = ora({
      text: start,
      spinner: "dots",
      stream: stdin,
    }).start();
    await act;
    spinner.stop();
  }
  stdout.write(`${" ".repeat(5)} ${color.green("✔")}  ${color.green(end)}\n`);
}
