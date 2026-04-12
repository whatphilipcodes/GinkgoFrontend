import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CHAR_LIMIT } from "@/config";
import { handleKeyInput } from "@/lib/utils";
import type { InputLang, InputType } from "@/lib/types";

const COPY = {
  en: {
    leave: `Leave a new question for others (Max ${CHAR_LIMIT} characters)`,
    placeholder: "Write a question to add to the pile…",
    add: "Add Question",
  },
  de: {
    leave: `Hinterlasse eine neue Frage für andere (Max. ${CHAR_LIMIT} Zeichen)`,
    placeholder: "Schreibe eine Frage für den Stapel…",
    add: "Frage hinzufügen",
  },
} as const;

interface CreatePromptProps {
  uiLang: InputLang;
  answer: string;
  onLeavePrompt: (text: string) => Promise<void> | void;
  disabled?: boolean;
  onRejection: () => void;
  onKeystroke?: (key: string, context: InputType) => boolean | void;
}

export default function CreatePrompt({ uiLang, onLeavePrompt, disabled, onKeystroke }: CreatePromptProps) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const t = COPY[uiLang];

  return (
    <div className={`flex flex-col items-center p-6 w-full max-w-2xl mt-8 text-center transition-opacity ${disabled ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
      <h2 className="text-md font-medium mb-2">{t.leave}</h2>
      <Textarea
        placeholder={t.placeholder}
        value={value}
        onChange={(e) => { if (e.target.value.length <= CHAR_LIMIT) setValue(e.target.value); }}
        onKeyDown={(e) => { if (value.length < CHAR_LIMIT) handleKeyInput(e, "prompt", onKeystroke); }}
        className="min-h-[140px] mb-4"
        disabled={disabled || submitting}
      />
      <div className="flex gap-2 justify-end">
        <Button
          onClick={async () => {
            if (!value.trim()) return;
            setSubmitting(true);
            await onLeavePrompt(value.trim());
            setSubmitting(false);
            setValue("");
          }}
          disabled={disabled || submitting || !value.trim()}
          className={value.trim() && !disabled && !submitting ? "bg-white/20 border-white/40" : "bg-white/5 border-white/20 hover:bg-white/10"}
        >
          {t.add}
        </Button>
      </div>
    </div>
  );
}
