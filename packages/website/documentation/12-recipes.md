# Recipes

This section provides practical recipes to implement common features in your plainstack application. These snippets are designed to be easy to understand and integrate into your project.

## SEO and Crawling

### sitemap.xml

A sitemap helps search engines understand the structure of your site. Here's how to generate a simple `sitemap.xml`:

```tsx
// routes/sitemap.xml.tsx
import { defineHandler } from "plainstack";

export const GET = defineHandler(async ({ res }) => {
  const pages = ["/", "/about", "/contact", "/blog"];
  const baseUrl = "https://www.example.org";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url><loc>${baseUrl}${page}</loc></url>`).join("\n")}
</urlset>`;

  return () => {
    res.set("Content-Type", "text/xml");
    res.send(xml);
  };
});
```

This example generates a basic sitemap. You can enhance it by:

- Dynamically generating the list of pages from your database
- Adding `<lastmod>` tags to indicate when pages were last modified
- Including `<changefreq>` and `<priority>` tags for more detailed crawling instructions

### robots.txt

The `robots.txt` file tells search engines which parts of your site they can crawl. Here's a simple implementation:

```tsx
// routes/robots.txt.tsx
import { defineHandler } from "plainstack";

export const GET = defineHandler(async ({ res }) => {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Sitemap: https://www.example.org/sitemap.xml`;

  return () => {
    res.set("Content-Type", "text/plain");
    res.send(robotsTxt);
  };
});
```

This example allows crawling of all pages except those under `/admin/`, and points to your sitemap.

## API Development

### JSON API Endpoint

Create a JSON API endpoint with proper error handling:

```tsx
// routes/api/users/[id].tsx
import { defineHandler, json, getLogger } from "plainstack";
import { z } from "zod";
import database from "app/config/database";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export const GET = defineHandler(async ({ req }) => {
  const log = getLogger("api/users/[id]");
  try {
    const { id } = req.params;
    const user = await database
      .selectFrom("users")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    if (!user) {
      return json({ error: "User not found" }, { status: 404 });
    }

    const validatedUser = userSchema.parse(user);
    return json(validatedUser);
  } catch (error) {
    log.error("Error fetching user:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
});
```

This example demonstrates:

- Type-safe database querying using Kysely
- Data validation using Zod
- Proper error handling and status codes
