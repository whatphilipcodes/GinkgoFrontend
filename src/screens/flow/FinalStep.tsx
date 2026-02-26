import ScreenCreateDecree from "@/screens/flow/forms/CreateDecree";
import ScreenCreatePrompt from "@/screens/flow/forms/CreatePrompt";
import type { InputLang } from "@/lib/types";

export type FinalMode = "prompt" | "decree" | null;

interface FinalStepProps {
  uiLang: InputLang;
  lastAnswer: string;
  finalMode: FinalMode;
  onSelectMode: (mode: FinalMode) => void;
  onAddPrompt: (text: string) => void;
  onAddDecree: (text: string) => void;
  onSkip: () => void;
  onRejection: (context: "prompt" | "decree") => void;
  title: string;
  hint: string;
  promptButtonLabel: string;
  decreeButtonLabel: string;
}

export default function FinalStep(props: FinalStepProps) {
  const { uiLang, lastAnswer, finalMode, onSelectMode, onAddPrompt, onAddDecree, onSkip, onRejection, title, hint, promptButtonLabel, decreeButtonLabel } = props;
  return (
    <div className="mt-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-center">{title}</h1>
      <p className="text-center text-sm text-neutral-300/80 max-w-0.4xl mx-auto mb-4">{hint}</p>

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => onSelectMode("prompt")}
          className={`px-4 py-2 rounded-lg border transition ${finalMode === "prompt" ? "bg-white/20 border-white/40" : "bg-white/5 border-white/20 hover:bg-white/10"}`}
        >
          {promptButtonLabel}
        </button>

        <button
          onClick={() => onSelectMode("decree")}
          className={`px-4 py-2 rounded-lg border transition ${finalMode === "decree" ? "bg-white/20 border-white/40" : "bg-white/5 border-white/20 hover:bg-white/10"}`}
        >
          {decreeButtonLabel}
        </button>
        <button
          onClick={onSkip}
          className="px-4 py-2 rounded-lg border border-white/20 bg-white/0 hover:bg-white/10"
        >
          Skip
        </button>
      </div>

      {finalMode === "prompt" && (
        <ScreenCreatePrompt uiLang={uiLang} answer={lastAnswer} onLeavePrompt={onAddPrompt} onRejection={() => onRejection("prompt")} disabled={lastAnswer.trim() === ""} />
      )}

      {finalMode === "decree" && (
        <ScreenCreateDecree uiLang={uiLang} answer={lastAnswer} onLeavePrompt={onAddDecree} onRejection={() => onRejection("decree")} disabled={lastAnswer.trim() === ""} />
      )}
    </div>
  );
}
