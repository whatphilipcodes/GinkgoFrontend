import type { InputLang } from "@/lib/types";

type UiKeys = keyof typeof I18N.en;

type Translator = (key: UiKeys) => string;

export const I18N: Record<InputLang, Record<string, string>> = {
  en: {
    nav_choose: "Choose a Prompt",
    nav_answer: "Submit your Voice",
    nav_leave: "Leave a Prompt",
    idle_title: "Click a prompt to answer it.",
    idle_hint:
      "By responding to a prompt, you actively contribute to this evolving democracy. Your input can shape it in different ways. Share your perspective and observe how the tree transforms through collective voices.",
    final_title: "How would you like to participate in this democracy?",
    final_hint:
      "You can either leave a prompt for the next visitor or add a decree that will shape this democracy.",
    final_prompt_button: "Leave Prompt",
    final_decree_button: "Add Decree",
    lang: "Language",
    refresh: "Refresh prompts",
  },
  de: {
    nav_choose: "Wähle einen Prompt",
    nav_answer: "Antwort eingeben",
    nav_leave: "Prompt hinzufügen",
    idle_title: "Klicke einen Prompt an, um ihn zu beantworten.",
    idle_hint:
      "Mit deiner Antwort trägst du aktiv zu dieser sich entwickelnden Demokratie bei. Dein Beitrag kann sie auf unterschiedliche Weise prägen. Teile deine Perspektive und beobachte, wie sich der Baum durch die Stimmen aller verändert.",
    final_title: "Wie möchtest du dich an dieser Demokratie beteiligen?",
    final_hint:
      "Du kannst einen Prompt für die nächste Person hinterlassen oder ein Dekret hinzufügen, das diese Demokratie prägt.",
    final_prompt_button: "Prompt hinterlassen",
    final_decree_button: "Dekret hinzufügen",
    lang: "Sprache",
    refresh: "Prompts neu mischen",
  },
};

export function makeTranslator(lang: InputLang): Translator {
  return (key) => I18N[lang][key];
}
