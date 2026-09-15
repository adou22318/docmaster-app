/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Tous les tokens référencent des CSS variables définies dans index.css
        // Cela permet au dark mode (classe .dark sur <html>) de fonctionner automatiquement
        "primary":                    "var(--color-primary)",
        "on-primary":                 "var(--color-on-primary)",
        "primary-container":          "var(--color-primary-container)",
        "on-primary-container":       "var(--color-on-primary-container)",
        "secondary":                  "var(--color-secondary)",
        "on-secondary":               "var(--color-on-secondary)",
        "secondary-container":        "var(--color-secondary-container)",
        "on-secondary-container":     "var(--color-on-secondary-container)",
        "tertiary":                   "var(--color-tertiary)",
        "on-tertiary":                "var(--color-on-tertiary)",
        "tertiary-container":         "var(--color-tertiary-container)",
        "on-tertiary-container":      "var(--color-on-tertiary-container)",
        "error":                      "var(--color-error)",
        "on-error":                   "var(--color-on-error)",
        "error-container":            "var(--color-error-container)",
        "on-error-container":         "var(--color-on-error-container)",
        "background":                 "var(--color-background)",
        "on-background":              "var(--color-on-background)",
        "surface":                    "var(--color-surface)",
        "on-surface":                 "var(--color-on-surface)",
        "surface-variant":            "var(--color-surface-variant)",
        "on-surface-variant":         "var(--color-on-surface-variant)",
        "surface-container-lowest":   "var(--color-surface-container-lowest)",
        "surface-container-low":      "var(--color-surface-container-low)",
        "surface-container":          "var(--color-surface-container)",
        "surface-container-high":     "var(--color-surface-container-high)",
        "surface-container-highest":  "var(--color-surface-container-highest)",
        "surface-dim":                "var(--color-surface-dim)",
        "surface-bright":             "var(--color-surface-bright)",
        "outline":                    "var(--color-outline)",
        "outline-variant":            "var(--color-outline-variant)",
        "inverse-surface":            "var(--color-inverse-surface)",
        "inverse-on-surface":         "var(--color-inverse-on-surface)",
        "inverse-primary":            "var(--color-inverse-primary)",
        "surface-tint":               "var(--color-surface-tint)",
        // Tokens fixes (ne changent pas en dark mode)
        "primary-fixed":              "#e2e2e5",
        "primary-fixed-dim":          "#c6c6c9",
        "secondary-fixed":            "#ffdea3",
        "secondary-fixed-dim":        "#fdbc13",
        "on-primary-fixed":           "#1a1c1e",
        "on-primary-fixed-variant":   "#454749",
        "on-secondary-fixed":         "#261900",
        "on-secondary-fixed-variant": "#5d4200",
        "tertiary-fixed":             "#ffdbcd",
        "tertiary-fixed-dim":         "#ffb595",
        "on-tertiary-fixed":          "#351000",
        "on-tertiary-fixed-variant":  "#7c2e00",
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "offset-shift": "48px",
        "container-max": "1440px",
        "margin-mobile": "20px",
        "gutter": "32px",
        "unit": "8px",
        "margin-desktop": "64px"
      },
      fontFamily: {
        "body-md": ["Plus Jakarta Sans"],
        "display-xl": ["Syne"],
        "body-lg": ["Plus Jakarta Sans"],
        "headline-md": ["Syne"],
        "label-bold": ["Plus Jakarta Sans"],
        "headline-lg": ["Syne"],
        "label-sm": ["Plus Jakarta Sans"],
        "headline-lg-mobile": ["Syne"]
      },
      fontSize: {
        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "display-xl": ["64px", {"lineHeight": "72px", "letterSpacing": "-0.02em", "fontWeight": "800"}],
        "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
        "headline-md": ["28px", {"lineHeight": "34px", "fontWeight": "700"}],
        "label-bold": ["14px", {"lineHeight": "20px", "letterSpacing": "0.05em", "fontWeight": "700"}],
        "headline-lg": ["40px", {"lineHeight": "48px", "letterSpacing": "-0.01em", "fontWeight": "700"}],
        "label-sm": ["12px", {"lineHeight": "16px", "fontWeight": "500"}],
        "headline-lg-mobile": ["32px", {"lineHeight": "38px", "fontWeight": "700"}]
      }
    }
  },
  plugins: [],
}
