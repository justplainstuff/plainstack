import http from "node:http";
import { type Database, database } from "app/config/database";
import { env } from "app/config/env";
import { contacts, sparks } from "app/schema";
import { listenWebsocket } from "app/services/confetti";
import { getDocumentationPages } from "app/services/page";
import { getApp, getLogger, getWorker, migrate, randomId } from "plainweb";
import config from "plainweb.config";
import WebSocket from "ws";

const log = getLogger("serve");

// TODO move somewhere else
async function seed(db: Database) {
  const now = Math.floor(Date.now() / 1000);

  const contactsData = Array.from({ length: 50 }, (_, i) => ({
    id: randomId(),
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

  log.info("seeding completed successfully");
}

async function serve() {
  // TODO do we want this maybe in template/plainweb?
  if (env.NODE_ENV === "development") {
    await migrate(config);
    await seed(database);
  }
  env.NODE_ENV === "production" && (await getDocumentationPages()); // warm up cache
  const app = await getApp(config);
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });
  listenWebsocket(wss);
  server.listen(config.http.port);
  const worker = getWorker(config);
  await worker.start();
  log.info(`⚡️ background workers & http://localhost:${config.http.port}`);
}

serve();
