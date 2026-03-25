import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { InputLang, InputType } from "@/lib/types";
import { ThoughtForm } from "@/screens/thought/ThoughtForm";
import { ThoughtSend } from "@/screens/thought/ThoughtSend";
import { THOUGHT_COPY } from "@/screens/thought/copy";

interface ThoughtScreenProps {
  uiLang: InputLang;
  prompt?: { id: string; text: string } | null;
  onSubmit: (text: string) => Promise<boolean>;
  onBack: () => void;
  onRejection: () => void;
  onKeystroke?: (key: string, context: InputType) => boolean | void;
}

export default function ThoughtScreen({ uiLang, prompt, onSubmit, onBack, onKeystroke }: ThoughtScreenProps) {
  const [answer, setAnswer] = useState("");
  const [phase, setPhase] = useState<"form" | "send">("form");
  const [viewportH, setViewportH] = useState(900);
  const submitPromiseRef = useRef<Promise<boolean> | null>(null);
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
            onSubmit={() => {
              const trimmed = answer.trim();
              if (!trimmed || submitPromiseRef.current) return;
              submitPromiseRef.current = onSubmit(trimmed);
              setPhase("send");
            }}
            onBack={onBack}
            onKeystroke={onKeystroke}
          />
        )}

        {phase === "send" && (
          <ThoughtSend
            answer={answer}
            flyY={flyY}
            onDone={async () => {
              const pendingSubmit = submitPromiseRef.current;
              submitPromiseRef.current = null;

              // End the animation before we start waiting so the loading spinner stays visible
              setPhase("form");
              if (!pendingSubmit) return;

              const ok = await pendingSubmit;
              if (!ok) {
                return;
              }
              setAnswer("");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
