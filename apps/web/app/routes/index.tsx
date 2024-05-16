import { route, render } from "plainweb";
import { Layout } from "~/app/components/layout";

export default route({
  GET: ({ res }) => {
    render(
      res,
      <Layout>
        <h1>Hello, world!</h1>
      </Layout>
    );
  },
});
