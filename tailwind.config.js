/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        espol: {
          navy: '#001a43',    // Oficial ESPOL Pantone 275 C
          dark: '#00122e',    // Azul ultra profundo
          blue: '#003366',    // Azul intermedio politécnico
          bright: '#0072ce',  // Azul cielo institucional
          sky: '#0284c7',     // Acentos y botones primarios
          gold: '#ffb81c',    // Oro politécnico
          goldHover: '#e5a00d',
          goldLight: '#fef3c7',
        },
        fcnm: {
          teal: '#00a896',    // Verde azulado FCNM
          emerald: '#059669', // Verde campus politécnico
          ruby: '#dc2626',    // Rojo rubí
          amber: '#d97706',   // Ámbar politécnico
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'espol': '0 4px 20px -2px rgba(0, 26, 67, 0.08), 0 2px 6px -1px rgba(0, 26, 67, 0.04)',
        'espol-hover': '0 12px 30px -4px rgba(0, 26, 67, 0.14), 0 4px 10px -2px rgba(0, 26, 67, 0.06)',
        'espol-glow': '0 0 25px rgba(0, 114, 206, 0.25)',
      }
    },
  },
  plugins: [],
}
