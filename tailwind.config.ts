import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        surface: "#141414",
        "surface-hover": "#1c1c1c",
        border: "#2a2a2a",
        accent: "#F5C518",
        "accent-dim": "#b8950f",
        "text-primary": "#f0ece4",
        "text-secondary": "#a09a90",
        "text-muted": "#605c56",
        danger: "#e84057",
        success: "#3dd68c",
      },
      fontFamily: {
        display: ['"DM Serif Display"', "serif"],
        body: ['"Source Serif 4"', "serif"],
        mono: ['"DM Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
