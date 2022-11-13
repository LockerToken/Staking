/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Tauri", "sans-serif"],
      },
      colors: {
        primary: "#031c78",
        secondary: "#aa9659",
        brown: "#705f27",
        darkBrown: "#302615",
        background: {
          top: "#30261550",
          bottom: "#221b1050",
        },
      },
    },
  },
  plugins: [],
};
