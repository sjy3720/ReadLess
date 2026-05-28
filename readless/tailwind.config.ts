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
        bg: {
          primary: "#111111",
          secondary: "#1a1a1a",
          card: "rgba(255,255,255,0.04)",
        },
        accent: {
          primary: "#f6d878",
          hover: "#f8e08a",
        },
        text: {
          primary: "#f5f5f5",
          secondary: "#a1a1aa",
          muted: "#71717a",
        },
        border: {
          subtle: "rgba(255,255,255,0.08)",
          medium: "rgba(255,255,255,0.12)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "SF Mono",
          "Fira Code",
          "Fira Mono",
          "Roboto Mono",
          "monospace",
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "fade-in-slow": "fadeIn 1.2s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-up-slow": "slideUp 0.8s ease-out",
        "float": "float 6s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "appear": "appear 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        appear: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
