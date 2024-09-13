import type { KnipConfig } from "knip";

const config: KnipConfig = {
  ignoreBinaries: ["routes", "serve"],
  ignoreWorkspaces: ["packages/plainstudio"],
  ignoreDependencies: ["@biomejs/biome", "@vitest/coverage-v8"],
  workspaces: {
    "packages/website": {
      entry: [
        "plainstack.config.ts",
        "app/**/*.ts",
        "app/**/*.tsx",
        "database/**/*.ts",
        "assets/**/*.ts",
      ],
    },
    "packages/template": {
      entry: [
        "plainstack.config.ts",
        "app/**/*.ts",
        "app/**/*.tsx",
        "database/**/*.ts",
        "assets/**/*.ts",
      ],
    },
    "packages/plainstack": {
      entry: [
        "src/plainstack.ts",
        "test/**/*.ts",
        "test/**/*.tsx",
        "src/**/*.test.ts",
      ],
      ignoreBinaries: [
        "vitest",
        "esbuild",
        "kysely-codegen",
        "plainstack-dev",
        "plainstack-work",
      ],
    },
    "packages/plainstudio": {
      entry: ["bin/admin.ts", "src/admin/**/*.ts", "src/**/*.tsx"],
    },
    "create-plainweb": {
      entry: ["src/cli.ts"],
    },
  },
};

export default config;
