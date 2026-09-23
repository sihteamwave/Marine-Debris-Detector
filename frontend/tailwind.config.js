/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stitch & macOS Dark Glass design system colors
        "surface-container-lowest": "#0a0e14",
        "surface-container-low": "#10141a",
        "surface-container": "#1c2026",
        "surface-container-high": "#262a31",
        "surface-container-highest": "#31353c",
        "surface-bright": "#353940",
        "primary": "#8ecdff",
        "primary-container": "#1e6f9f",
        "on-primary": "#00344f",
        "on-primary-container": "#d9ecff",
        "secondary": "#7bd0ff",
        "secondary-container": "#00a6e0",
        "tertiary": "#3cddc7",
        "tertiary-container": "#00776a",
        "on-tertiary": "#003731",
        "on-surface": "#dfe2eb",
        "on-surface-variant": "#c0c7d0",
        "outline": "#8a919a",
        "outline-variant": "#40484f",
        "error": "#ffb4ab",
        "error-container": "#93000a",
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
      borderRadius: {
        'window': '16px',
        'card': '12px',
        'card-sm': '8px',
        'btn': '8px',
        'badge': '6px',
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "0.75rem",
        "space-lg": "1rem",
        "space-xl": "1.5rem",
        "gutter": "0.75rem",
        "gutter-compact": "0.5rem",
        "margin": "1rem",
        "margin-dock": "0.75rem",
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        telemetry: ['JetBrains Mono', 'monospace'],
        "telemetry-num": ['JetBrains Mono', 'monospace'],
        "headline-xl": ['Inter', 'sans-serif'],
        "headline-lg": ['Inter', 'sans-serif'],
        "headline-md": ['Inter', 'sans-serif'],
        "headline-sm": ['Inter', 'sans-serif'],
        "body-lg": ['Inter', 'sans-serif'],
        "body-md": ['Inter', 'sans-serif'],
        "body-sm": ['Inter', 'sans-serif'],
        "label-lg": ['JetBrains Mono', 'monospace'],
        "label-md": ['JetBrains Mono', 'monospace'],
        "label-sm": ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
