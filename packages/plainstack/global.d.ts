declare module "npm-run-all2" {
  export default function runAll(
    tasks: string[],
    options?: { parallel?: boolean },
  ): Promise<void>;
}
