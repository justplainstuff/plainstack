# Recipes

Some recipes to make your life easier.

## sitemap.xml

```tsx
// routes/sitemap.xml.tsx
import { type Handler } from "plainweb";

export const GET: Handler = async ({ res }) => {
  const pages = ["/", "/about"];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((page) => `<url><loc>https://www.example.org${page}</loc></url>`)
  .join("")}
</urlset> 
`;
  return () => {
    res.set("Content-Type", "text/xml");
    res.send(xml);
  };
};
```

## robots.txt

```tsx
// routes/robots.txt.tsx
import { Handler } from "plainweb";

export const GET: Handler = async ({ res }) => {
  return () => {
    res.set("Content-Type", "text/plain");
    res.send("User-agent: *\nAllow: /");
  };
};
```
