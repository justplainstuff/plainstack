import env from "app/config/env";
import { defineConfig } from "plainstack";

export default defineConfig({
  nodeEnv: env.NODE_ENV,
  dbUrl: env.DB_URL,
  logger: {
    level: env.LOG_LEVEL,
  },
});

// TODO restore redirects
// export default defineConfig({
//   nodeEnv: env.NODE_ENV,
//   http: {
//     port: env.PORT,
//     redirects: {
//       "/docs/environmet-variables": "/docs/environment-variables",
//       "/docs": "/docs/getting-started",
//     },
//     staticPath: "/public",
//   },
//   logger: {
//     level: 5,
//   },
//   database: {
//     dbUrl: env.DB_URL,
//     schema: schema,
//     pragma: {
//       journal_mode: "WAL",
//     },
//   },
//   mail: {
//     default: {
//       host: env.SMTP_HOST,
//       port: 587,
//       secure: false,
//       auth: {
//         user: env.SMTP_USER,
//         pass: env.SMTP_PASS,
//       },
//     },
//   },
// });
