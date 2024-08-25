import { Showcase } from "app/components/showcase";
import { getNrOfSparks } from "app/services/confetti";

export async function HeroSection() {
  const nrOfSparks = await getNrOfSparks();
  return (
    <div class="mx-auto max-w-5xl pb-24 py-10 sm:pb-32 px-4 md:px-8 mt-20 lg:mt-26">
      <h1 class="text-6xl md:text-8xl font-bold tracking-tight text-base-content text-center">
        plainweb
      </h1>
      <div class="mx-auto max-w-xl">
        <h2
          x-data="{}"
          class="mt-10 text-2xl leading-8 text-base-content text-center"
        >
          The all-in-one web framework obsessing
          <br />
          about{" "}
          <span
            class="underline cursor-pointer confetti-trigger"
            x-on:click="confetti({particleCount: 100, spread: 70, origin: { y: 0.6 }});"
          >
            velocity
          </span>{" "}
          🏎️
          <div class="mt-2 text-xs text-neutral-500">
            <span safe id="joy-counter">
              {nrOfSparks}
            </span>{" "}
            sparks
          </div>
        </h2>
      </div>
      <div class="mt-10 text-center">
        <div class="select-all cursor-text rounded-lg bg-neutral px-5 py-2.5 inline-block">
          <pre class="text-xl text-neutral-content">npx create-plainweb</pre>
        </div>{" "}
      </div>
      <div class="mx-auto mt-36">
        <Showcase />
      </div>
    </div>
  );
}
