import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import { DiscordIcon, GithubIcon, pageIcons } from "./components/icons";
import { HeroSection } from "./components/hero-section";
import { features, FullstackSection } from "./components/fullstack-section";
import { SignupSection } from "./components/signup-section";
import { FooterSection } from "./components/footer-section";
import { getDocumentationPages, getHeadingId } from "app/utils/page";
import { raw } from "hono/html";
import consola from "consola";
import { prod } from "plainstack";
import { render } from "plainstack/client";
import { build } from "plainstack/bun";
import { FullstackSectionContent } from "app/client/fullstack-section-content";
import { createMiddleware } from "hono/factory";

declare module "hono" {
  interface ContextRenderer {
    // biome-ignore lint/style/useShorthandFunctionType: <explanation>
    (
      content: string | Promise<string>,
      props?: {
        title?: string;
        head?: string | Promise<string>;
        hideDocs?: boolean;
      }
    ): Response;
  }
}

if (prod()) {
  consola.info("Loading documentation pages into cache");
  await getDocumentationPages();
}

const app = new Hono();

await build({ entrypoints: "app/client", outdir: "static" });

app.use(logger());
app.use(
  createMiddleware(async (c, next) => {
    const url = new URL(c.req.url);
    if (url.host === "plainweb.dev" || url.host === "www.plainweb.dev") {
      return c.redirect(
        `https://www.plainstack.dev${url.pathname}${url.search}`,
        301
      );
    }
    await next();
  })
);
app.use("/static/*", serveStatic({ root: "./" }));

// layout
app.get(
  "*",
  jsxRenderer(({ children, title, head, hideDocs }) => {
    return (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="color-scheme" content="light dark" />
          <title>{title || "Simple Fullstack Web Apps"}</title>
          <link rel="icon" type="image/x-icon" href="/static/favicon.ico" />
          <link rel="stylesheet" href="/static/styles.css" />
          <script src="https://unpkg.com/htmx.org@2.0.3" />
          <script src="https://unpkg.com/htmx-ext-preload@2.0.1/preload.js" />
          {head ? head : null}
        </head>
        <body hx-ext="preload">
          <div class="navbar bg-base-100">
            <div class="flex-1">
              <a href="/" class="ml-3 mt-1">
                <img
                  alt="a coffe stain of a mug as logo"
                  src="/static/images/black-small.webp"
                  class="h-12 dark:hidden"
                />
                <img
                  alt="a coffe stain of a mug as logo"
                  src="/static/images/white-small.webp"
                  class="h-12 hidden dark:block"
                />
              </a>
            </div>
            <div class="flex-none">
              <div id="docsearch" />
              <ul class="menu menu-horizontal px-1">
                {hideDocs ? null : (
                  <li>
                    <a
                      aria-label="Read the docs"
                      href="/docs/getting-started"
                      preload="mouseover"
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
          {children}
        </body>
      </html>
    );
  })
);

app.get("/", async (c) => {
  c.header("Cache-Control", "public, max-age=60");
  return c.render(
    <>
      <HeroSection />
      <FullstackSection />
      <SignupSection />
      <FooterSection />
      {render(FullstackSectionContent, { path: "/static" }, { features })}
    </>,
    {
      head: <link rel="canonical" href="https://www.plainstack.dev" />,
    }
  );
});

app.get("/docs/:slug", async (c) => {
  const pages = await getDocumentationPages();
  const currentPage = pages.find((page) => page.slug === c.req.param("slug"));
  if (!currentPage) return c.notFound();
  c.header("Cache-Control", "public, max-age=60");
  return c.render(
    <>
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div class="flex flex-col lg:flex-row mt-4 mb-24">
          <div class="lg:w-1/4 lg:mr-8">
            <div class="lg:sticky lg:top-4 lg:self-start">
              <ul class="menu bg-base-200 w-full rounded-box mb-8 lg:mb-0">
                {pages.map((page) => {
                  return page.slug === currentPage.slug ? (
                    <li>
                      {/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
                      <a>
                        <span>{pageIcons[page.slug]}</span>
                        {page.title}
                      </a>
                      <ul>
                        {page.h2.map((h2) => (
                          <li>
                            <a
                              href={`/docs/${page.slug}#${getHeadingId(h2)}`}
                              safe
                            >
                              {h2}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ) : (
                    <li>
                      <a
                        preload="mouseover"
                        href={`/docs/${page.slug}`}
                        class={page.slug === currentPage.slug ? "active" : ""}
                      >
                        <span>{pageIcons[page.slug]}</span>
                        {page.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div class="lg:w-3/4">
            <div class="prose max-w-3xl">{raw(currentPage.content)}</div>
          </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/@docsearch/js@3" />
        <div
          x-init={`
  docsearch({
    appId: "Q5PJQGN2SF", 
    apiKey: "1154296380e5fd2060e8d210efa1e770",
    indexName: "plainweb",
    container: '#docsearch',
    debug: true
  });`}
        />
      </div>
      <FooterSection />
    </>,
    {
      head: (
        <>
          <link
            rel="preconnect"
            href="https://Q5PJQGN2SF-dsn.algolia.net"
            crossorigin="anonymous"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@docsearch/css@3"
          />
        </>
      ),
    }
  );
});

app.get("/robots.txt", (c) => {
  c.header("Content-Type", "text/plain");
  return c.text("User-agent: *\nAllow: /");
});

// TODO sitemap

export default app;
