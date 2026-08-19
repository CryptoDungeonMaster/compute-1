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
        ink: {
          DEFAULT: "#050505",
          50: "#f5f5f5",
          100: "#e8e8e8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#1a1a1d",
          900: "#0c0c0e",
          950: "#050505",
        },
        accent: {
          blue: "#3B82F6",
          green: "#22C55E",
          purple: "#A855F7",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: [
          "var(--font-display)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(59,130,246,0.55)",
        "glow-green": "0 0 40px -10px rgba(34,197,94,0.5)",
        "glow-purple": "0 0 40px -10px rgba(168,85,247,0.5)",
        glass: "0 24px 80px -24px rgba(0,0,0,0.85)",
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(ellipse at center, rgba(59,130,246,0.12), transparent 60%)",
      },
      animation: {
        "pulse-slow": "pulse-slow 3.2s ease-in-out infinite",
        float: "float 9s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
        "spin-slow": "spin 12s linear infinite",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
