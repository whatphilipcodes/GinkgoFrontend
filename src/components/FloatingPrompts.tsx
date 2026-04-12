import { useMemo } from "react";
import type { Prompt } from "@/lib/types";

type DisplayPrompt = {
  id: string;
  text: string;
  q: Prompt;
};

export default function FloatingPrompts({
  prompts,
  onSelect,
}: {
  prompts: DisplayPrompt[];
  onSelect: (p: DisplayPrompt) => void;
}) {
  const items = useMemo(() => {
    return prompts.map((p, i) => {
      const top = 8 + ((i * 13) % 80);
      const left = (i * 37) % 92;
      const duration = 8 + (i % 7);
      const delay = (i % 5) * 0.4;
      return { p, top: `${top}%`, left: `${left}%`, duration, delay };
    });
  }, [prompts]);

  return (
    <div className="relative w-full h-[70vh]">
      {items.map((it) => (
        <button
          key={it.p.id}
          onClick={() => onSelect(it.p)}
          className="floating-prompt absolute px-6 py-3 bg-white/10 backdrop-blur rounded-full text-md text-white/90 hover:scale-105 hover:z-10 focus:outline-none"
          style={{
            top: it.top,
            left: it.left,
            animationDuration: `${it.duration}s`,
            animationDelay: `${it.delay}s`,
          }}
        >
          {it.p.text}
        </button>
      ))}
    </div>
  );
}
