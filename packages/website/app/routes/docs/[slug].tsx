import Html from "@kitajs/html";
import { FooterSection } from "app/components/footer-section";
import {
  ClockIcon,
  CloudUploadIcon,
  ContainerIcon,
  DatabaseIcon,
  FolderTreeIcon,
  LeafIcon,
  ListTodoIcon,
  LogsIcon,
  PhoneIncomingIcon,
  PizzaIcon,
  PlayIcon,
  RouteIcon,
  TestTubeDiagonalIcon,
} from "app/components/icons";
import Layout from "app/layouts/root";
import { getDocumentationPages, getHeadingId } from "app/services/page";
import { defineHandler, notFound } from "plainstack";

const pageIcons: Record<string, JSX.Element> = {
  motivation: LeafIcon(),
  "getting-started": PlayIcon(),
  "directory-structure": FolderTreeIcon(),
  routing: RouteIcon(),
  "request-handling": PhoneIncomingIcon(),
  database: DatabaseIcon(),
  "environment-variables": ContainerIcon(),
  testing: TestTubeDiagonalIcon(),
  "background-jobs": ListTodoIcon(),
  logging: LogsIcon(),
  deployment: CloudUploadIcon(),
  recipes: PizzaIcon(),
  schedules: ClockIcon(),
};

export const GET = defineHandler(async ({ req }) => {
  const pages = await getDocumentationPages();
  const currentPage = pages.find((page) => page.slug === req.params.slug);
  if (!currentPage) return notFound();
  const safeContent = currentPage.content;
  return (
    <Layout
      title={`${currentPage.title}`}
      hideDocs={true}
      head={
        <>
          <link
            rel="preconnect"
            href="https://Q5PJQGN2SF-dsn.algolia.net"
            crossorigin="true"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@docsearch/css@3"
          />
        </>
      }
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div class="flex flex-col lg:flex-row mt-4 mb-24">
          <div class="lg:w-1/4 lg:mr-8">
            <div class="lg:sticky lg:top-4 lg:self-start">
              <ul class="menu bg-base-200 w-full rounded-box mb-8 lg:mb-0">
                {pages.map((page) => {
                  const safeIcon = pageIcons[page.slug];
                  const safeTitle = Html.escapeHtml(page.title);
                  return page.slug === currentPage.slug ? (
                    <li>
                      {/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
                      <a>
                        <span>{safeIcon}</span>
                        {safeTitle}
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
                        preload
                        href={`/docs/${page.slug}`}
                        class={page.slug === currentPage.slug ? "active" : ""}
                      >
                        <span>{safeIcon}</span>
                        {safeTitle}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div class="lg:w-3/4">
            <div class="prose max-w-3xl">{safeContent}</div>
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
    </Layout>
  );
});
