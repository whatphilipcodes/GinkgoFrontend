import type { InputLang } from "@/lib/types";

type UiKeys = keyof typeof I18N.en;

type Translator = (key: UiKeys) => string;

export const I18N: Record<InputLang, Record<string, string>> = {
  en: {
    nav_choose: "Choose a Question",
    nav_answer: "Submit your Voice",
    nav_leave: "Leave a Question",
    idle_title: "Click on a question to answer it.",
    idle_hint:
      "By responding to a question, you actively contribute to this evolving democracy. Your input can shape it in different ways. Share your perspective and observe how the tree transforms through collective voices.",
    final_title: "How would you like to participate in this democracy?",
    final_hint:
      "You can either leave a question for the next visitor or add a value that will shape this democracy.",
    final_prompt_button: "Leave Question",
    final_decree_button: "Add Value",
    lang: "Language",
    refresh: "Refresh questions",
  },
  de: {
    nav_choose: "Wähle eine Frage",
    nav_answer: "Antwort eingeben",
    nav_leave: "Frage hinzufügen",
    idle_title: "Klicke eine Frage an, um sie zu beantworten.",
    idle_hint:
      "Mit deiner Antwort trägst du aktiv zu dieser sich entwickelnden Demokratie bei. Dein Beitrag kann sie auf unterschiedliche Weise prägen. Teile deine Perspektive und beobachte, wie sich der Baum durch die Stimmen aller verändert.",
    final_title: "Wie möchtest du dich an dieser Demokratie beteiligen?",
    final_hint:
      "Du kannst eine Frage für die nächste Person hinterlassen oder einen Wert hinzufügen, der diese Demokratie prägt.",
    final_prompt_button: "Frage hinterlassen",
    final_decree_button: "Wert hinzufügen",
    lang: "Sprache",
    refresh: "Questions neu mischen",
  },
};

export function makeTranslator(lang: InputLang): Translator {
  return (key) => I18N[lang][key];
}
