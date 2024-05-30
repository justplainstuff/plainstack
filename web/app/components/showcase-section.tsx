import { Showcase } from "~/app/components/showcase";

export function ShowcaseSection() {
  return (
    <div class="mx-auto max-w-4xl pb-24 py-10 sm:pb-32 px-8">
      <h2 class="text-4xl font-bold tracking-tight text-neutral">
        plainweb at a glance
      </h2>
      <div class={"mt-6"}>
        <Showcase />
      </div>
    </div>
  );
}
