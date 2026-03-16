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
          bg: '#0F172A',      // slate-900
          panel: '#1E293B',   // slate-800
          border: '#334155',  // slate-700
          text: '#F8FAFC',    // slate-50
          muted: '#94A3B8',   // slate-400
          primary: '#3B82F6', // blue-500
          success: '#10B981', // emerald-500
          warning: '#F59E0B', // amber-500
          danger: '#EF4444',  // red-500
          critical: '#991B1B' // red-800
        }
      }
    },
  },
  plugins: [],
}
