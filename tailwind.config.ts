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
        // Màu sắc chủ đạo theo yêu cầu
        primary: {
          DEFAULT: "#724677", // Tông màu nhận diện chính
          light: "#8a5790",
          dark: "#5c3860",
        },
        accent: {
          1: "#BE2230", // Điểm nhấn cho nút bấm CTA
          2: "#ad2329", // Điểm nhấn phụ (hover state)
        },
        background: {
          DEFAULT: "#f9fafb", // Nền sáng thư giãn
          paper: "#ffffff",
        },
      },
      fontFamily: {
        // Cài đặt font Poppins làm mặc định
        sans: ["var(--font-poppins)", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
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
      },
    },
  },
  plugins: [],
};

export default config;
