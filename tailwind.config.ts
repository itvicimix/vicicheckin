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
        primary: {
          DEFAULT: "#724677",
          light: "#8a5790",
          dark: "#5c3860",
        },
        accent: {
          1: "#BE2230",
          2: "#ad2329",
        },
        background: {
          DEFAULT: "#0f172a", // Dark background for antigravity theme
          paper: "#1e293b",
        },
        brand: {
          dark: "#0B0F19",
          card: "#121826",
          accent: "#2563EB",
          glow: "#3B82F6",
        }
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        clash: ["var(--font-clash-display)", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
        sm: "15px",
        DEFAULT: "15px",
        md: "15px",
        lg: "15px",
        xl: "15px",
        "2xl": "15px",
        "3xl": "15px",
        full: "9999px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.8s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.5", filter: "blur(20px)" },
          "50%": { opacity: "0.8", filter: "blur(25px)" },
        }
      },
    },
  },
  plugins: [],
};

export default config;
