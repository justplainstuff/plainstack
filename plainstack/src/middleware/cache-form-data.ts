import { createMiddleware } from "hono/factory";

// ref: https://github.com/honojs/hono/blob/a63bcfd6fba66297d8234c21aed8a42ac00711fe/src/validator/validator.ts#L27-L28
const multipartRegex =
  /^multipart\/form-data(; boundary=[A-Za-z0-9'()+_,\-./:=?]+)?$/;
const urlencodedRegex = /^application\/x-www-form-urlencoded$/;

export function cacheFormData() {
  return createMiddleware(async (c, next) => {
    const contentType = c.req.header("Content-Type");
    if (
      !contentType ||
      !(multipartRegex.test(contentType) || urlencodedRegex.test(contentType))
    ) {
      await next();
    } else {
      c.req.bodyCache.formData = await c.req.raw.clone().formData();
      await next();
    }
  });
}
