import type { KnipConfig } from "knip";

const config: KnipConfig = {
  ignoreBinaries: ["routes"],
  workspaces: {
    web: {
      entry: ["app/cli/**/*.ts", "app/routes/**/*.tsx", "public/**/*.js"],
      ignoreBinaries: ["fly"],
    },
    template: {
      entry: ["app/cli/**/*.ts", "app/routes/**/*.tsx", "public/**/*.js"],
    },
    plainweb: {
      entry: ["src/index.ts", "bin/**/*.ts"],
      ignoreDependencies: ["@vitest/coverage-v8", "dotenv", "zod"],
    },
    "create-plainweb": {
      entry: ["src/cli.ts"],
    },
  },
};

export default config;
