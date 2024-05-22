import { Suspense } from "@kitajs/html/suspense";
import { Handler, stream } from "plainweb";
import { db } from "~/app/database/database";

async function HelloDelayed() {
  const user = db.query.users.findFirst();
  return <div>Hello {user.name}</div>;
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
