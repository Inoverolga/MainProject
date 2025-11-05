import { useContext } from "react";
import ThemeContext from "../../contexts/ThemeContext.js";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      className="btn btn-outline-secondary"
      onClick={toggleTheme}
      title={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
};

export default ThemeToggle;
