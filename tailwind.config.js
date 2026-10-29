/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          900: '#0c4a6e',
        },
        status: {
          supported: '#15803d', // Green 700
          conditional: '#b45309', // Amber 700
          incompatible: '#b91c1c', // Red 700
          insufficient: '#475569', // Slate 600
          conflicting: '#7e22ce', // Purple 700
        }
      },
    },
  },
  plugins: [],
};

