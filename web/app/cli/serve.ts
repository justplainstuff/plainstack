import http from "http";
import { type Database, migrate, runTasks, useTransporter } from "plainweb";
import WebSocket from "ws";
import { database } from "~/app/config/database";
import { debug, env } from "~/app/config/env";
import { app } from "~/app/config/http";
import { mail } from "~/app/config/mail";
import { contacts, sparks } from "~/app/config/schema";
import { listenWebsocket } from "~/app/services/confetti";
import { getDocumentationPages } from "~/app/services/page";

// TODO move somewhere else
async function seed(db: Database) {
  const now = Math.floor(Date.now() / 1000);

  const contactsData = Array.from({ length: 50 }, (_, i) => ({
    email: `user${i + 1}@example.com`,
    created: now - Math.floor(Math.random() * 30 * 24 * 60 * 60), // Random creation date within the last 30 days
    doubleOptInSent: Math.random() > 0.5 ? now : undefined,
    doubleOptInConfirmed: Math.random() > 0.3 ? now : undefined,
    doubleOptInToken: `token_${Math.random().toString(36).substring(2, 15)}`,
  }));

  await db.insert(contacts).values(contactsData).onConflictDoNothing();

  await db
    .insert(sparks)
    .values({
      nr: 1,
      last: now,
    })
    .onConflictDoNothing();

  console.log("seeding completed successfully.");
}

async function serve() {
  // TODO do we want this?
  if (env.NODE_ENV === "development") {
    await migrate(database);
    await seed(database);
  }
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
