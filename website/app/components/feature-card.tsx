import { cx } from "hono/css";

export function FeatureCard({
  icon,
  title,
  description,
  clicked,
}: {
  icon?: string;
  title?: string;
  description?: string | Promise<string>;
  clicked?: boolean;
}) {
  return (
    <div
      class={cx(
        clicked ? "bg-neutral" : "bg-base-200",
        "p-4 rounded-lg shadow-sm"
      )}
    >
      <div class="flex items-center space-x-2">
        {icon && <div class="text-xl mb-2">{icon}</div>}
        {title && <h3 class="font-bold mb-1">{title}</h3>}
      </div>
      {description && <p class="text-sm text-base-content/70">{description}</p>}
    </div>
  );
}
