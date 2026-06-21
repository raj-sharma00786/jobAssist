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
        background: "#0e0e0e",
        foreground: "#adaaaa",
        primary: {
          DEFAULT: "#fd9d27",
          light: "#e08316",
          dark: "#4a2c00",
        },
        secondary: {
          DEFAULT: "#c0fe71",
          dark: "#3b6100",
        },
        accent: {
          blue: "#71ceff",
          error: "#ff7351",
        },
        surface: {
          DEFAULT: "#0e0e0e",
          low: "#131313",
          mid: "#1a1919",
          high: "#262626",
        },
        outline: "#494847",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
