import { RouteHandler, html } from "plainweb";

export const GET: RouteHandler = async ({ req, res }) => {
  return html(res, <h1>Hello, world!</h1>);
};
