/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#faf9f6',
        ink: '#1a1a1a',
        'ink-light': '#3d3d3d',
        'ink-muted': '#757575',
        border: '#e8e6e0',
        accent: '#1a8917',
        'accent-hover': '#156912',
        danger: '#c0392b',
        surface: '#ffffff',
        'surface-alt': '#f5f4f0',
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '680px',
      },
      spacing: {
        nav: '64px',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        clapPop: {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.3)' },
          '60%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-12px)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'clap-pop': 'clapPop 0.6s ease',
        shimmer: 'shimmer 1.5s infinite linear',
        'float-up': 'floatUp 0.5s ease forwards',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.08)',
        md: '0 4px 16px rgba(0,0,0,0.1)',
      },
      typography: ({ theme }) => ({
        inkwell: {
          css: {
            '--tw-prose-body': theme('colors.ink-light'),
            '--tw-prose-headings': theme('colors.ink'),
            fontFamily: theme('fontFamily.serif').join(', '),
            fontSize: '20px',
            lineHeight: '1.85',
            p: { marginBottom: '1.4em' },
            'h1, h2, h3': {
              color: theme('colors.ink'),
              marginTop: '1.5em',
              marginBottom: '0.5em',
              fontFamily: theme('fontFamily.serif').join(', '),
            },
            blockquote: {
              borderLeftColor: theme('colors.ink'),
              borderLeftWidth: '3px',
              paddingLeft: '24px',
              fontStyle: 'italic',
              color: theme('colors.ink-muted'),
            },
            code: {
              fontSize: '0.85em',
              backgroundColor: theme('colors.surface-alt'),
              padding: '2px 6px',
              borderRadius: '4px',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: {
              backgroundColor: theme('colors.ink'),
              color: theme('colors.cream'),
              padding: '20px',
              borderRadius: '4px',
              overflowX: 'auto',
            },
            a: {
              color: theme('colors.accent'),
              textDecoration: 'underline',
            },
            img: {
              borderRadius: '4px',
              marginTop: '2em',
              marginBottom: '2em',
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
