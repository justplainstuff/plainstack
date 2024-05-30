import { runTasks, useTransporter } from "plainweb";
import { debug, env } from "~/app/config/env";
import { http } from "~/app/config/http";
import { mail } from "~/app/config/mail";

async function serve() {
  useTransporter(mail);
  await runTasks("app/tasks", { debug: true });
  await http();
  debug && console.log(`⚡️ http://localhost:${env.PORT}`);
}

serve();
