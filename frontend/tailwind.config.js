/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cine: {
          bg: "#0A0B0E",
          card: "#12141A",
          border: "#20242F",
          gold: "#F5C518",
          amber: "#F59E0B",
          red: "#E50914",
          blue: "#38BDF8",
          purple: "#A855F7",
          green: "#10B981",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        "marquee-left": "marquee-left 28s linear infinite",
        "marquee-right": "marquee-right 28s linear infinite",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "marquee-left": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-right": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: 1, filter: "drop-shadow(0 0 15px rgba(245, 197, 24, 0.6))" },
          "50%": { opacity: 0.7, filter: "drop-shadow(0 0 5px rgba(245, 197, 24, 0.2))" },
        },
      },
    },
  },
  plugins: [],
};

