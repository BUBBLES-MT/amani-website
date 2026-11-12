/** @type {import('tailwindcss').Config} */
module.exports = {
  // ===== CONTENT PATHS =====
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // For safety
  ],

  // ===== DARK MODE =====
  darkMode: 'class', // Enable class-based dark mode

  // ===== THEME =====
  theme: {
    extend: {
      // ===== COLORS =====
      colors: {
        church: {
          50: '#f0f7ff',
          100: '#e0eefe',
          200: '#badeff',
          300: '#7abdff',
          400: '#3a9bff',
          500: '#0a7aff',
          600: '#0060d6',
          700: '#004aad',
          800: '#003885',
          900: '#00265c',
          950: '#001a3d', // Added darker shade
        },
        gold: {
          50: '#fdf9f0',
          100: '#fbf0d8',
          200: '#f7e0b0',
          300: '#f3c878',
          400: '#efb040',
          500: '#d4941f',
          600: '#b07a18',
          700: '#8c6012',
          800: '#68460c',
          900: '#442c06',
          950: '#2a1a03', // Added darker shade
        },
        // ===== SEMANTIC COLORS =====
        primary: {
          DEFAULT: '#0a7aff',
          light: '#3a9bff',
          dark: '#0060d6',
        },
        secondary: {
          DEFAULT: '#d4941f',
          light: '#efb040',
          dark: '#b07a18',
        },
        success: {
          DEFAULT: '#22c55e',
          light: '#4ade80',
          dark: '#16a34a',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
        danger: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
        },
        info: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
        },
      },

      // ===== FONTS =====
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'Cambria', 'serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        heading: ['Merriweather', 'Georgia', 'serif'], // For headings
      },

      // ===== ANIMATIONS =====
      animation: {
        // Existing
        'fade-in': 'fadeIn 0.8s ease-out',
        'fade-out': 'fadeOut 0.8s ease-in',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'zoom-in': 'zoomIn 0.4s ease-out',
        'zoom-out': 'zoomOut 0.4s ease-in',
        'shake': 'shake 0.5s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite',
      },

      // ===== KEYFRAMES =====
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        zoomOut: {
          '0%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(10, 122, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(10, 122, 255, 0.6)' },
        },
      },

      // ===== SPACING =====
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },

      // ===== BORDER RADIUS =====
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ===== BOX SHADOW =====
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 40px rgba(0, 0, 0, 0.08)',
        'soft-xl': '0 20px 60px rgba(0, 0, 0, 0.1)',
        'glow-primary': '0 0 30px rgba(10, 122, 255, 0.3)',
        'glow-gold': '0 0 30px rgba(212, 148, 31, 0.3)',
        'inner-light': 'inset 0 2px 4px rgba(255, 255, 255, 0.1)',
        'inner-dark': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
      },

      // ===== BACKGROUND IMAGE =====
      backgroundImage: {
        'gradient-church': 'linear-gradient(135deg, #0a7aff 0%, #004aad 100%)',
        'gradient-gold': 'linear-gradient(135deg, #d4941f 0%, #b07a18 100%)',
        'gradient-warm': 'linear-gradient(135deg, #fdf9f0 0%, #fbf0d8 100%)',
        'gradient-cool': 'linear-gradient(135deg, #f0f7ff 0%, #e0eefe 100%)',
      },

      // ===== MIN HEIGHT / WIDTH =====
      minHeight: {
        'screen-75': '75vh',
        'screen-50': '50vh',
      },

      // ===== MAX WIDTH =====
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },

      // ===== Z-INDEX =====
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // ===== TRANSITION =====
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
    },
  },

  // ===== PLUGINS =====
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', // Only use class-based styling
    }),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'), // For more animations
  ],

  // ===== SAFELIST (For dynamic classes) =====
  safelist: [
    'bg-church-500',
    'bg-church-600',
    'bg-gold-500',
    'bg-gold-600',
    'text-church-500',
    'text-church-600',
    'text-gold-500',
    'text-gold-600',
    'border-church-500',
    'border-church-600',
    'border-gold-500',
    'border-gold-600',
    'hover:bg-church-500',
    'hover:bg-church-600',
    'hover:bg-gold-500',
    'hover:bg-gold-600',
    // Add more dynamic classes as needed
  ],
}