import { DiscordIcon } from "./icons";

export function SignupSection() {
  return (
    <div class="mx-auto max-w-5xl pb-24 py-10 sm:pb-32 px-4 md:px-8 text-center text-base-content">
      <h2 class="text-5xl md:text-6xl font-bold tracking-tight text-center">
        Join Our Discord to Hang Out ✌️
      </h2>

      <div class="items-center">
        <div class="mt-10">
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
