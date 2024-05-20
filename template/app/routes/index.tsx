import { html, RouteHandler } from "plainweb";
import RootLayout from "~/app/root";

export const GET: RouteHandler = async ({ res }) => {
  return html(
    res,
    <RootLayout>
      <div>Let's go!</div>
    </RootLayout>
  );
};
