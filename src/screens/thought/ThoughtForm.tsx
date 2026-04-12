import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CHAR_LIMIT } from "@/config";
import { handleKeyInput } from "@/lib/utils";
import type { InputLang, InputType } from "@/lib/types";
import { THOUGHT_COPY } from "@/screens/thought/copy";

interface ThoughtFormProps {
  uiLang: InputLang;
  promptText?: string;
  answer: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onKeystroke?: (key: string, context: InputType) => boolean | void;
}

export function ThoughtForm({ uiLang, promptText, answer, onChange, onSubmit, onBack, onKeystroke }: ThoughtFormProps) {
  const t = THOUGHT_COPY[uiLang];
  return (
    <motion.div key="form" initial={{ opacity: 0, y: 10, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10, filter: "blur(10px)" }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col items-center p-6">
      <div className="w-full max-w-2xl mt-8 text-center">
        <h1 className="text-3xl font-semibold mb-2">{promptText ?? t.shareTitle}</h1>
        <p className="text-sm text-neutral-400 mb-6">{t.shareHint}</p>
        <Textarea
          placeholder={t.placeholder}
          value={answer}
          onChange={(e) => { if (e.target.value.length <= CHAR_LIMIT) onChange(e.target.value); }}
          onKeyDown={(e) => { if (answer.length < CHAR_LIMIT) handleKeyInput(e, "thought", onKeystroke); }}
          className="min-h-[180px] mb-4"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onBack} className="text-neutral-300">{t.back}</Button>
          <Button onClick={onSubmit} disabled={!answer.trim()} className={answer.trim() ? "bg-white/20 border-white/40" : "bg-white/5 border-white/20 hover:bg-white/10"}>{t.submit}</Button>
        </div>
      </div>
    </motion.div>
  );
}
