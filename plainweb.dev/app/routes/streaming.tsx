import { Suspense } from "@kitajs/html/suspense";
import { Html, PropsWithChildren } from "@kitajs/html";

import { RouteHandler, stream } from "plainweb";

async function SleepForMs({ ms, children }: PropsWithChildren<{ ms: number }>) {
  await new Promise((res) => {
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

export const GET: RouteHandler = async ({ res }) => {
  return stream(res, renderLayout);
};
