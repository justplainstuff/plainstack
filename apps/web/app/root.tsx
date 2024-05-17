import Html from "@kitajs/html";

export default function RootLayout(
  props: Html.PropsWithChildren<{
    head?: string | Promise<string>;
    description?: string;
    title?: string;
  }>
) {
  return (
    <>
      {"<!doctype html>"}
      <html lang="en" data-theme="cupcake">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>{props.title || "plain web development"}</title>
          <meta
            name="description"
            content={
              props.description ||
              "a simple way to build web apps for the grug brained developer"
            }
          />
          <link rel="stylesheet" href="/output.css" />
          {props.head ? Html.escapeHtml(props.head) : null}
        </head>
        <body>{props.children}</body>
      </html>
    </>
  );
}
