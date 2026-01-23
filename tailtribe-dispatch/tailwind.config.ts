import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          lg: "4rem",
          xl: "5rem",
          "2xl": "6rem",
        },
      },
      colors: {
        brand: {
          DEFAULT: 'hsl(var(--tt-primary))',
          foreground: 'hsl(var(--tt-primary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--tt-accent))',
          foreground: 'hsl(var(--tt-accent-foreground))',
        },
        muted: 'hsl(var(--tt-muted))',
        foreground: 'hsl(var(--tt-foreground))',
        background: 'hsl(var(--tt-bg))',
      },
      borderRadius: {
        'tt': 'var(--tt-radius)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        'heading': ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'tt': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'tt-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'tt-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [typography],
} satisfies Config;
