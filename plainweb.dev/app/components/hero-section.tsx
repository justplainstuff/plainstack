import { Showcase } from "~/app/components/showcase";

export async function HeroSection() {
  return (
    <div class="mx-auto max-w-4xl pb-24 py-10 sm:pb-32 px-8 mt-20 lg:mt-26">
      <h1 class="text-8xl font-bold tracking-tight text-neutral text-center">
        plainweb
      </h1>
      <div class="mx-auto max-w-xl">
        <p
          x-data="{}"
          class="mt-10 text-xl leading-8 text-neutral-700 text-center"
        >
          Plainweb is a set of tools, conventions and patterns to help you build
          web apps with less complexity and more{" "}
          <span
            class="underline cursor-pointer"
            x-on:click="confetti({particleCount: 100, spread: 70, origin: { y: 0.6 }});"
          >
            joy
          </span>{" "}
          🎉
        </p>
      </div>
      <div class="mt-10 text-center">
        <button class="btn btn-primary">npx create-plainweb</button>
      </div>
      <div class="mx-auto mt-20">
        <Showcase />
      </div>
    </div>
  );
}
