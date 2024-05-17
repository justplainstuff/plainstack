import { html, RouteHandler } from "plainweb";
import RootLayout from "~/app/root";

export const GET: RouteHandler = async ({ res }) => {
  return html(
    res,
    <RootLayout>
      <h1 class="text-3xl font-bold underline">Hello world!</h1>
    </RootLayout>
  );
};
