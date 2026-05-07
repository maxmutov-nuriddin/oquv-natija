import { createContext, useContext, useState } from "react";
import { uz } from "./uz";
import { ru } from "./ru";

const dicts = { uz, ru };
const LangCtx = createContext({ lang: "uz", t: uz, setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("oquv_lang") || "uz");

  function setLang(l) {
    localStorage.setItem("oquv_lang", l);
    setLangState(l);
  }

  return (
    <LangCtx.Provider value={{ lang, t: dicts[lang] || uz, setLang }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useT() {
  return useContext(LangCtx);
}
