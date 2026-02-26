import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { InputLang } from "@/lib/types";
import { ThoughtForm } from "@/screens/flow/thought/ThoughtForm";
import { ThoughtSend } from "@/screens/flow/thought/ThoughtSend";
import { THOUGHT_COPY } from "@/screens/flow/thought/copy";

interface ThoughtScreenProps {
  uiLang: InputLang;
  prompt?: { id: string; text: string } | null;
  onSubmit: (text: string) => void;
  onBack: () => void;
  onRejection: () => void;
}

export default function ThoughtScreen({ uiLang, prompt, onSubmit, onBack }: ThoughtScreenProps) {
  const [answer, setAnswer] = useState("");
  const [phase, setPhase] = useState<"form" | "send">("form");
  const [viewportH, setViewportH] = useState(900);
  const flyY = useMemo(() => -(viewportH / 2 + Math.max(120, viewportH * 0.25)), [viewportH]);

  useEffect(() => {
    const update = () => setViewportH(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="relative bg-transparent">
      <AnimatePresence mode="wait">
        {phase === "form" && (
          <ThoughtForm
            uiLang={uiLang}
            promptText={prompt?.text ?? THOUGHT_COPY[uiLang].shareTitle}
            answer={answer}
            onChange={setAnswer}
            onSubmit={() => { if (!answer.trim()) return; setPhase("send"); }}
            onBack={onBack}
          />
        )}

        {phase === "send" && (
          <ThoughtSend
            answer={answer}
            flyY={flyY}
            onDone={() => { onSubmit(answer.trim()); setAnswer(""); setPhase("form"); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
