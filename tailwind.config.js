/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'expert-blue': '#003366',
        'expert-green': '#4CAF50',
        'expert-gray': '#333333',
        'expert-light-gray': '#f4f4f4',
      },
      fontFamily: {
        'heading': ['Poppins', 'sans-serif'],
        'sans': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
