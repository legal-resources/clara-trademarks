import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clara: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d5fe",
          300: "#a4b8fc",
          400: "#8093f9",
          500: "#6171f5",
          600: "#4a4de9",
          700: "#3c3dce",
          800: "#3234a7",
          900: "#2d3184",
          950: "#1a1b4e",
        },
      },
    },
  },
  plugins: [],
};
export default config;
