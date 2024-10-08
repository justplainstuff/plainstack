import consola from "consola";
import type { ErrorHandler } from "hono";
import { html } from "hono/html";
import { prod } from "./env";

export function error(): ErrorHandler {
  return (err, c) => {
    consola.error(err);
    if (prod()) return c.text("Internal Server Error", 500);

    return c.html(
      html`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 {
              color: #e74c3c;
            }
            pre {
              background-color: #f8f8f8;
              border: 1px solid #ddd;
              border-radius: 4px;
              padding: 15px;
              overflow-x: auto;
            }
          </style>
        </head>
        <body>
          <p><strong>${err.message}</strong></p>
          <pre>${err.stack}</pre>
        </body>
      </html>
    `,
      500,
    );
  };
}
