import { CHAR_LIMIT } from "@/config";
import type { InputLang } from "@/lib/types";

export const THOUGHT_COPY: Record<InputLang, Record<string, string>> = {
  en: {
    shareTitle: "Share your voice",
    shareHint: `Share your thoughts below. Once you have contributed to this democracy you will be able to leave a question for other participants or add a value that will shape this democracy (Max ${CHAR_LIMIT} characters).`,
    placeholder: "I think…",
    back: "Back",
    submit: "Submit",
  },
  de: {
    shareTitle: "Teile deine Stimme",
    shareHint: `Teile unten deine Gedanken. Sobald du zu dieser Demokratie beigetragen hast, kannst du eine Frage für andere Teilnehmende hinterlassen oder einen Wert hinzufügen, der diese Demokratie mitgestaltet.
 (Max. ${CHAR_LIMIT} Zeichen)` ,
    placeholder: "Ich denke…",
    back: "Zurück",
    submit: "Absenden",
  },
};
