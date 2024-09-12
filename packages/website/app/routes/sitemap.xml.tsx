import { getDocumentationPages } from "app/services/page";
import { defineHandler } from "plainstack";

export const GET = defineHandler(async ({ res }) => {
  const docPages = (await getDocumentationPages()).map(
    (page) => `/docs/${page.slug}`,
  );
  const pages = [...docPages, "/"];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((page) => `<url><loc>https://www.plainweb.dev${page}</loc></url>`)
  .join("")}
</urlset> 
`;
  return () => {
    res.set("Content-Type", "text/xml");
    res.send(xml);
  };
});
