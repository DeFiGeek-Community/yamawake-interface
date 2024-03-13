import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { localeAtom } from "lib/store";
import en from "lib/locales/en/index";
import ja from "lib/locales/ja/index";

export const useLocale = () => {
  const [locale, setLocale] = useAtom(localeAtom);
  const [t, setT] = useState(en);

  const setStorageLocale = (locale: "ja" | "en") => {
    localStorage.setItem("locale", locale);
    setLocale(locale);
  };

  const tWithReplaceText = (key: keyof typeof t, vals?: { [key: string]: string }): string => {
    let s: string = t[key];
    if (!s) return key;
    if (vals) {
      Object.entries(vals).forEach(([key, value]) => {
        s = s.replace(`{{${key}}}`, value);
      });
    }
    return s;
  };

  useEffect(() => {
    const userLanguage = navigator.language.split("-")[0].toLowerCase();
    const defaultLocale = ["ja", "en"].includes(userLanguage) ? userLanguage : "en";
    const value = (localStorage.getItem("locale") as "ja" | "en") || defaultLocale;
    setLocale(value);
  }, []);

  useEffect(() => {
    setT(locale === "en" ? en : ja);
  }, [locale]);

  return { t: tWithReplaceText, setLocale: setStorageLocale, locale };
};
