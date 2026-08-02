/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Inter is the global default (Tailwind's `font-sans`); Plus Jakarta Sans
        // is the heading face. Both load from Google Fonts via <link> in index.html.
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },

      // ── Design tokens. Single source of truth: DESIGN.md (repo root). ──
      // Literal hex here (not CSS vars) so Tailwind opacity modifiers such as
      // `bg-brand/50` keep working. Pages MUST consume these semantic tokens
      // (bg-brand, text-foreground, rounded-card, …) — never raw indigo-600.
      colors: {
        // Brand
        brand: '#4f46e5',
        'brand-hover': '#4338ca',
        'brand-foreground': '#ffffff',
        'brand-subtle': '#eef2ff',
        'brand-ring': '#6366f1',
        // Gradient pair — logo / hero / active nav. The ONLY gradient in the system.
        'accent-from': '#6366f1',
        'accent-to': '#9333ea',
        'accent-foreground': '#ffffff',
        // Neutrals (slate)
        background: '#ffffff',
        card: '#ffffff',
        muted: '#f8fafc',
        sunken: '#f1f5f9',
        border: '#e2e8f0',
        foreground: '#1e293b',
        'muted-foreground': '#64748b',
        'faint-foreground': '#94a3b8',
        // Status: key (icons/borders) + soft (tinted bg) + strong (fg text) + foreground (on solid)
        success: '#10b981',
        'success-soft': '#d1fae5',
        'success-strong': '#065f46',
        warning: '#f59e0b',
        'warning-soft': '#fef3c7',
        'warning-strong': '#92400e',
        danger: '#ef4444',
        'danger-foreground': '#ffffff',
        'danger-soft': '#fee2e2',
        'danger-strong': '#991b1b',
        info: '#3b82f6',
        'info-soft': '#dbeafe',
        'info-strong': '#1e40af',
      },

      // Radius scale aligned to DESIGN.md (sm 6 / md 8 / lg 12 / xl 16).
      // Role aliases are the preferred form in pages (rounded-card, rounded-button, …).
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        card: '12px',
        button: '8px',
        input: '8px',
        modal: '12px',
      },

      // Two elevation levels only — see DESIGN.md → Elevation & Depth.
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        overlay: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },

      // Heading ramp — pair with `font-heading` + a weight utility.
      fontSize: {
        display: ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'heading-1': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'heading-2': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'heading-3': ['1.375rem', { lineHeight: '1.3' }],
      },
    },
  },
  plugins: [],
}
