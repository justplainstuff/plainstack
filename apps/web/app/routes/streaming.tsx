import { Suspense, renderToStream } from "@kitajs/html/suspense";
import { Html, PropsWithChildren } from "@kitajs/html";

import type { IncomingMessage, ServerResponse } from "node:http";

async function SleepForMs({ ms, children }: PropsWithChildren<{ ms: number }>) {
  await new Promise((res, rej) => {
    setTimeout(() => {
      res({});
    }, ms * 2);
  });
  return Html.contentsToString([children || String(ms)]);
}

function renderLayout(rid: number | string) {
  return (
    <html>
      <div>
        {Array.from({ length: 5 }, (_, i) => (
          <Suspense rid={rid} fallback={<div>{i} FIuter</div>}>
            <div>Outer {i}!</div>

            <SleepForMs ms={i % 2 === 0 ? i * 2500 : i * 5000}>
              <Suspense rid={rid} fallback={<div>{i} FInner!</div>}>
                <SleepForMs ms={i * 5000}>
                  <div>Inner {i}!</div>
                </SleepForMs>
              </Suspense>
            </SleepForMs>
          </Suspense>
        ))}
      </div>
    </html>
  );
}

export default function index(_: IncomingMessage, res: ServerResponse) {
  console.log(<div>{String.name}</div>);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  const htmlStream = renderToStream(renderLayout);
  htmlStream.pipe(res);
}
