import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CHAR_LIMIT } from "@/config";
import { handleKeyInput } from "@/lib/utils";

export default function ScreenCreateDecree({
  uiLang,
  // answer,
  onLeavePrompt,
  disabled = false, // ← new
  // onRejection,
}: {
  uiLang: "en" | "de";
  answer: string;
  onLeavePrompt: (d: string) => void;
  disabled?: boolean; // ← new
  onRejection: () => void;
}) {
  const [newD, setNewD] = useState("");

  const I18N = {
    en: {
      title: "Your Input",
      leave: `Leave a decree that will shape this democracy (Max ${CHAR_LIMIT} characters)`,
      placeholder: "Your decree will be used to make up the foundation of this democracy, add wisely",
      back: "Back",
      add: "Add Decree",
    },
    de: {
      title: "Deine Eingabe",
      leave: `Hinterlasse ein Dekret für andere (Max. ${CHAR_LIMIT} Zeichen)`,
      placeholder: "Schreibe ein Dekret für den Stapel…",
      back: "Zurück",
      add: "Dekret hinzufügen",
    },
  } as const;

  const t = I18N[uiLang];

  return (
    <div
      className={`flex flex-col items-center p-6 w-full max-w-2xl mt-8 text-center transition-opacity ${disabled ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
    >
      {/* <h1 className="text-3xl font-semibold mb-2">{t.title}</h1>
      <div className="bg-white/5 p-4 rounded text-sm mb-6">{answer}</div> */}

      <h2 className="text-md font-medium mb-2">{t.leave}</h2>
      <Textarea
        placeholder={t.placeholder}
        value={newD}
        onChange={(e) => {
          if (e.target.value.length > CHAR_LIMIT) return;
          setNewD(e.target.value);
        }}
        onKeyDown={(e) => {
          if (newD.length >= CHAR_LIMIT) return;
          handleKeyInput(e, "thought");
        }}
        className="min-h-[140px] mb-4"
        disabled={disabled}
      />
      <div className="flex gap-2 justify-end">

        <Button
          onClick={() => {
            if (!newD.trim()) return;
            onLeavePrompt(newD.trim());
            setNewD("");
          }}
          disabled={disabled || !newD.trim()} // ← disable button if unanswered
        >
          {t.add}
        </Button>
      </div>
    </div>
  );
}