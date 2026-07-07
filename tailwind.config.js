/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mint: '#4EFFC5',
        teal: '#22D3EE',
        coral: '#FF7F6B',
        gold: '#FFD93D',
        lavender: '#D4A5FF',
        ink: '#1A1A2E',
        'ink-2': '#4A4A6A',
        'ink-3': '#8A8AAA',
        surface: '#FFFFFF',
        'surface-2': '#F5F5F5',
        border: '#E5E5E5',
        'border-2': '#D5D5D5',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        r: '10px',
      },
      spacing: {
        '0.5': '2px',
      },
    },
  },
  plugins: [],
}
