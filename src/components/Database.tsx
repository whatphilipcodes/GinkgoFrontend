import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CHAR_LIMIT } from "@/config";

export default function Database({
  uiLang,
  // answer,
  onLeavePrompt,
  disabled = false, // ← new
  onRejection,
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
      className={`flex flex-col items-center p-6 w-full max-w-2xl mt-8 text-center transition-opacity ${
        disabled ? "opacity-50 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* <h1 className="text-3xl font-semibold mb-2">{t.title}</h1>
      <div className="bg-white/5 p-4 rounded text-sm mb-6">{answer}</div> */}

      <h2 className="text-md font-medium mb-2">{t.leave}</h2>
      <Textarea
        placeholder={t.placeholder}
        value={newD}
        onChange={(e) => {
          const raw = e.target.value;
          // Allow letters A-Z/a-z, German chars (äöüß), numbers 0-9, and spaces. Strip anything else.
          const sanitized = raw.replace(/[^A-Za-zäöüßÄÖÜ0-9 ]/g, "");
          // Enforce character limit
          if (sanitized.length > CHAR_LIMIT) return;
          const prev = newD;

          if (sanitized.length > prev.length) {
            let start = 0;
            while (start < prev.length && prev[start] === sanitized[start]) {
              start++;
            }

            let prevEnd = prev.length - 1;
            let newEnd = sanitized.length - 1;
            while (prevEnd >= start && prev[prevEnd] === sanitized[newEnd]) {
              prevEnd--;
              newEnd--;
            }

            const added = sanitized.slice(start, newEnd + 1);
            for (const ch of added) {
              console.log({ key: ch, context: "decree" });
            }
          }

          setNewD(sanitized);
        }}
        onKeyDown={(e) => {
          if (e.key === " " || e.code === "Space") {
            console.log({ key: "space", context: "decree" });
          } else if (e.key === "Enter") {
            console.log({ key: "return", context: "decree" });
            e.preventDefault();
          }
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
