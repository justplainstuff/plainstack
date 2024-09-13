// #!/usr/bin/env -S pnpm dlx tsx

// import BetterSqlite3Database, { type Database } from "better-sqlite3";
// import { drizzle } from "drizzle-orm/better-sqlite3";
// import express from "express";
// import { log, unstable_admin } from "../src/plainstack";

// function migrate(connection: Database) {
//   const run = `
// DROP TABLE IF EXISTS users;
// DROP TABLE IF EXISTS orders;
// DROP TABLE IF EXISTS products;
// DROP TABLE IF EXISTS order_items;

// CREATE TABLE users (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     email TEXT UNIQUE NOT NULL,
//     name TEXT NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// CREATE TABLE orders (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     user_id INTEGER NOT NULL,
//     status TEXT NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// CREATE TABLE products (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     price DECIMAL(10, 2) NOT NULL,
//     description TEXT
// );

// CREATE TABLE order_items (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     order_id INTEGER NOT NULL,
//     product_id INTEGER NOT NULL,
//     quantity INTEGER NOT NULL,
//     unit_price DECIMAL(10, 2) NOT NULL,
//     subtotal DECIMAL(10, 2) NOT NULL,
//     discount DECIMAL(10, 2) DEFAULT 0,
//     tax DECIMAL(10, 2) DEFAULT 0,
//     total DECIMAL(10, 2) NOT NULL,
//     notes TEXT
// );`;
//   connection.exec(run);
// }

// function seed(connection: Database) {
//   const run = `
// INSERT INTO users (email, name) VALUES
//     ${Array(30)
//       .fill(0)
//       .map((_, i) => `('user${i + 1}@example.com', 'User ${i + 1}')`)
//       .join(",\n    ")};

// INSERT INTO products (name, price, description) VALUES
//     ${Array(25)
//       .fill(0)
//       .map(
//         (_, i) =>
//           `('Product ${i + 1}', ${(Math.random() * 100).toFixed(2)}, 'Description for Product ${i + 1} with a very long description that should be truncated')`,
//       )
//       .join(",\n    ")};

// INSERT INTO orders (user_id, status) VALUES
//     ${Array(35)
//       .fill(0)
//       .map(
//         () =>
//           `(${Math.floor(Math.random() * 30) + 1}, '${["pending", "completed", "shipped", "cancelled"][Math.floor(Math.random() * 4)]}')`,
//       )
//       .join(",\n    ")};

// INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, discount, tax, total, notes) VALUES
//     ${Array(40)
//       .fill(0)
//       .map(() => {
//         const quantity = Math.floor(Math.random() * 5) + 1;
//         const unitPrice = Number.parseFloat((Math.random() * 100).toFixed(2));
//         const subtotal = quantity * unitPrice;
//         const discount = Number.parseFloat((Math.random() * 10).toFixed(2));
//         const tax = Number.parseFloat((subtotal * 0.1).toFixed(2));
//         const total = subtotal - discount + tax;
//         return `(${Math.floor(Math.random() * 35) + 1}, ${Math.floor(Math.random() * 25) + 1}, ${quantity}, ${unitPrice}, ${subtotal}, ${discount}, ${tax}, ${total}, 'Note for item ${Math.floor(Math.random() * 1000)}')`;
//       })
//       .join(",\n    ")};
//   `;
//   connection.exec(run);
// }

// async function start() {
//   process.env.BIN_ADMIN_TESTING = "1";
//   log.info("Starting server...");
//   const connection = new BetterSqlite3Database(":memory:");
//   const database = drizzle(connection);
//   connection.pragma("journal_mode = WAL");
//   migrate(connection);
//   seed(connection);
//   const app = express();
//   app.use(express.urlencoded({ extended: true }));
//   app.use("/admin", await unstable_admin({ database, path: "/admin" }));
//   app.use("/public", express.static(`${process.cwd()}`));
//   app.listen(3000);
//   // printRoutes(app);
//   app.use("/", (req, res) => {
//     res.redirect("/admin/database");
//   });
//   log.info("http://localhost:3000/admin/database");
// }

// void start();
