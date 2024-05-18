import { RouteHandler, html } from "plainweb";
import RootLayout from "~/app/root";

export const POST: RouteHandler = async ({ req, res }) => {
  return html(res, <div>Clicked!</div>);
};

export const GET: RouteHandler = async ({ req, res }) => {
  return html(
    res,
    <RootLayout>
      <button hx-post="/examples/button" hx-swap="outerHTML">
        Click Me
      </button>
    </RootLayout>
  );
};
