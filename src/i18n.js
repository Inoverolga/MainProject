import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    ru: {
      translation: {
        appName: "Система управления запасами",
        search: "Поиск...",
        hello: "Здравствуйте",
        logout: "Выйти",
        profile: "Личный кабинет",
        admin: "Админка",
        personalAccount: "👤 Личный кабинет",
        myInventories: "📁 Мои инвентари",
        accessibleInventories: "🔗 Доступные инвентари",
        createInventory: "＋ Создать инвентарь",
        noInventories: "У вас пока нет инвентарей",
        noAccessInventories: "У вас нет доступа к чужим инвентарям",
      },
    },
    en: {
      translation: {
        appName: "Inventory Management System",
        search: "Search...",
        hello: "Hello",
        logout: "Logout",
        profile: "Profile",
        admin: "Admin",
        personalAccount: "👤 Personal Account",
        myInventories: "📁 My Inventories",
        accessibleInventories: "🔗 Accessible Inventories",
        createInventory: "＋ Create Inventory",
        noInventories: "You don't have any inventories yet",
        noAccessInventories: "You don't have access to other inventories",
      },
    },
  },
  lng: localStorage.getItem("language") || "ru",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
