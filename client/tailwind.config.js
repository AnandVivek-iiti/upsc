/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Inter'", "'Segoe UI'", "sans-serif"],
        body: ["'Inter'", "'Segoe UI'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        bg: {
          base: "var(--bg-base)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
          border: "var(--bg-border)",
          muted: "var(--bg-muted)",
        },
        accent: {
          gold: "var(--accent-gold)",
          "gold-dim": "var(--accent-gold-dim)",
          blue: "var(--accent-blue)",
          "blue-dim": "var(--accent-blue-dim)",
          green: "var(--accent-green)",
          red: "var(--accent-red)",
          purple: "var(--accent-purple)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          inverse: "var(--text-inverse)",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "stream-in": "streamIn 0.15s ease-out",
        blink: "blink 1s step-end infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        pulseSoft: { "0%,100%": { opacity: 0.7 }, "50%": { opacity: 1 } },
        streamIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        blink: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0 } },
      },
    },
  },
  plugins: [],
};
