const cache = new Map<string, string>();

let codeToHtml: (
  code: string,
  options: { lang: string; theme: string },
) => Promise<string>;

export async function renderCode(
  code: string,
  lang: "bash" | "tsx" | "typescript" = "typescript",
): Promise<string> {
  if (cache.has(code)) {
    return cache.get(code) as string;
  }
  try {
    if (!codeToHtml) {
      const shiki = await import("shiki");
      codeToHtml = shiki.codeToHtml;
    }
    const rendered = await codeToHtml(code, {
      lang: lang,
      theme: "dracula-soft",
    });

    cache.set(code, rendered);
    return rendered;
  } catch (e) {
    // clearing cache on error
    cache.clear();
    throw e;
  }
}
