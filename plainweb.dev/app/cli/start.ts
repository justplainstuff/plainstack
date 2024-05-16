import { env } from "~/app/env";
import { http } from "~/app/http";

http()
  .then((app) => {
    console.log(`server started on http://localhost:${env.PORT}`);
    app.listen(env.PORT);
  })
  .catch(console.error);
