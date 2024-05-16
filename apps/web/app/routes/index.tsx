import { html, RouteHandler } from "plainweb";
import { Layout } from "~/app/components/layout";

export const GET: RouteHandler = async ({ res }) => {
  return html(
    res,
    <Layout>
      <h1>Hello, world!</h1>
    </Layout>
  );
};
