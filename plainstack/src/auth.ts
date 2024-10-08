import type { Session } from "hono-sessions";
import { createMiddleware } from "hono/factory";

export function protect<User>({
  signin,
  getUser,
}: {
  signin: string;
  getUser: (id: string) => Promise<User | undefined>;
}) {
  return createMiddleware<{
    Variables: {
      user: User;
      session?: Session;
    };
  }>(async (c, next) => {
    const userId = c.get("session")?.get("user-id") as string | undefined;
    if (!userId) return c.redirect(signin);
    const user = await getUser(userId);
    if (!user) return c.redirect(signin);
    c.set("user", user);
    await next();
  });
}

export function signin<User>({
  getUser,
  protected: path,
}: {
  getUser: (id: string) => Promise<User | undefined>;
  protected: string;
}) {
  return createMiddleware<{
    Variables: {
      user: User;
      session?: Session;
    };
  }>(async (c, next) => {
    const userId = c.get("session")?.get("user-id") as string | undefined;
    const user = userId ? await getUser(userId) : undefined;
    if (user) return c.redirect("/protected");
    await next();
  });
}
