/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        accent: "var(--color-accent)",
        "accent-foreground": "var(--color-accent-foreground)",
        ink: "var(--color-ink)",
        "ink-muted": "var(--color-ink-muted)",
        "ink-faint": "var(--color-ink-faint)",
        elevated: "var(--color-elevated)",
        rule: "var(--color-rule)",
        "rule-strong": "var(--color-rule-strong)",
      },
      // One family everywhere — the display/mono aliases resolve to it so type
      // roles stay expressed by treatment, not by swapping typefaces.
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Fluid editorial display sizes — big type that scales without breakpoints.
        "display-sm": ["clamp(2.25rem, 5vw, 3.5rem)", { lineHeight: "0.98" }],
        "display-md": ["clamp(3rem, 8vw, 6rem)", { lineHeight: "0.94" }],
        "display-base": ["clamp(3rem, 9vw, 7rem)", { lineHeight: "0.94" }],
        "display-lg": ["clamp(3.5rem, 11vw, 9rem)", { lineHeight: "0.9" }],
      },
      maxWidth: {
        container: "88rem",
      },
      keyframes: {
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-2%, -3%)" },
          "30%": { transform: "translate(3%, 2%)" },
          "50%": { transform: "translate(-1%, 3%)" },
          "70%": { transform: "translate(2%, -1%)" },
          "90%": { transform: "translate(-3%, 1%)" },
        },
      },
      animation: {
        grain: "grain 8s steps(10) infinite",
      },
    },
  },
  plugins: [],
};
