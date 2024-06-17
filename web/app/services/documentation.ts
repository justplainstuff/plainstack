import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { Marked } from "marked";
import matter from "gray-matter";
import { env } from "~/app/config/env";

export type DocumentationPage = {
  title: string;
  slug: string;
  content: string;
};

let cache: DocumentationPage[] = [];

export async function getDocumentationPages(): Promise<DocumentationPage[]> {
  if (cache.length && env.NODE_ENV === "production") {
    console.log("Using cached documentation pages");
    return cache;
  }
  const { getHighlighter } = await import("shiki");
  const {
    transformerNotationDiff,
    transformerNotationHighlight,
    transformerNotationWordHighlight,
    transformerNotationFocus,
    transformerNotationErrorLevel,
    transformerMetaHighlight,
    transformerMetaWordHighlight,
  } = await import("@shikijs/transformers");
  const highlighter = await getHighlighter({
    langs: ["md", "typescript", "bash", "tsx", "json"],
    themes: ["dracula-soft"],
  });
  const markedShiki = (await import("marked-shiki")).default;

  const marked = new Marked().use(
    // @ts-ignore seems to work
    markedShiki({
      highlight(code, lang, props) {
        return highlighter.codeToHtml(code, {
          lang,
          theme: "dracula-soft",
          meta: { __raw: props.join(" ") },
          transformers: [
            transformerNotationDiff(),
            transformerNotationHighlight(),
            transformerNotationWordHighlight(),
            transformerNotationFocus(),
            transformerNotationErrorLevel(),
            transformerMetaHighlight(),
            transformerMetaWordHighlight(),
          ],
        });
      },
    })
  );

  const docsDirectory = join(process.cwd(), "documentation");
  const files = await readdir(docsDirectory);
  const mdFiles = files.filter((file) => file.endsWith(".md"));

  const pages: DocumentationPage[] = await Promise.all(
    mdFiles.map(async (file) => {
      const filePath = join(docsDirectory, file);
      const fileContent = await readFile(filePath, "utf-8");
      const { data, content } = matter(fileContent);
      const html = await marked.parse(content);

      const slug = file.replace(".md", "").split("_")[1]!;
      const title = data.title || slug;

      return {
        title,
        slug,
        content: html,
      } satisfies DocumentationPage;
    })
  );

  cache = pages;
  return pages;
}
