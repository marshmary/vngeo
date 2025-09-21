/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vietnam-red': '#da020e',
        'vietnam-yellow': '#ffcd00',
        'mekong-blue': '#1e40af',
        'rice-green': '#16a34a',
        'mountain-gray': '#6b7280',
        'zone-1': '#ef4444',  // North Mountain Region
        'zone-2': '#f97316',  // Red River Delta
        'zone-3': '#eab308',  // North Central Coast
        'zone-4': '#22c55e',  // South Central Coast
        'zone-5': '#3b82f6',  // Central Highlands
        'zone-6': '#8b5cf6',  // Mekong River Delta
      },
      fontFamily: {
        'primary': ['Inter', 'sans-serif'],
        'heading': ['Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}