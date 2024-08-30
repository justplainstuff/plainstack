import { Suspense } from "@kitajs/html/suspense";
import { stream, type Handler } from "plainstack";

async function HelloDelayed() {
  await new Promise((res) => {
    setTimeout(() => {
      res({});
    }, 5000);
  });
  return <div>Hello 5 seconds later!</div>;
}

export const GET: Handler = async () => {
  return stream((rid) => (
    <Suspense
      rid={rid}
      fallback={<div>Loading...</div>}
      catch={() => <div>Something went wrong</div>}
    >
      <HelloDelayed />
    </Suspense>
  ));
};
