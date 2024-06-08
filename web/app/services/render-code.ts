const cache = new Map<string, string>();

export async function renderCode(
  code: string,
  lang: "tsx" | "typescript" = "typescript"
) {
  if (cache.has(code)) {
    return cache.get(code);
  }
  const { codeToHtml } = await import("shiki");
  const rendered = await codeToHtml(code, {
    lang: lang,
    theme: "dracula-soft",
  });

  cache.set(code, rendered);
  return rendered;
}
