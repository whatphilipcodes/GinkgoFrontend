import { useEffect, useMemo, useState } from "react";
import type { UILang } from "@/lib/types";
import { makeTranslator } from "@/screens/uiCopy";

export function useLanguage(storageKey: string) {
  const [uiLang, setUiLang] = useState<UILang>(() => {
    const raw = localStorage.getItem(storageKey);
    return raw === "de" || raw === "en" ? raw : "en";
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, uiLang);
    } catch {
      /* ignore */
    }
  }, [storageKey, uiLang]);

  const t = useMemo(() => makeTranslator(uiLang), [uiLang]);

  return { uiLang, setUiLang, t };
}
