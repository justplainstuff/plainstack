import { http } from "../http";
import { Application, Router } from "express";

function printRoutes(app: Application) {
  // TODO fix
  const router: Router = app._router;
  const routes = router.stack.filter((layer) => layer.route);

  routes.forEach((layer) => {
    const route = layer.route;
    const methods = Object.keys(route.methods);

    methods.forEach((method) => {
      console.log(`${method.toUpperCase()} ${route.path}`);
    });
  });
}

async function print() {
  const app = await http();
  printRoutes(app);
}

void print();
