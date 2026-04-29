export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#0a0f1a",
        panel: "#101827",
        line: "#263244",
        mint: "#3dd7a8",
        gold: "#f4bf4f",
        coral: "#fb7185"
      },
      boxShadow: {
        glow: "0 18px 70px rgba(56, 211, 159, 0.14)"
      }
    }
  },
  plugins: []
};
