import { mount } from "plainstack/client";
import { FeatureCard } from "app/components/feature-card";
import type { Feature } from "app/components/fullstack-section";
import { useState } from "hono/jsx/dom";

export function FullstackSectionContent(props: { features: Feature[] }) {
  const [idx, setIdx] = useState(0);

  return (
    <div class="flex flex-col md:flex-row md:space-x-12 mt-20 text-lg">
      <div class="mb-8 md:mb-0 flex-1 max-w-sm">
        <div class="grid grid-cols-1 gap-4">
          {props.features.map((feature, i) => (
            // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
            <div onClick={() => setIdx(i)} class="cursor-pointer">
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                clicked={idx === i}
              />
            </div>
          ))}
        </div>
      </div>
      <div class="md:flex-1">
        <div
          class="text-sm mt-2 w-full md:w-auto lg:mt-0 px-4 md:px-6 lg:px-8 py-6 rounded-lg bg-[#282A36] overflow-x-auto"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{
            __html: props.features[idx]?.code ?? "not found",
          }}
        />
      </div>
    </div>
  );
}

mount(FullstackSectionContent);
