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
          bg: '#020617',      
          panel: '#0f172a',   
          border: '#1e293b',  
          hover: '#1e2030',   
          text: '#f8fafc',
          muted: '#94a3b8',
          primary: '#10b981', 
          secondary: '#3b82f6', 
          critical: '#ef4444', 
          warning: '#f59e0b',
          hacker: '#00ff41',    
          accent: '#c084fc'    
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
