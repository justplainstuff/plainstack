const cache = new Map<string, string>();

export async function renderCode(
  code: string,
  lang: "bash" | "tsx" | "typescript" = "typescript",
): Promise<string> {
  if (cache.has(code)) {
    return cache.get(code)!;
  }
  try {
    const { codeToHtml } = await import("shiki");
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
