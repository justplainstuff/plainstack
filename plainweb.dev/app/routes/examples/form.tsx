import { RouteHandler, html } from "../../../../plainweb/src";
import RootLayout from "~/app/root";

export const POST: RouteHandler = async ({ req, res }) => {
  return html(
    res,
    <div hx-target="this" hx-swap="outerHTML" class="error">
      <label>Email Address</label>
      <input
        name="email"
        hx-post="/examples/form"
        hx-indicator="#ind"
        value="test@foo.com"
      />
      <img id="ind" src="/images/bars.svg" class="htmx-indicator" />
      <div class="error-message">
        That email is already taken. Please enter another email.
      </div>
    </div>
  );
};

export const GET: RouteHandler = async ({ req, res }) => {
  return html(
    res,
    <RootLayout>
      <h3>Signup Form</h3>
      <form hx-post="/examples/form">
        <div hx-target="this" hx-swap="outerHTML">
          <label>Email Address</label>
          <input name="email" hx-post="/examples/form" hx-indicator="#ind" />
          <img id="ind" src="/images/bars.svg" class="htmx-indicator" />
        </div>
        <button class="btn btn-default">Submit</button>
      </form>
    </RootLayout>
  );
};
