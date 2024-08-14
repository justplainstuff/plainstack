import type { PropsWithChildren } from "@kitajs/html";
import { config } from "admin/config";

function DatabaseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="size-5"
    >
      <title>Database</title>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}

function MediaIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-image"
    >
      <title>Media</title>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function TaskQueueIcons() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-rows-2"
    >
      <title>Task Queues</title>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 12h18" />
    </svg>
  );
}

function MainNavigation(props: {
  active: "database" | "media" | "users";
}) {
  return (
    <ul class="menu bg-base-200 rounded-box w-56 mb-2">
      <li>
        <a
          class={props.active === "database" ? "active" : ""}
          href={`${config.adminBasePath}/database`}
        >
          <DatabaseIcon />
          Database
        </a>
      </li>
      <li class="disabled">
        <a href={`${config.adminBasePath}/users`}>
          <TaskQueueIcons />
          Task Queues
        </a>
      </li>
      <li class="disabled">
        <a href={`${config.adminBasePath}/media`}>
          <MediaIcon />
          Media Uploads
        </a>
      </li>
    </ul>
  );
}

function SubNavigation(props: { items: NavigationItem[]; path: string }) {
  return (
    <ul class="menu menu-sm">
      {props.items.map((item) => {
        const safeIcon = item.icon;
        const active = props.path.endsWith(item.href.split("/").pop() ?? "");
        const safeLabel = item.label;
        return (
          <li>
            {item.icon && <span>{safeIcon}</span>}
            <a class={active ? "active" : ""} href={item.href}>
              {safeLabel}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export type NavigationItem = {
  href: string;
  label: JSX.Element;
  icon?: JSX.Element;
};

export function AdminLayout(
  props: PropsWithChildren<{
    active: "database" | "media" | "users";
    path: string;
    subNavigation: NavigationItem[];
    description?: string;
    title?: string;
  }>,
) {
  return (
    <>
      {"<!doctype html>"}
      <html lang="en" data-theme="auto">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>{props.title || "plainweb"}</title>
          <meta
            name="description"
            content={
              props.description ||
              "Build web app with less complexity and more joy."
            }
          />
          {process.env.BIN_ADMIN_TESTING ? (
            <link rel="stylesheet" href="/public/output.css" />
          ) : (
            <style>{process.env.ADMIN_STYLES}</style>
          )}
          <script
            defer
            src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.0/dist/cdn.min.js"
          />
          <script defer src="https://unpkg.com/htmx.org@1.9.12" />
        </head>
        <body>
          <div class="navbar bg-base-100">
            <a href="/" class="btn btn-ghost text-xl">
              plainweb
            </a>
          </div>
          <div class="px-2 sm:px-4">
            <div class="flex">
              <div class="sticky top-4 self-start mr-4">
                <MainNavigation active={props.active} />
                <SubNavigation items={props.subNavigation} path={props.path} />
              </div>
              {props.children}
            </div>
          </div>
        </body>
      </html>
    </>
  );
}
