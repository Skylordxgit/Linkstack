import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        float: { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-8px)" } },
        "pulse-soft": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.6" } },
        glow: {
          "0%,100%": { boxShadow: "0 0 20px 0 rgba(168,85,247,0.35)" },
          "50%": { boxShadow: "0 0 36px 6px rgba(168,85,247,0.55)" },
        },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        tilt: { "0%,100%": { transform: "rotate(-1deg)" }, "50%": { transform: "rotate(1deg)" } },
        "bounce-soft": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        aurora: { "0%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" }, "100%": { backgroundPosition: "0% 50%" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 3.5s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2.2s ease-in-out infinite",
        glow: "glow 2.4s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        tilt: "tilt 4s ease-in-out infinite",
        "bounce-soft": "bounce-soft 1.6s ease-in-out infinite",
        aurora: "aurora 12s ease infinite",
      },
      backgroundSize: {
        "shimmer-size": "200% 100%",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
