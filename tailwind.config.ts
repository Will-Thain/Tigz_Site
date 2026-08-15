import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0b0c09",
          900: "#12140f",
          800: "#1a1d16",
          700: "#24281e",
        },
        sand: {
          100: "#f3ecda",
          300: "#c9bea4",
          500: "#8f866f",
        },
        olive: {
          400: "#b7c07a",
          500: "#8f9a52",
        },
        live: "#d64532",
        twitch: "#9146ff",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        panel: "inset 0 0 0 1px rgba(199, 190, 164, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
