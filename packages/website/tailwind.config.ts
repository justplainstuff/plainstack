/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{tsx,html,ts}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
  daisyui: {
    themes: ["light", "dark"],
  },
};
