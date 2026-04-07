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
          bg: '#030014',      
          panel: '#0a0a20',   
          border: '#1f1b3d',  
          hover: '#181236',   
          text: '#e2e8f0',
          muted: '#64748b',
          primary: '#00f3ff', // Neon Cyan
          secondary: '#ff003c', // Aggressive Red/Magenta
          critical: '#ff003c', // Neon Red
          warning: '#fbbf24',
          hacker: '#00ff41',    
          accent: '#b026ff'    // Deep purple/magenta
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
