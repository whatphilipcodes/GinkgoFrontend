import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CHAR_LIMIT } from "@/config";
import { handleKeyInput } from "@/lib/utils";
import type { InputLang, InputType } from "@/lib/types";

const COPY = {
  en: {
    leave: `Leave a decree that will shape this democracy (Max ${CHAR_LIMIT} characters)`,
    placeholder: "Your decree will be used to make up the foundation of this democracy, add wisely",
    add: "Add Decree",
  },
  de: {
    leave: `Hinterlasse ein Dekret für andere (Max. ${CHAR_LIMIT} Zeichen)`,
    placeholder: "Schreibe ein Dekret für den Stapel…",
    add: "Dekret hinzufügen",
  },
} as const;

interface CreateDecreeProps {
  uiLang: InputLang;
  answer: string;
  onLeavePrompt: (text: string) => Promise<void> | void;
  disabled?: boolean;
  onRejection: () => void;
  onKeystroke?: (key: string, context: InputType) => boolean | void;
}

export default function CreateDecree({ uiLang, onLeavePrompt, disabled, onKeystroke }: CreateDecreeProps) {
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
        onKeyDown={(e) => { if (value.length < CHAR_LIMIT) handleKeyInput(e, "decree", onKeystroke); }}
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
