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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          green: "#1e1b4b",
          amber: "#f59e0b",
        },
      },
      keyframes: {
        ping: {
          "0%": { transform: "scale(0)", opacity: "1" },
          "80%, 100%": { transform: "scale(1.8)", opacity: "0" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        ping: "ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite",
        spin: "spin 3s linear infinite",
        bounce: "bounce 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
