import { useTranslation } from "react-i18next";

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "ru" ? "en" : "ru";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  return (
    <button
      className="btn btn-outline-secondary"
      onClick={toggleLanguage}
      title={i18n.language === "en" ? "Switch to Russian" : "Switch to English"}
    >
      {i18n.language === "en" ? "🇷🇺" : "🇺🇸"}
    </button>
  );
};

export default LanguageToggle;
