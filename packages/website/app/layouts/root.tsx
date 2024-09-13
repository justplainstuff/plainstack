import type Html from "@kitajs/html";
import { DiscordIcon, GithubIcon, XIcon } from "app/components/icons";
import { asset } from "plainstack";

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
          <title>{props.title || "plainstack"}</title>
          <meta
            name="description"
            content={
              props.description ||
              "The all-in-one web framework obsessing about velocity 🏎️"
            }
          />
          <link rel="icon" type="image/x-icon" href={asset("favicon.ico")} />
          <link rel="stylesheet" href={asset("styles.css")} />
          <script defer src={asset("scripts.ts")} />
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
            data-domain="plainstack.dev"
            src="https://plausible.io/js/script.js"
          />
          {props.head ? <>{safeHead}</> : null}
        </head>
        <div class="navbar bg-base-100">
          <div class="flex-1">
            <a href="/" class="ml-3 mt-1">
              <img
                alt="a coffe stain of a mug as logo"
                src={asset("images/black-small.webp")}
                class="h-12 dark:hidden"
              />
              <img
                alt="a coffe stain of a mug as logo"
                src={asset("images/white-small.webp")}
                class="h-12 hidden dark:block"
              />
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
                    Documentation
                  </a>
                </li>
              )}
              <li>
                <a
                  aria-label="Check out the project on GitHub"
                  href="https://github.com/justplainstuff/plainstack"
                >
                  <GithubIcon />
                </a>
              </li>
              <li>
                <a
                  aria-label="join the discord"
                  href="https://discord.gg/SWfSDAuqyu"
                  class="link"
                >
                  <DiscordIcon />
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
