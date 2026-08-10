/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        md3: {
          light: {
            primary: '#6750A4',
            onPrimary: '#FFFFFF',
            primaryContainer: '#EADDFF',
            onPrimaryContainer: '#21005D',
            surface: '#FEF7FF',
            onSurface: '#1D1B20',
            surfaceVariant: '#E7E0EC',
            onSurfaceVariant: '#49454F',
            outline: '#79747E',
            card: '#FFFFFF',
            border: '#E2E8F0',
          },
          dark: {
            primary: '#D0BCFF',
            onPrimary: '#381E72',
            primaryContainer: '#4F378B',
            onPrimaryContainer: '#EADDFF',
            surface: '#141218',
            onSurface: '#E6E0E9',
            surfaceVariant: '#49454F',
            onSurfaceVariant: '#CAC4D0',
            outline: '#938F99',
            card: '#1D1B20',
            border: '#2D2B30',
          }
        },
        brand: {
          youtube: '#FF0000',
          tiktok: '#00F2FE',
          facebook: '#1877F2',
          instagram: '#E4405F',
          whatsapp: '#25D366',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'md3-1': '0px 1px 3px 1px rgba(0, 0, 0, 0.12), 0px 1px 2px 0px rgba(0, 0, 0, 0.24)',
        'md3-2': '0px 2px 6px 2px rgba(0, 0, 0, 0.12), 0px 1px 2px 0px rgba(0, 0, 0, 0.24)',
        'md3-3': '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.30)',
        'glow-primary': '0 0 20px rgba(103, 80, 164, 0.35)',
      }
    },
  },
  plugins: [],
}
