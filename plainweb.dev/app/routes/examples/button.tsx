import { Handler } from "plainweb";
import RootLayout from "~/app/root";

export const POST: Handler = async () => {
  return <div>Clicked!</div>;
};

export const GET: Handler = async () => {
  return (
    <RootLayout>
      <button hx-post="/examples/button" hx-swap="outerHTML">
        Click Me
      </button>
    </RootLayout>
  );
};
