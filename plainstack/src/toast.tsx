import { html } from "hono/html";
import type Toastify from "toastify-js";

export type ToastProps = { toast: unknown } & Toastify.Options;

export function Toast(props: ToastProps) {
  if (!props.toast || typeof props.toast !== "string") {
    return null;
  }

  return (
    <>
      <link
        rel="stylesheet"
        type="text/css"
        href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css"
      />
      <script
        type="text/javascript"
        src="https://cdn.jsdelivr.net/npm/toastify-js"
      />
      {html`
        <script>
          window.onload = function() {
            Toastify({
              text: "${props.toast}",
              node: ${props.node ? JSON.stringify(props.node) : "undefined"},
              duration: ${props.duration || "3000"},
              selector: ${props.selector ? `"${props.selector}"` : "undefined"},
              destination: ${props.destination ? `"${props.destination}"` : "undefined"},
              newWindow: ${props.newWindow || "false"},
              close: ${props.close || "false"},
              gravity: "${props.gravity || "bottom"}",
              position: "${props.position || "right"}",
              ariaLive: "${props.ariaLive || "polite"}",
              backgroundColor: ${props.backgroundColor ? `"${props.backgroundColor}"` : "undefined"},
              avatar: ${props.avatar ? `"${props.avatar}"` : "undefined"},
              className: ${props.className ? `"${props.className}"` : "undefined"},
              stopOnFocus: ${props.stopOnFocus !== undefined ? props.stopOnFocus : "true"},
              callback: ${props.callback ? `function() { (${props.callback.toString()})(); }` : "undefined"},
              onClick: ${props.onClick ? `function() { (${props.onClick.toString()})(); }` : "undefined"},
              offset: ${props.offset ? JSON.stringify(props.offset) : "undefined"},
              escapeMarkup: ${props.escapeMarkup !== undefined ? props.escapeMarkup : "true"},
              style: ${props.style ? JSON.stringify(props.style) : "{}"},
              oldestFirst: ${props.oldestFirst || "false"}
            }).showToast();
          }
        </script>
      `}
    </>
  );
}
