import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#CC3300", // warna aksen utama diambil dari toast 'error' lama, dipakai sebagai brand color
          dark: "#8f2400",
        },
        green: "#1A7A4A",
        amber: "#C47B00",
        grey: "#6b6b6b",
      },
    },
  },
  plugins: [],
};

export default config;
