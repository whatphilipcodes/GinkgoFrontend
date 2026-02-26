import FloatingPrompts from "@/components/FloatingPrompts";
import type { InputLang, Prompt } from "@/lib/types";
import { promptText } from "./promptUtils";

export type DisplayPrompt = {
  id: string;
  text: string;
  q: Prompt;
};

interface IdleScreenProps {
  heading: string;
  hint: string;
  prompts: DisplayPrompt[];
  onSelect: (prompt: DisplayPrompt) => void;
  onRefresh: () => void;
  refreshLabel: string;
}

export function makeDisplayPrompts(prompts: Prompt[], lang: InputLang): DisplayPrompt[] {
  return prompts.map((p) => ({ id: p.id, q: p, text: promptText(p, lang) }));
}

export default function IdleScreen({
  heading,
  hint,
  prompts,
  onSelect,
  onRefresh,
  refreshLabel,
}: IdleScreenProps) {
  return (
    <section>
      <h1 className="text-3xl font-semibold mb-6 text-center">{heading}</h1>

      <p className="text-center text-sm text-neutral-300/80 max-w-0.4xl mx-auto mb-4">{hint}</p>

      <div className="flex items-center justify-center mb-4">
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/0 hover:bg-white/35 border border-white/15 text-sm text-white transition"
        >
          <i className="bi bi-arrow-clockwise text-base leading-none" />
          <span>{refreshLabel}</span>
        </button>
      </div>

      <FloatingPrompts prompts={prompts} onSelect={onSelect} />
    </section>
  );
}
