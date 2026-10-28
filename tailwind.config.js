/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fcnm: {
          DEFAULT: '#6b21a8',   // Morado distintivo FCNM
          dark: '#3b0764',      // Morado ultra profundo
          deep: '#4c1d95',      // Violeta institucional
          violet: '#7c3aed',    // Violeta vibrante activo
          light: '#f3e8ff',     // Fondo lavanda suave
          border: '#d8b4fe',    // Borde morado sutil
          hover: '#581c87',     // Morado hover
        },
        espol: {
          navy: '#001a43',      // Azul base institucional
          gold: '#ffb81c',      // Oro
          goldHover: '#e5a00d',
          goldLight: '#fef3c7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'fcnm': '0 4px 20px -2px rgba(107, 33, 168, 0.08), 0 2px 6px -1px rgba(107, 33, 168, 0.04)',
        'fcnm-hover': '0 12px 30px -4px rgba(107, 33, 168, 0.16), 0 4px 10px -2px rgba(107, 33, 168, 0.08)',
        'fcnm-glow': '0 0 25px rgba(124, 58, 237, 0.25)',
      }
    },
  },
  plugins: [],
}
