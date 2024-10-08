export function dev() {
  return process.env.NODE_ENV === "development";
}

export function prod() {
  return process.env.NODE_ENV === "production";
}

export function test() {
  return process.env.NODE_ENV === "test";
}
