import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function FinalScreen({
  uiLang,
  // answer,
  onLeavePrompt,

   disabled = false, // ← new
}: {
  uiLang: "en" | "de";
  answer: string;
  onLeavePrompt: (p: string) => void;

    disabled?: boolean; // ← new
}) {
  const [newP, setNewP] = useState("");

  const I18N = {
    en: {
      title: "Your Input",
      leave: "Leave a new prompt for others",
      placeholder: "Write a prompt to add to the pile…",
      back: "Back",
      add: "Add Prompt",
    },
    de: {
      title: "Deine Eingabe",
      leave: "Hinterlasse einen neuen Prompt für andere",
      placeholder: "Schreibe einen Prompt für den Stapel…",
      back: "Zurück",
      add: "Prompt hinzufügen",
    },
  } as const;

  const t = I18N[uiLang];

  return (
    <div
      className={`flex flex-col items-center p-6 w-full max-w-2xl mt-8 text-center transition-opacity ${
        disabled ? "opacity-50 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* <h1 className="text-3xl font-semibold mb-2">{t.title}</h1>
      <div className="bg-white/5 p-4 rounded text-sm mb-6">{answer}</div> */}

      <h2 className="text-md font-medium mb-2">{t.leave}</h2>
      <Textarea
        placeholder={t.placeholder}
        value={newP}
        onChange={(e) => setNewP(e.target.value)}
        className="min-h-[140px] mb-4"
        disabled={disabled} // ← disable textarea
      />
      <div className="flex gap-2 justify-end">
     
        <Button
          onClick={() => {
            if (!newP.trim()) return;
            onLeavePrompt(newP.trim());
            setNewP("");
          }}
          disabled={disabled || !newP.trim()} // ← disable button if unanswered
        >
          {t.add}
        </Button>
      </div>
    </div>
  );
}
