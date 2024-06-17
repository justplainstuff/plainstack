import { env } from "~/app/config/env";

export function SignupSection() {
  return (
    <div class="mx-auto max-w-4xl pb-24 py-10 sm:pb-32 px-8 text-center">
      <h2 class="text-4xl font-bold tracking-tight text-neutral">
        Stay up to date
      </h2>
      <p class="text-neutral-700 mt-6 text-xl max-w-xl mx-auto">
        Receive max 2 updates a month, no spam, unsubscribe anytime.
      </p>
      <form class="join mt-10" hx-post="/" hx-swap="outerHTML">
        <input
          name="email"
          type="email"
          class="input input-bordered join-item"
          placeholder="Email"
        />
        <div class="cf-turnstile" data-sitekey={env.CF_TURNSTILE_SITEKEY}></div>
        <button type="submit" class="btn btn-primary join-item">
          Sign up
        </button>
      </form>
    </div>
  );
}
