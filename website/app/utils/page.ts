import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import MarkdownIt from "markdown-it";
import { bundledLanguages, getHighlighter } from "shiki";
import slugify from "slugify";
import { prod } from "plainstack";
import consola from "consola";

type Page = {
  title: string;
  slug: string;
  content: string;
  h1: string[];
  h2: string[];
  h3: string[];
};

const idPrefix = "page-";
let cache: Page[] = [];

export function getHeadingId(heading: string) {
  return idPrefix + slugify(heading, { lower: true });
}

let renderer: MarkdownIt;

export async function createMarkdownRenderer() {
  if (renderer) return renderer;

  const highlighter = await getHighlighter({
    themes: ["dracula-soft"],
    langs: Object.keys(bundledLanguages) as string[],
  });

  const md = new MarkdownIt({
    html: true,
    highlight: (code, lang) => {
      return highlighter.codeToHtml(code, { lang, theme: "dracula-soft" });
    },
  });

  const markdownItAnchor = (await import("markdown-it-anchor")).default;
  // Add any additional plugins or customizations here
  md.use(markdownItAnchor, {
    permalink: true,
    permalinkBefore: true,
    permalinkSymbol: "#",
    slugify: (s: string) => getHeadingId(s),
  });
  renderer = md;
  return renderer;
}

export async function renderPage(
  fileName: string,
  fileContent: string,
  md: MarkdownIt
): Promise<Page> {
  const html = md.render(fileContent);
  const slug = fileName.replace(".md", "").split("-").slice(1).join("-");

  const tokens = md.parse(fileContent, {});
  let title = "";
  const headings1: string[] = [];
  const headings2: string[] = [];
  const headings3: string[] = [];

  for (const token of tokens) {
    if (token.type === "heading_open") {
      const nextToken = tokens[tokens.indexOf(token) + 1];
      const headingText = nextToken?.content || "";
      switch (token.tag) {
        case "h1":
          if (!title) title = headingText;
          headings1.push(headingText);
          break;
        case "h2":
          headings2.push(headingText);
          break;
        case "h3":
          headings3.push(headingText);
          break;
      }
    }
  }

  // If no h1 was found, use the filename as the title
  if (!title) {
    title = fileName
      .replace(".md", "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return {
    title,
    slug,
    content: html,
    h1: headings1,
    h2: headings2,
    h3: headings3,
  } satisfies Page;
}

export async function getDocumentationPages(): Promise<Page[]> {
  if (cache.length && prod()) {
    consola.info("Using cached documentation pages");
    return cache;
  }
  const docsDirectory = join(process.cwd(), "documentation");
  const files = await readdir(docsDirectory);
  const mdFiles = files.filter((file) => file.endsWith(".md"));

  const sortedMdFiles = mdFiles.sort((a, b) => {
    const prefixA = Number.parseInt(a.split("-")[0] as string);
    const prefixB = Number.parseInt(b.split("-")[0] as string);
    return prefixA - prefixB;
  });
  const md = await createMarkdownRenderer();

  const pages: Page[] = await Promise.all(
    sortedMdFiles.map(async (file) => {
      const filePath = join(docsDirectory, file);
      const fileContent = await readFile(filePath, "utf-8");
      return await renderPage(file, fileContent, md);
    })
  );
  cache = pages;
  return pages;
}
