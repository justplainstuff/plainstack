import { describe, expect, test } from "bun:test";
import { bunSqlite } from "./bun";
import { rollback, store } from "./entity";

type Database = {
  users: {
    id: string;
    name: string;
    age: number | null;
    email: string;
    createdAt: number;
  };
  posts: {
    id: string;
    title: string;
    content: string;
    userId: string;
    createdAt: number;
  };
};

describe("entity crud operations", async () => {
  const { database, migrate } = bunSqlite<Database>();

  await migrate(
    ({ schema }) =>
      schema
        .createTable("users")
        .addColumn("id", "text", (col) => col.primaryKey())
        .addColumn("name", "text", (col) => col.notNull())
        .addColumn("email", "text", (col) => col.notNull().unique())
        .addColumn("age", "integer")
        .addColumn("created_at", "integer", (col) => col.notNull())
        .execute(),
    ({ schema }) =>
      schema
        .createTable("posts")
        .addColumn("id", "text", (col) => col.primaryKey())
        .addColumn("title", "text", (col) => col.notNull())
        .addColumn("content", "text", (col) => col.notNull())
        .addColumn("user_id", "text", (col) => col.notNull())
        .addColumn("created_at", "integer", (col) => col.notNull())
        .execute(),
  );

  const entities = await store(database, {
    users: {
      id: () => `usr_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: () => Date.now(),
    },
    posts: {
      id: () => `pst_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: () => Date.now(),
    },
  });

  test("create user", async () => {
    const userData = {
      name: "Jane Smith",
      email: "jane@example.com",
    };

    const result = await rollback(entities, (entities) =>
      entities("users").create(userData),
    );

    expect(result.name).toBe("Jane Smith");
    expect(result.email).toBe("jane@example.com");
    expect(result.id).toMatch(/^usr_/);
    expect(result.createdAt).toBeGreaterThan(0);
  });

  test("read all users", async () => {
    await rollback(entities, async (entities) => {
      await entities("users").create({
        name: "John Doe",
        email: "john@example.com",
      });

      await entities("users").create({
        name: "Jane Doe",
        email: "jane@example.com",
      });

      const users = await entities("users").all();
      expect(users.length).toBe(2);
      expect(users[0]?.name).toBe("John Doe");
      expect(users[1]?.name).toBe("Jane Doe");
    });
  });

  test("read users with filters and pagination", async () => {
    await rollback(entities, async (entities) => {
      await entities("users").create({
        name: "John Doe",
        email: "john@example.com",
        age: 30,
      });
      await entities("users").create({
        name: "Jane Doe",
        email: "jane@example.com",
        age: 25,
      });
      await entities("users").create({
        name: "Alice Smith",
        email: "alice@example.com",
        age: 30,
      });
      await entities("users").create({
        name: "Bob Smith",
        email: "bob@example.com",
        age: 80,
      });

      const bob = await entities("users").all({ name: "Bob Smith" });
      expect(bob.length).toBe(1);
      expect(bob[0]?.name).toBe("Bob Smith");

      const thirties = await entities("users").all({ age: 30 });
      expect(thirties.length).toBe(2);
      expect(thirties[0]?.name).toBe("John Doe");
      expect(thirties[1]?.name).toBe("Alice Smith");

      const paginatedUsers = await entities("users").all(
        {},
        { limit: 2, offset: 1 },
      );
      expect(paginatedUsers.length).toBe(2);
      expect(paginatedUsers[0]?.name).toBe("Jane Doe");
      expect(paginatedUsers[1]?.name).toBe("Alice Smith");

      const filteredAndPaginated = await entities("users").all(
        { name: "Jane Doe" },
        { limit: 1, offset: 0 },
      );
      expect(filteredAndPaginated.length).toBe(1);
      expect(filteredAndPaginated[0]?.name).toBe("Jane Doe");
    });
  });

  test("delete user", async () => {
    await rollback(entities, async (entities) => {
      const createResult = await entities("users").create({
        name: "John Doe",
        email: "john@example.com",
      });
      const userId = createResult.id;
      await entities("users").delete(userId);
      const users = await entities("users").all();
      expect(users.length).toBe(0);
    });
  });

  test("create post", async () => {
    await rollback(entities, async (entities) => {
      const userResult = await entities("users").create({
        name: "John Doe",
        email: "john@example.com",
      });
      const result = await entities("posts").create({
        title: "Test Post",
        content: "This is a test post.",
        userId: userResult.id,
      });
      expect(result.title).toBe("Test Post");
      expect(result.content).toBe("This is a test post.");
      expect(result.userId).toBe(userResult.id);
      expect(result.id).toMatch(/^pst_/);
    });
  });

  test("read all posts", async () => {
    await rollback(entities, async (entities) => {
      const userResult = await entities("users").create({
        name: "John Doe",
        email: "john@example.com",
      });
      await entities("posts").create({
        title: "Post 1",
        content: "Content 1",
        userId: userResult.id,
      });

      await entities("posts").create({
        title: "Post 2",
        content: "Content 2",
        userId: userResult.id,
      });

      const posts = await entities("posts").all();
      expect(posts.length).toBe(2);
      expect(posts[0]?.title).toBe("Post 1");
      expect(posts[1]?.title).toBe("Post 2");
    });
  });

  test("update user", async () => {
    await rollback(entities, async (entities) => {
      const createResult = await entities("users").create({
        name: "John Doe",
        email: "john@example.com",
      });
      const userId = createResult.id;

      const updateResult = await entities("users").update(userId, {
        name: "John Updated",
        email: "john.updated@example.com",
      });

      expect(updateResult.id).toBe(userId);
      expect(updateResult.name).toBe("John Updated");
      expect(updateResult.email).toBe("john.updated@example.com");

      // Verify the update by fetching the user
      const updatedUser = await entities("users").get(userId);
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe("John Updated");
      expect(updatedUser?.email).toBe("john.updated@example.com");
    });
  });

  test("rollback state on exception", async () => {
    try {
      await rollback(entities, async (trx) => {
        await trx("users").create({
          name: "John Doe",
          email: "john@example.com",
        });
        throw new Error("Simulated Error");
      });
    } catch (err) {
      expect(err).toEqual(new Error("Simulated Error"));
    }

    const users = await entities("users").all();
    expect(users.length).toBe(0); // Ensure user creation was rolled back
  });

  test("rollback state without exception", async () => {
    await rollback(entities, async (trx) => {
      await trx("users").create({
        name: "John Doe",
        email: "john@example.com",
      });
    });

    const users = await entities("users").all();
    expect(users.length).toBe(0); // Ensure rollback function rolls back changes
  });
});
