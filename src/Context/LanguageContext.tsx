import { createContext, useContext, useEffect, useState } from "react";
import i18n from "i18next";

type LanguageContextType = {
  lang: string;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState(
    localStorage.getItem("lang") || "en"
  );

  useEffect(() => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);

    // 🔁 RTL / LTR switch
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
