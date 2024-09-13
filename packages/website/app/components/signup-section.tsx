import { DiscordIcon } from "app/components/icons";
import env from "app/config/env";

export function SignupSection() {
  return (
    <div class="mx-auto max-w-5xl pb-24 py-10 sm:pb-32 px-4 md:px-8 text-center text-base-content">
      <h2 class="text-5xl md:text-6xl font-bold tracking-tight text-center">
        Join Us
      </h2>

      <div class="items-center">
        <p class="text-base-content mt-10 max-w-xl mx-auto text-lg">
          Join the newsletter and our Discord to hang out ✌️
        </p>
        <div class="mt-10 flex flex-col items-center space-y-4">
          <form
            class="flex flex-col sm:flex-row w-full max-w-md space-y-2 sm:space-y-0 sm:space-x-2"
            hx-post="/"
            hx-swap="outerHTML"
          >
            <input
              name="email"
              type="email"
              class="input input-bordered flex-grow w-full"
              placeholder="Email"
            />
            <div
              class="cf-turnstile hidden"
              data-sitekey={env.CF_TURNSTILE_SITEKEY}
            />
            <button type="submit" class="btn btn-primary w-full sm:w-auto">
              Sign up
            </button>
          </form>
          <a
            class="btn btn-outline h-[3rem] min-h-[3rem] px-4 w-full max-w-md sm:w-auto"
            href="https://discord.gg/SWfSDAuqyu"
            aria-label="Join our Discord"
          >
            Join Discord
            <DiscordIcon />
          </a>
        </div>
      </div>
    </div>
  );
}
