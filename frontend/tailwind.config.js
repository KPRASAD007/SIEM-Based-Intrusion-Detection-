/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#09090b',      // Zinc 950
          panel: '#18181b',   // Zinc 900
          border: '#27272a',  // Zinc 800
          hover: '#3f3f46',   // Zinc 700
          text: '#fafafa',    // Zinc 50
          muted: '#71717a',   // Zinc 400
          primary: '#3b82f6', // Modern Blue (Blue 500)
          secondary: '#6366f1', // Indigo 500
          critical: '#ef4444', // Red 500
          warning: '#f59e0b', // Amber 500
          hacker: '#22c55e',  // Green 500
          accent: '#8b5cf6'   // Violet 500
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-green': 'glow-green 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'glow-green': {
          '0%': { boxShadow: '0 0 5px rgba(16, 185, 129, 0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(16, 185, 129, 0.6)' }
        }
      }
    },
  },
  plugins: [],
}
