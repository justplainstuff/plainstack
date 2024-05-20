export async function renderCode(code: string) {
  const { codeToHtml } = await import("shiki");
  return await codeToHtml(code, {
    lang: "javascript",
    theme: "dracula-soft",
  });
}
