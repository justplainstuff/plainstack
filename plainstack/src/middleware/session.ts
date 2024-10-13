import "hono";
import {
  CookieStore,
  type Session,
  type Store,
  sessionMiddleware,
} from "hono-sessions";
import type { CookieOptions } from "hono/utils/cookie";
import { prod } from "../env";
import type { MiddlewareHandler } from "hono";

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

export function session(opts: Options): MiddlewareHandler {
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
  }) as unknown as MiddlewareHandler;
}

export interface SessionVariables {
  session: Session;
  session_key_rotation: boolean;
}

declare module "hono" {
  interface ContextVariableMap extends SessionVariables {}
}
