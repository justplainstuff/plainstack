import { describe, expect, test } from "bun:test";
import type { Generated } from "kysely";
import type { NumericParser } from "kysely-codegen";
import { sqlite } from "./bun";
import { rollback, store } from "./entity";

interface Users {
  id: string;
  name: string;
  email: string;
  age: number | null;
  isStaff: Generated<number>;
  createdAt: number;
  updatedAt: number;
}

interface Posts {
  id: string;
  title: string;
  content: string;
  userId: string;
  image: string | null;
  createdAt: number;
  updatedAt: number;
}

interface Database {
  users: Users;
  posts: Posts;
}

describe("entity", async () => {
  const { database, migrate } = sqlite<Database>();

  await migrate(
    ({ schema }) =>
      schema
        .createTable("users")
        .addColumn("id", "text", (col) => col.primaryKey())
        .addColumn("name", "text", (col) => col.notNull())
        .addColumn("email", "text", (col) => col.notNull().unique())
        .addColumn("age", "integer")
        .addColumn("is_staff", "boolean")
        .addColumn("created_at", "integer", (col) => col.notNull())
        .addColumn("updated_at", "integer", (col) => col.notNull())
        .execute(),
    ({ schema }) =>
      schema
        .createTable("posts")
        .addColumn("id", "text", (col) => col.primaryKey())
        .addColumn("title", "text", (col) => col.notNull())
        .addColumn("content", "text", (col) => col.notNull())
        .addColumn("user_id", "text", (col) => col.notNull())
        .addColumn("image", "blob")
        .addColumn("created_at", "integer", (col) => col.notNull())
        .execute(),
  );

  const entities = await store(database, {
    users: {
      id: () => `usr_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: () => Date.now(),
    },
    posts: {
      id: () => `pst_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: () => Date.now(),
    },
  });

  test("create user minimal data", async () => {
    const result = await rollback(entities, (entities) =>
      entities("users").create({
        name: "Jane Smith",
        email: "jane@example.com",
        isStaff: 1,
        age: null,
      }),
    );

    expect(result.name).toBe("Jane Smith");
    expect(result.email).toBe("jane@example.com");
    expect(result.isStaff).toBe(1);
    expect(result.id).toMatch(/^usr_/);
    expect(result.createdAt).toBeGreaterThan(0);
  });

  test("create user with all data", async () => {
    const result = await rollback(entities, (entities) =>
      entities("users").create({
        name: "Jane Smith",
        email: "jane@example.com",
        age: 88,
        id: "usr_123",
        createdAt: 123,
      }),
    );

    expect(result.name).toBe("Jane Smith");
    expect(result.email).toBe("jane@example.com");
    expect(result.id).toMatch(/^usr_/);
    expect(result.age).toEqual(88);
    expect(result.createdAt).toEqual(123);
    expect(result.id).toEqual("usr_123");
  });

  test("create multiple users", async () => {
    const result = await rollback(entities, (entities) =>
      entities("users").createMany([
        {
          name: "John Doe",
          email: "john@example.com",
          age: 33,
          createdAt: Date.now(),
        },
        {
          name: "Jane Doe",
          email: "jane@example.com",
          age: 44,
          createdAt: Date.now(),
        },
      ]),
    );

    expect(result.length).toBe(2);
    expect(result[0]?.name).toBe("John Doe");
    expect(result[1]?.name).toBe("Jane Doe");
  });

  test("read all users", async () => {
    await rollback(entities, async (entities) => {
      await entities("users").create({
        name: "John Doe",
        email: "john@example.com",
        age: 33,
        createdAt: Date.now(),
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

  test("get user by id", async () => {
    await rollback(entities, async (entities) => {
      const createResult = await entities("users").create({
        name: "John Doe",
        email: "john@example.com",
      });
      const userId = createResult.id;
      const user = await entities("users").get({ id: userId });
      expect(user?.name).toBe("John Doe");
    });
  });

  test("get user by name and age", async () => {
    await rollback(entities, async (entities) => {
      await entities("users").create({
        name: "John Doe",
        email: "john@example.com",
        age: 33,
      });
      const user = await entities("users").get({ name: "John Doe", age: 33 });
      expect(user?.name).toBe("John Doe");
    });
  });

  test("delete user", async () => {
    await rollback(entities, async (entities) => {
      const createResult = await entities("users").create({
        name: "John Doe",
        email: "john@example.com",
      });
      const userId = createResult.id;
      await entities("users").delete({ id: userId });
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
        age: 33,
      });
      const userId = createResult.id;

      expect(createResult.age).toBe(33);

      await new Promise((res) => setTimeout(res, 10)); // bun is too fast
      const updateResult = await entities("users").update({
        id: createResult.id,
        name: "John Updated",
        email: "john.updated@example.com",
        isStaff: 0,
        age: null,
      });

      expect(updateResult.id).toBe(userId);
      expect(updateResult.name).toBe("John Updated");
      expect(updateResult.email).toBe("john.updated@example.com");
      expect(updateResult.updatedAt).toBeGreaterThan(createResult.updatedAt);
      expect(updateResult.age).toBeNull();

      const updatedUser = await entities("users").get({ id: userId });
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe("John Updated");
      expect(updatedUser?.email).toBe("john.updated@example.com");
      expect(updatedUser?.age).toBeNull();
    });
  });

  test("update many users", async () => {
    await rollback(entities, async (entities) => {
      const createResult = await entities("users").createMany([
        {
          name: "John Doe",
          email: "john@example.com",
          age: 33,
        },
        {
          name: "Jane Doe",
          email: "jane@example.com",
          age: 44,
        },
      ]);
      const first = createResult[0];
      const second = createResult[1];
      if (!first || !second) throw new Error("Failed to create users");

      expect(createResult.length).toBe(2);
      expect(first.age).toBe(33);
      expect(second.age).toBe(44);

      await new Promise((res) => setTimeout(res, 10)); // bun is too fast
      const updateResult = await entities("users").updateMany([
        {
          id: first.id,
          name: "John Updated",
          email: "john.updated@example.com",
          age: null,
        },
        {
          id: second.id,
          name: "Jane Updated",
          email: "jane.updated@example.com",
          age: null,
        },
      ]);

      const updateFirst = updateResult[0];
      const updateSecond = updateResult[1];
      if (!updateFirst || !updateSecond)
        throw new Error("Failed to create users");

      expect(updateResult.length).toBe(2);
      expect(updateFirst.name).toBe("John Updated");
      expect(updateFirst.email).toBe("john.updated@example.com");
      expect(updateFirst.updatedAt).toBeGreaterThan(first.updatedAt);
      expect(updateFirst.age).toBeNull();
      expect(updateSecond.name).toBe("Jane Updated");
      expect(updateSecond.email).toBe("jane.updated@example.com");
      expect(updateSecond.updatedAt).toBeGreaterThan(second.updatedAt);
      expect(updateSecond.age).toBeNull();

      const updatedUsers = await entities("users").all();
      expect(updatedUsers.length).toBe(2);
      expect(updatedUsers[0]?.name).toBe("John Updated");
      expect(updatedUsers[1]?.name).toBe("Jane Updated");
    });
  });

  test("delete user", async () => {
    await rollback(entities, async (entities) => {
      const createResult = await entities("users").create({
        name: "John Doe",
        email: "john@example.com",
      });
      const userId = createResult.id;
      await entities("users").delete({ id: userId });
      const users = await entities("users").all();
      expect(users.length).toBe(0);
    });
  });

  test("delete multiple users", async () => {
    await rollback(entities, async (entities) => {
      await entities("users").create({
        name: "John Doe",
        email: "john@example.com",
      });
      await entities("users").create({
        name: "Jane Doe",
        email: "jane@example.com",
      });
      await entities("users").delete({ name: "John Doe" });
      const users = await entities("users").all();
      expect(users.length).toBe(1);
      expect(users[0]?.name).toBe("Jane Doe");
    });
  });

  test("complex query with joins", async () => {
    await rollback(entities, async (entities) => {
      await entities("users").createMany([
        {
          id: "usr_1",
          name: "John Doe",
          email: "john@example.com",
          age: 33,
        },
        {
          id: "usr_2",
          name: "Jane Doe",
          email: "jane@example.com",
          age: 44,
        },
      ]);
      await entities("posts").createMany([
        {
          title: "Post 1",
          content: "Content 1",
          userId: "usr_1",
          image: null,
        },
        {
          title: "Post 2",
          content: "Content 2",
          userId: "usr_2",
          image: null,
        },
      ]);
      const result = await entities("users")
        .query()
        .leftJoin("posts", "posts.userId", "users.id")
        .select(["posts.title", "users.name"])
        .execute();
      expect(result.length).toBe(2);
      expect(result[0]?.name).toBe("John Doe");
      expect(result[1]?.name).toBe("Jane Doe");
      expect(result[0]?.title).toBe("Post 1");
      expect(result[1]?.title).toBe("Post 2");
    });
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
});
