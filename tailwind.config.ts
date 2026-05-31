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
        pitch: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#16a34a",
          600: "#15803d",
          700: "#166534",
          900: "#14532d",
        },
        wc: {
          navy: "#0a0f1e",
          surface: "#111827",
          card: "#1a2235",
          border: "#2a3548",
          neon: "#39ff14",
          "neon-dim": "#22c55e",
          purple: "#7c3aed",
          "purple-light": "#a855f7",
          gold: "#fbbf24",
          muted: "#94a3b8",
        },
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(57, 255, 20, 0.35)",
        "neon-sm": "0 0 10px rgba(57, 255, 20, 0.25)",
        purple: "0 0 20px rgba(124, 58, 237, 0.35)",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(180deg, rgba(10,15,30,0.4) 0%, rgba(10,15,30,0.92) 100%), radial-gradient(ellipse at 50% 120%, rgba(30,58,138,0.45) 0%, rgba(10,15,30,0) 60%)",
        "card-shimmer":
          "linear-gradient(135deg, rgba(57,255,20,0.08) 0%, rgba(124,58,237,0.08) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
