/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Page background
        base: "#302E2B",

        // Panels, cards, bars
        surface: {
          DEFAULT: "#262522",
          raised: "#383734",
          sunken: "#21201D",
        },

        // Hairlines and dividers
        edge: {
          DEFAULT: "#3E3D3A",
          strong: "#4E4D49",
        },

        // Text
        content: {
          DEFAULT: "#FFFFFF",
          muted: "#B4B2AE",
          subtle: "#8B8987",
        },

        // Primary action green — the same green as the logo mark
        accent: {
          DEFAULT: "#81B64C",
          hover: "#A3D160",
          pressed: "#5D9948",
          ink: "#1B2E0C",
        },

        danger: {
          DEFAULT: "#CA3431",
          hover: "#E04A4A",
        },
        warning: "#E8A33D",
        info: "#4A90D9",

        // Board squares, matching assets/board/board.png
        board: {
          light: "#EBECD0",
          dark: "#739552",
          // Square overlays drawn on top of the board image
          highlight: "rgba(255, 241, 120, 0.55)",
          "highlight-soft": "rgba(255, 241, 120, 0.35)",
          check: "rgba(229, 69, 59, 0.55)",
        },
      },
      boxShadow: {
        panel: "0 1px 2px rgba(0, 0, 0, 0.35)",
        raised: "0 4px 12px rgba(0, 0, 0, 0.40)",
        modal: "0 16px 48px rgba(0, 0, 0, 0.55)",
      },
    },
  },
  plugins: [],
};
