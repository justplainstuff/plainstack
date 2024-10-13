import { describe, test, expect } from "bun:test";
import { createMarkdownRenderer, renderPage } from "./page";

describe("page", async () => {
  test("render page", async () => {
    const content = `# Main Title

## Subtitle

This is a paragraph.

### Subsubtitle

This is a subparagraph.

### Subsubtitle 2

This is another subparagraph.
`;
    const page = await renderPage(
      "0-test.md",
      content,
      await createMarkdownRenderer()
    );
    expect(page.h1[0]).toBe("Main Title");
    expect(page.h2[0]).toBe("Subtitle");
    expect(page.h3[0]).toBe("Subsubtitle");
    expect(page.h3[1]).toBe("Subsubtitle 2");
  });
});
