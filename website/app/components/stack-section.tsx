export async function StackSection() {
  return (
    <div class="mx-auto max-w-6xl pb-24 py-10 sm:pb-36 px-4 md:px-8 text-base-content">
      <h2 class="text-5xl md:text-6xl font-bold tracking-tight text-center">
        The Plain Stack
      </h2>
      <p class="text-3xl font-bold text-center mt-6 text-base-content/70">
        Standing on the shoulders of giants
      </p>
      <div class="text-3xl md:text-4xl font-semibold space-y-2 mt-20 max-w-[400px] mx-auto">
        <div>Hono</div>
        <div>
          + Bun <span class="text-sm text-base-content/50">(or Deno)</span>
        </div>
        <div>
          + SQLite{" "}
          <span class="text-sm text-base-content/50">(or Postgres)</span>
        </div>
        <div class="flex items-center">+ Kysely</div>
        <div>
          + plainstack{" "}
          <p class="text-sm text-base-content/50 ml-8">
            (= forms + jobs + schedules + CRUD + migrations)
          </p>
        </div>
        <div class="border-t border-base-content mt-2 pt-2">
          = you shipping faster 🚢
        </div>
      </div>
    </div>
  );
}
