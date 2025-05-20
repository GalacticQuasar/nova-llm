/** @type {import('tailwindcss').Config} */
export default {
    content: ['/index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        typography: {
          DEFAULT: {
            css: {
              pre: {
                backgroundColor: '',
                padding: 0,
              },
            },
          },
        },
      },
    },
    plugins: [require('@tailwindcss/typography')],
  }