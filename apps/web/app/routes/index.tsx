import { html, RouteHandler } from "plainweb";
import RootLayout from "~/app/root";

export const GET: RouteHandler = async ({ res }) => {
  const code = "const a = 1"; // input code
  const { codeToHtml } = await import("shiki");
  const safeCode = await codeToHtml(code, {
    lang: "javascript",
    theme: "vitesse-dark",
  });
  return html(
    res,
    <RootLayout>
      <h1 class="text-3xl font-bold underline">Hello world!</h1>
      <div>{safeCode}</div>
    </RootLayout>
  );
};
