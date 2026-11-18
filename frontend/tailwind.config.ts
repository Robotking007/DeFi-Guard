import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080b11",
        surface: "#0e1422",
        "surface-elevated": "#151d30",
        border: "#1e293b",
        primary: {
          DEFAULT: "#10b981", // emerald
          hover: "#059669",
        },
        secondary: {
          DEFAULT: "#06b6d4", // cyan
          hover: "#0891b2",
        },
        accent: "#6366f1", // indigo
        risk: {
          low: "#10b981",
          medium: "#f59e0b",
          high: "#ef4444",
          critical: "#dc2626",
        },
      },
    },
  },
  plugins: [],
};
export default config;
