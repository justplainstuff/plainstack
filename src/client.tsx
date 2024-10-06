import { kebabCase } from "change-case";
import { type Child, render as renderHono } from "hono/jsx/dom";
import type { JSX } from "hono/jsx/jsx-runtime";

export function render<T>(
  Component: (props: T) => Child,
  options: { path: string },
  props?: T,
) {
  const name = kebabCase(Component.name);
  return (
    <>
      <div id={`${name}-data`} data-props={JSON.stringify(props)} />
      <script type="module" defer src={`${options.path}/${name}.js`} />
    </>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function mount(Component: (props?: any) => JSX.Element) {
  if (typeof document !== "undefined") {
    const name = kebabCase(Component.name);
    const dataElement = document.getElementById(`${name}-data`);
    if (!dataElement) {
      throw new Error(
        `unable to mount client component ${name}, data element not found. make sure you have a <div id="${name}-data"></div> in your html`,
      );
    }
    const dataJson = dataElement.dataset.props;
    const data = JSON.parse(dataJson ?? "{}");
    console.info(`found data for client component ${name} in DOM`, data);
    const targetElement = document.getElementById(name);
    if (!targetElement) {
      throw new Error(
        `unable to render client component ${name}, target element not found. make sure you have a <div id="${name}"></div> in your html`,
      );
    }
    renderHono(<Component {...data} />, targetElement);
  }
}
