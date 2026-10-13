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
        hotel: {
          limestone: "#FAF8F5",
          sand: "#F4EFEA",
          parchment: "#EAE4DC",
          border: "#E2DAD0",
          charcoal: "#141518",
          ink: "#202226",
          muted: "#6B6E76",
          cypress: {
            DEFAULT: "#233726",
            light: "#314C35",
            dark: "#17251A",
          },
          brass: {
            DEFAULT: "#B38E5D",
            light: "#C8A677",
            dark: "#916F41",
          },
        },
      },
      fontFamily: {
        serif: ["var(--font-editorial)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 8px -2px rgba(20, 21, 24, 0.04), 0 8px 24px -4px rgba(20, 21, 24, 0.06)",
        card: "0 10px 30px -10px rgba(20, 21, 24, 0.08), 0 20px 40px -15px rgba(20, 21, 24, 0.04)",
        elevated: "0 25px 60px -15px rgba(20, 21, 24, 0.12)",
        innerGlow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
