import { Handler, notFound } from "plainweb";
import Layout from "~/app/layout";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { marked } from "marked";
import matter from "gray-matter";

type DocumentationPage = {
  title: string;
  slug: string;
  content: string;
};

async function getDocumentationPages(): Promise<DocumentationPage[]> {
  const docsDirectory = join(process.cwd(), "documentation");
  const files = await readdir(docsDirectory);
  const mdFiles = files.filter((file) => file.endsWith(".md"));

  const pages: DocumentationPage[] = await Promise.all(
    mdFiles.map(async (file) => {
      const filePath = join(docsDirectory, file);
      const fileContent = await readFile(filePath, "utf-8");
      const { data, content } = matter(fileContent);
      const html = await marked(content);

      const slug = file.replace(".md", "").split("_")[1]!;
      const title = data.title || slug;

      return {
        title,
        slug,
        content: html,
      } satisfies DocumentationPage;
    })
  );

  return pages;
}

let pages: DocumentationPage[] = [];

export const GET: Handler = async ({ req }) => {
  if (!pages.length) {
    pages = await getDocumentationPages();
  }
  const currentPage = pages.find((page) => page.slug === req.params.slug);
  if (!currentPage) return notFound();
  return (
    <Layout>
      <div class="flex flex-row">
        <ul class="menu bg-base-200 w-56 rounded-box">
          {pages.map((page) => (
            <li>
              <a
                safe
                hx-boost="true"
                href={`/documentation/${page.slug}`}
                class={page.slug === currentPage.slug ? "active" : ""}
              >
                {page.title}
              </a>
            </li>
          ))}
        </ul>
        <div safe class="prose">
          {currentPage.content}
        </div>
      </div>
    </Layout>
  );
};
