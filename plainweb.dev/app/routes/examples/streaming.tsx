import { Suspense } from "@kitajs/html/suspense";
import { RouteHandler, stream } from "plainweb";

async function HelloDelayed() {
  await new Promise((res) => {
    setTimeout(() => {
      res({});
    }, 5000);
  });
  return <div>Hello 5 seconds later!</div>;
}

export const GET: RouteHandler = async () => {
  return stream((rid) => (
    <html>
      <div>
        <Suspense
          rid={rid}
          fallback={<div>Loading...</div>}
          catch={() => <div>Something went wrong</div>}
        >
          <HelloDelayed />
        </Suspense>
      </div>
    </html>
  ));
};
