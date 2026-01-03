/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Production optimization
  future: {
    hoverOnlyWhenSupported: true,  // Better mobile/kiosk performance
  },
}
