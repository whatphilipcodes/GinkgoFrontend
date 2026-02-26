import { useMemo } from "react";

type Prompt = {
  id: string;
  text: string;
  q: any; // original prompt object kept by parent
};

export default function FloatingPrompts({
  prompts,
  onSelect,
}: {
  prompts: Prompt[];
  onSelect: (p: Prompt) => void;
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
          className="floating-prompt absolute px-3 py-1 bg-white/10 backdrop-blur rounded-full text-sm text-white/90 hover:scale-105 focus:outline-none"
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
