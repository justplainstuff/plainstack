import { runTasks, useTransporter } from "plainweb";
import { debug, env } from "~/app/config/env";
import { app } from "~/app/config/http";
import { mail } from "~/app/config/mail";
import { listenWebsocket } from "~/app/services/confetti";
import http from "http";
import { getDocumentationPages } from "~/app/services/page";
import WebSocket from "ws";

async function serve() {
  useTransporter(mail);
  await runTasks("app/tasks", { debug: true });
  env.NODE_ENV === "production" && (await getDocumentationPages()); // warm up cache
  const expressApp = await app();
  const server = http.createServer(expressApp);
  const wss = new WebSocket.Server({ server });
  listenWebsocket(wss);
  server.listen(env.PORT);
  debug && console.log(`⚡️ http://localhost:${env.PORT}`);
}

serve();
