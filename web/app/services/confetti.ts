import { database } from "app/config/database";
import { sparks } from "app/config/schema";
import WebSocket from "ws";

interface ConfettiTrigger {
  id: string;
  timestamp: number;
}

interface UserRateLimit {
  lastTrigger: number;
  triggerCount: number;
}

const recentConfettiTriggers: ConfettiTrigger[] = [];
let totalJoys = 0;
const userRateLimits = new Map<string, UserRateLimit>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_TRIGGERS_PER_WINDOW = 60;
const RECENT_TRIGGER_WINDOW = 2000; // 2 seconds

async function initializeTotalJoys() {
  const found = await database.query.sparks.findFirst();
  totalJoys = found?.nr ?? 0;
}

async function broadcastConfettiTrigger(
  wss: WebSocket.Server,
  triggerId: string,
) {
  totalJoys++;
  await updateSparks();
  const message = JSON.stringify({
    type: "confetti",
    id: triggerId,
    totalJoys,
  });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const userLimit = userRateLimits.get(userId) || {
    lastTrigger: 0,
    triggerCount: 0,
  };

  if (now - userLimit.lastTrigger > RATE_LIMIT_WINDOW) {
    userLimit.triggerCount = 1;
    userLimit.lastTrigger = now;
  } else if (userLimit.triggerCount >= MAX_TRIGGERS_PER_WINDOW) {
    return true;
  } else {
    userLimit.triggerCount++;
  }

  userRateLimits.set(userId, userLimit);
  return false;
}

async function updateSparks() {
  const found = await database.query.sparks.findFirst();
  if (!found) {
    await database.insert(sparks).values({ nr: totalJoys, last: Date.now() });
  } else {
    await database.update(sparks).set({ nr: totalJoys, last: Date.now() });
  }
}

export async function getNrOfSparks() {
  const found = await database.query.sparks.findFirst();
  return found?.nr ?? 0;
}

export async function listenWebsocket(wss: WebSocket.Server) {
  await initializeTotalJoys();
  console.log("Listening for websocket connections");
  wss.on("connection", (ws: WebSocket) => {
    console.log("New websocket connection");
    const id = Math.random().toString(36).substr(2, 9);

    // Send user ID to the client
    ws.send(JSON.stringify({ type: "userId", id }));

    // Send recent confetti triggers and total joys to the new connection
    const now = Date.now();
    const recentTriggers = recentConfettiTriggers.filter(
      (trigger) => now - trigger.timestamp < RECENT_TRIGGER_WINDOW,
    );
    const initialData = JSON.stringify({
      type: "initialData",
      triggers: recentTriggers,
      totalJoys,
    });
    ws.send(initialData);

    ws.on("message", async (message: string) => {
      const data = JSON.parse(message);
      console.log("Received websocket data", data);
      if (data.type === "confetti") {
        if (isRateLimited(id)) {
          ws.send(
            JSON.stringify({
              type: "error",
              message:
                "Rate limit exceeded. Please wait before triggering confetti again.",
            }),
          );
          return;
        }
        const trigger: ConfettiTrigger = { id, timestamp: Date.now() };
        recentConfettiTriggers.push(trigger);
        if (recentConfettiTriggers.length > 10) {
          recentConfettiTriggers.shift(); // Keep only the 10 most recent triggers
        }
        await broadcastConfettiTrigger(wss, id);
      }
    });

    ws.on("close", () => {
      console.log("Websocket connection closed");
      userRateLimits.delete(id); // Clean up rate limit data when connection closes
    });
  });
}
