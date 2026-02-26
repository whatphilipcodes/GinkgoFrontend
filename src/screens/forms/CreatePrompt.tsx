import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CHAR_LIMIT } from "@/config";
import { handleKeyInput } from "@/lib/utils";
import type { InputLang, InputType } from "@/lib/types";

const COPY = {
  en: {
    leave: `Leave a new prompt for others (Max ${CHAR_LIMIT} characters)`,
    placeholder: "Write a prompt to add to the pile…",
    add: "Add Prompt",
  },
  de: {
    leave: `Hinterlasse einen neuen Prompt für andere (Max. ${CHAR_LIMIT} Zeichen)`,
    placeholder: "Schreibe einen Prompt für den Stapel…",
    add: "Prompt hinzufügen",
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

  const handleChange = (raw: string) => {
    const sanitized = raw.replace(/[^A-Za-zäöüßÄÖÜ0-9 ]/g, "").slice(0, CHAR_LIMIT);
    setValue(sanitized);
  };

  return (
    <div className={`flex flex-col items-center p-6 w-full max-w-2xl mt-8 text-center transition-opacity ${disabled ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
      <h2 className="text-md font-medium mb-2">{t.leave}</h2>
      <Textarea
        placeholder={t.placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
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
        >
          {t.add}
        </Button>
      </div>
    </div>
  );
}
