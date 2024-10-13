import type { Session } from "hono-sessions";
import { createMiddleware } from "hono/factory";

export function protect<User>({
  signinPath,
  getUser,
}: {
  signinPath: string;
  getUser: (id: string) => Promise<User | undefined>;
}) {
  return createMiddleware<{
    Variables: {
      user: User;
      session?: Session;
    };
  }>(async (c, next) => {
    const userId = c.get("session")?.get("user-id") as string | undefined;
    if (!userId) return c.redirect(signinPath);
    const user = await getUser(userId);
    if (!user) return c.redirect(signinPath);
    c.set("user", user);
    await next();
  });
}

export function signin<User>({
  getUser,
  protectedPath,
}: {
  getUser: (id: string) => Promise<User | undefined>;
  protectedPath: string;
}) {
  return createMiddleware<{
    Variables: {
      user: User;
      session?: Session;
    };
  }>(async (c, next) => {
    const userId = c.get("session")?.get("user-id") as string | undefined;
    const user = userId ? await getUser(userId) : undefined;
    if (user) return c.redirect(protectedPath);
    await next();
  });
}
