import { env } from "~/app/env";
import { http } from "~/app/http";
import { migrate } from "./migrate";

migrate();
http()
  .then((app) => {
    app.listen(env.PORT);
    console.log(`server started on http://localhost:${env.PORT}`);
  })
  .catch(console.error);
