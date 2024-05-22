import { RouteHandler } from "plainweb";
import RootLayout from "~/app/root";

export const POST: RouteHandler = async () => {
  return <div>Clicked!</div>;
};

export const GET: RouteHandler = async () => {
  return (
    <RootLayout>
      <button hx-post="/examples/button" hx-swap="outerHTML">
        Click Me
      </button>
    </RootLayout>
  );
};
