import { useState } from "hono/jsx";
import { mount } from "../../plainstack/src/client";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

mount(Counter);
