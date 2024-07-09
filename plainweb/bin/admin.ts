#!/usr/bin/env -S pnpm dlx tsx

import express from "express";
import BetterSqlite3Database, { Database } from "better-sqlite3";
import { printRoutes, unstable_admin } from "../src";
import { drizzle } from "drizzle-orm/better-sqlite3";

function migrateAndSeed(connection: Database) {
  const run = `
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS order_items;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT
);

CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
);

INSERT INTO users (email, name) VALUES
    ('john@example.com', 'John Doe'),
    ('jane@example.com', 'Jane Smith'),
    ('alice@example.com', 'Alice Johnson');

INSERT INTO products (name, price, description) VALUES
    ('Product 1', 9.99, 'Description for Product 1'),
    ('Product 2', 19.99, 'Description for Product 2'),
    ('Product 3', 14.99, 'Description for Product 3'),
    ('Product 4', 24.99, 'Description for Product 4');

INSERT INTO orders (user_id, status) VALUES
    (1, 'pending'),
    (1, 'completed'),
    (2, 'pending'),
    (3, 'completed');

INSERT INTO order_items (order_id, product_id, quantity) VALUES
    (1, 1, 2),
    (1, 2, 1),
    (2, 3, 3),
    (3, 2, 1),
    (3, 4, 2),
    (4, 1, 1),
    (4, 3, 2);
    `;
  connection.exec(run);
}

async function start() {
  console.log("Starting server...");
  const connection = new BetterSqlite3Database(":memory:");
  const database = drizzle(connection);
  connection.pragma("journal_mode = WAL");
  migrateAndSeed(connection);
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use("/admin", await unstable_admin(database));
  app.listen(3000);
  printRoutes(app);
  console.log("http://localhost:3000/admin/database");
}

void start();
