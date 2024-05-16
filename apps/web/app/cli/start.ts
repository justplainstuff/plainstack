import { env } from "~/app/env";
import { http } from "~/app/http";

http()
  .then((app) => app.listen(env.PORT))
  .catch(console.error);
