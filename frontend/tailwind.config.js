/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        marine: {
          950: '#060e1a', // deepest ocean abyss
          900: '#0b1626', // primary background
          850: '#102035', // card / panel background
          800: '#162c47', // border / elevated surface
          700: '#1f3c5f', // active borders
          600: '#2b5280', // ocean highlight
        },
        sonar: {
          teal: '#0d9488',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
