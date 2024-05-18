import { env } from "~/app/env";
import { http } from "~/app/http";

http()
  .then((app) => {
    app.listen(env.PORT);
    console.log(`server started on http://localhost:${env.PORT}`);
  })
  .catch(console.error);
