import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createMarkdownRenderer, renderPage } from "~/app/services/page";

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
      await createMarkdownRenderer(),
    );
    assert.equal(page.h1[0], "Main Title");
    assert.equal(page.h2[0], "Subtitle");
    assert.equal(page.h3[0], "Subsubtitle");
    assert.equal(page.h3[1], "Subsubtitle 2");
  });
});
