import {
  CookieStore,
  type Session,
  type Store,
  sessionMiddleware,
} from "hono-sessions";
import type { CookieOptions } from "hono/utils/cookie";
import { prod } from "../env";

interface SessionOptions {
  store?: Store | CookieStore;
  expireAfterSeconds?: number;
  cookieOptions?: CookieOptions;
  sessionCookieName?: string;
}

interface CookieStoreOptions {
  encryptionKey: string;
  cookieOptions?: CookieOptions;
  sessionCookieName?: string;
}

type Options = SessionOptions & CookieStoreOptions;

export function session(opts: Options) {
  if (!opts.encryptionKey && prod())
    throw new Error(
      "encryptionKey is required in production when using session()",
    );
  return sessionMiddleware({
    store: new CookieStore({
      ...opts,
      sessionCookieName: "session",
    }),
    ...opts,
  });
}

export interface SessionVariables {
  session: Session;
  session_key_rotation: boolean;
}

// TODO should be plainstack
declare module "hono" {
  interface ContextVariableMap extends SessionVariables {}
}
