# Recipes

This section provides practical recipes to implement common features in your plainweb application. These snippets are designed to be easy to understand and integrate into your project.

## SEO and Crawling

### sitemap.xml

A sitemap helps search engines understand the structure of your site. Here's how to generate a simple `sitemap.xml`:

```tsx
// routes/sitemap.xml.tsx
import { type Handler } from "plainstack";

export const GET: Handler = async ({ res }) => {
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
};
```

This example generates a basic sitemap. You can enhance it by:

- Dynamically generating the list of pages from your database
- Adding `<lastmod>` tags to indicate when pages were last modified
- Including `<changefreq>` and `<priority>` tags for more detailed crawling instructions

### robots.txt

The `robots.txt` file tells search engines which parts of your site they can crawl. Here's a simple implementation:

```tsx
// routes/robots.txt.tsx
import { Handler } from "plainstack";

export const GET: Handler = async ({ res }) => {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Sitemap: https://www.example.org/sitemap.xml`;

  return () => {
    res.set("Content-Type", "text/plain");
    res.send(robotsTxt);
  };
};
```

This example allows crawling of all pages except those under `/admin/`, and points to your sitemap.

## API Development

### JSON API Endpoint

Create a JSON API endpoint with proper error handling:

```tsx
// routes/api/users/[id].tsx
import { Handler, json } from "plainstack";
import { z } from "zod";
import { database } from "app/config/database";
import { users } from "app/config/schema";
import { eq } from "drizzle-orm";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export const GET: Handler = async ({ req, res }) => {
  try {
    const { id } = req.params;
    const user = await database.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return json({ error: "User not found" }, { status: 404 });
    }

    const validatedUser = userSchema.parse(user);
    return json(validatedUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
```

This example demonstrates:

- Type-safe database querying
- Data validation using Zod
- Proper error handling and status codes
