import type { KnipConfig } from "knip";

const config: KnipConfig = {
  ignoreWorkspaces: ["packages/plainstudio"],
  ignoreDependencies: ["@vitest/coverage-v8"],
  workspaces: {
    "packges/create-plainstack": {
      entry: ["src/create-plainstack.ts"],
    },
    "packages/plainstack": {
      entry: [
        "src/plainstack.ts",
        "test/**/*.ts",
        "test/**/*.tsx",
        "src/**/*.test.ts",
      ],
      ignoreBinaries: ["plainstack-dev", "plainstack-work"],
    },
    "packages/plainstudio": {
      entry: ["bin/admin.ts", "src/admin/**/*.ts", "src/**/*.tsx"],
    },
  },
};

export default config;
