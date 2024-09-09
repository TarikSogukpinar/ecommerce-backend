/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,mdx}', // Add all relevant file types
    './docs/**/*.{md,mdx}', // Tailwind will scan your MDX files too
    './blog/**/*.{md,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};