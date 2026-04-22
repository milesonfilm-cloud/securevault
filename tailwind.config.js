/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'Menlo', 'monospace'],
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        'wellness-sans': ['var(--font-wellness-sans)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
        'wellness-serif': ['var(--font-wellness-serif)', 'Georgia', 'serif'],
        'neon-stack': ['var(--font-neon-stack)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
        pastel: ['var(--font-pastel)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        400: '400',
        500: '500',
        600: '600',
        700: '700',
        800: '800',
      },
      colors: {
        /* Sleep & wellness mock / light shell theme */
        wellness: {
          bg: '#D6E8F0',
          card: '#FFFFFF',
          teal: '#6BB8CC',
          peach: '#E8C4A0',
          pink: '#F2D4D4',
          yellow: '#FAF0D4',
          blueCard: '#D6EAF2',
          ink: '#1A1A2E',
          muted: '#8A8A9A',
          coral: '#E07070',
          nav: '#1A1A2E',
        },
        /* Theme tokens — values switch via [data-theme] on <html> (see tailwind.css) */
        vault: {
          bg: 'var(--vault-c-bg)',
          panel: 'var(--vault-c-panel)',
          elevated: 'var(--vault-c-elevated)',
          warm: 'var(--vault-c-warm)',
          coral: 'var(--vault-c-coral)',
          ink: 'var(--vault-c-ink)',
          text: 'var(--vault-c-text)',
          muted: 'var(--vault-c-muted)',
          faint: 'var(--vault-c-faint)',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        vault: 'var(--vault-shadow)',
        'wellness-card': '0 4px 20px rgba(0,0,0,0.06)',
        'pastel-card': '0 12px 44px rgba(15, 23, 42, 0.09)',
      },
    },
  },
  plugins: [],
};
