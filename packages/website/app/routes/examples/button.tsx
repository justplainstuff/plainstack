import Layout from "app/layouts/root";
import type { Handler } from "plainstack";

export const POST: Handler = async () => {
  return <div>Clicked!</div>;
};

export const GET: Handler = async () => {
  return (
    <Layout>
      <button type="submit" hx-post="/examples/button" hx-swap="outerHTML">
        Click Me
      </button>
    </Layout>
  );
};
