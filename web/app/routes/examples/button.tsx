import type { Handler } from "plainweb";
import Layout from "~/app/layout";

export const POST: Handler = async () => {
  return <div>Clicked!</div>;
};

export const GET: Handler = async () => {
  return (
    <Layout>
      <button hx-post="/examples/button" hx-swap="outerHTML">
        Click Me
      </button>
    </Layout>
  );
};
