import { useEffect, useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

type Phase = "form" | "send";

export default function PromptScreen({
  uiLang,
  prompt,
  //  hasAnswered = false, // default false
  onSubmit,
  onBack,
  onRejection,
}: {
  uiLang: "en" | "de";
  prompt?: { id: string; text: string } | null;
    hasAnswered?: boolean; // ← add this
  onSubmit: (answer: string) => void;
  onBack: () => void;
  onRejection: () => void;
}) {
  const [answer, setAnswer] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [viewport, setViewport] = useState({ w: 1440, h: 900 });

  // keep viewport sizes accurate (desktop resize / kiosk screens)
  useEffect(() => {
    const update = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const I18N = {
    en: {
      shareTitle: "Share your voice",
      shareHint: "Share your thoughts below. Once you have contributed to this democracy you will be able to leave a prompt for other participants or add a decree that will shape this democracy (Max 400 characters).",
      placeholder: "I think…",
      back: "Back",
      submit: "Submit",
    },
    de: {
      shareTitle: "Teile deine Stimme",
      shareHint: "Schreibe deine Meinung hier unten (Max. 400 Zeichen)",
      placeholder: "Ich denke…",
      back: "Zurück",
      submit: "Absenden",
    },
  } as const;

  const t = I18N[uiLang];

  // fly past the top (negative y), proportional to screen height
  const flyY = useMemo(() => {
    const overshoot = Math.max(120, viewport.h * 0.25);
    return -(viewport.h / 2 + overshoot);
  }, [viewport.h]);

  const handleSubmit = () => {
    const trimmed = answer.trim();
    if (!trimmed) return;
    setPhase("send");
  };

  return (
    <div className=" relative bg-transparent">
      <AnimatePresence mode="wait">
        {phase === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className=" flex flex-col items-center p-6"
          >
            <div className="w-full max-w-2xl mt-8 text-center">
              <h1 className="text-3xl font-semibold mb-2">
                {prompt?.text ?? t.shareTitle}
              </h1>
              <p className="text-sm text-neutral-400 mb-6">{t.shareHint}</p>

              <Textarea
                placeholder={t.placeholder}
                value={answer}
                onChange={(e) => {
                  const raw = e.target.value;
                  // Allow letters A-Z/a-z, German chars (äöüß), numbers 0-9, and spaces. Strip anything else.
                  const sanitized = raw.replace(/[^A-Za-zäöüßÄÖÜ0-9 ]/g, "");
                  // Enforce 400 character limit
                  if (sanitized.length > 400) return;
                  const prev = answer;

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
                      console.log({ key: ch, context: "opinion" });
                    }
                  }

                  // Update state with sanitized value (blocks non-letters)
                  setAnswer(sanitized);
                }}
                onKeyDown={(e) => {
                  // Space: log but allow insertion
                  if (e.key === " " || e.code === "Space") {
                    console.log({ key: "space" });
                    // do not preventDefault so space is inserted
                  } else if (e.key === "Enter") {
                    // Enter should submit the form (prevent newline)
                    console.log({ key: "return" });
                    e.preventDefault();
                    
                  }
                }}
                className="min-h-[180px] mb-4"
              />

              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="text-neutral-300"
                >
                  {t.back}
                </Button>

                <Button onClick={handleSubmit} disabled={!answer.trim()}>
                  {t.submit}
                </Button>
            

              </div>
            </div>
          </motion.div>
        )}

        {phase === "send" && (
          <motion.div
            key="send"
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{
              // keep background subtle; dot is the hero
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(6px)",
            }}
          >
            {/* ONE dot only */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 0 }}
              animate={{
                // step 1: appear + slowly grow (still centered)
                opacity: [0, 1, 1, 0],
                scale: [0.7, 1.9, 0.55],
                // step 2: fly up past the top
                y: [0, 0, flyY],
              }}
              transition={{
                duration: 3.35,
                ease: [0.22, 1, 0.36, 1],
                // 0..0.45 = grow phase, then fly phase
                times: [0, 0.18, 0.72, 1],
              }}
              onAnimationComplete={() => {
                onSubmit(answer.trim());
                setAnswer("");
                setPhase("form");
              }}
              style={{
                width: 26,
                height: 26,
                borderRadius: 9999,
                background: "rgba(255,255,255,0.98)",
                boxShadow:
                  "0 0 55px rgba(255,255,255,0.55), 0 0 140px rgba(255,255,255,0.22)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
