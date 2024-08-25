import type Html from "@kitajs/html";
import { GithubIcon, XIcon } from "app/components/icons";

export default function Layout(
  props: Html.PropsWithChildren<{
    head?: string | Promise<string>;
    description?: string;
    title?: string;
    hideDocs?: boolean;
  }>,
) {
  const safeHead = props.head;
  return (
    <>
      {"<!doctype html>"}
      <html lang="en" data-theme="auto">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>{props.title || "plainweb"}</title>
          <meta
            name="description"
            content={
              props.description ||
              "All-in-one web framework using TypeScript and SQLite."
            }
          />
          <link rel="icon" type="image/x-icon" href="/public/favicon.ico" />
          <link rel="stylesheet" href="/public/output.css" />

          <script
            defer
            src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.0/dist/cdn.min.js"
          />
          <script defer src="https://unpkg.com/htmx.org@1.9.12" />
          <script
            defer
            src="https://unpkg.com/htmx.org@1.9.12/dist/ext/preload.js"
          />
          <script
            async
            defer
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          />
          <script
            defer
            data-domain="plainweb.dev"
            src="https://plausible.io/js/script.js"
          />
          {props.head ? <>{safeHead}</> : null}
        </head>
        <div class="navbar bg-base-100">
          <div class="flex-1">
            <a href="/" class="btn btn-ghost text-xl">
              plainweb
            </a>
          </div>
          <div class="flex-none">
            <div id="docsearch" />
            <ul class="menu menu-horizontal px-1">
              {props.hideDocs ? null : (
                <li>
                  <a
                    aria-label="Read the docs"
                    href="/docs/getting-started"
                    preload
                    class={"text-lg text-base-content"}
                  >
                    Docs
                  </a>
                </li>
              )}
              <li>
                <a
                  aria-label="Check out the project on GitHub"
                  href="https://github.com/joseferben/plainweb"
                >
                  <GithubIcon />
                </a>
              </li>
              <li>
                <a
                  aria-label="follow me on x/twitter"
                  href="https://x.com/joseferben"
                  class="link"
                >
                  <XIcon />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <body hx-ext="preload">{props.children}</body>
      </html>
    </>
  );
}
