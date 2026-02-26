import { useMemo, useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import RejectionModal from "@/components/RejectionModal";
import SubmissionModal from "@/components/SubmissionModal";
import FinalStep, { type FinalMode } from "@/screens/flow/FinalStep";
import IdleScreen, { type DisplayPrompt, makeDisplayPrompts } from "@/screens/flow/IdleScreen";
import ThoughtScreen from "@/screens/flow/ThoughtScreen";
import { useInactivity } from "@/hooks/useInactivity";
import { useLanguage } from "@/hooks/useLanguage";
import { usePromptSocket } from "@/hooks/usePromptSocket";
import { useVisiblePrompts } from "@/hooks/useVisiblePrompts";
import { promptText } from "@/screens/flow/promptUtils";
import type { Prompt } from "@/lib/types";

const STORAGE_LANG_KEY = "uiLang";
const USE_FAKE_PROMPTS = true;

type Page = "idle" | "ask" | "final";

type RejectionContext = "thought" | "prompt" | "decree" | null;

export default function FlowApp() {
  const { uiLang, setUiLang, t } = useLanguage(STORAGE_LANG_KEY);
  const { allPrompts, addEntry, refreshPrompts } = usePromptSocket(USE_FAKE_PROMPTS);
  const [page, setPage] = useState<Page>("idle");
  const [selected, setSelected] = useState<Prompt | null>(null);
  const [lastAnswer, setLastAnswer] = useState("");
  const [finalMode, setFinalMode] = useState<FinalMode>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submittedType, setSubmittedType] = useState<Exclude<FinalMode, null> | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionType, setRejectionType] = useState<RejectionContext>(null);

  const { reset } = useInactivity(() => {
    setSelected(null);
    setLastAnswer("");
    setFinalMode(null);
    setPage("idle");
  });

  const { visiblePrompts, refresh } = useVisiblePrompts(page, allPrompts);
  const displayPrompts = useMemo(() => makeDisplayPrompts(visiblePrompts, uiLang), [visiblePrompts, uiLang]);

  const goHome = () => {
    reset();
    setSelected(null);
    setLastAnswer("");
    setFinalMode(null);
    setPage("idle");
  };

  const selectPrompt = (item: DisplayPrompt) => {
    reset();
    setSelected(item.q);
    setPage("ask");
  };

  const submitThought = (text: string) => {
    reset();
    setLastAnswer(text);
    setFinalMode(null);
    addEntry("thought", text, uiLang);
    setPage("final");
  };

  const submitWithModal = (text: string, type: Exclude<FinalMode, null>) => {
    setSubmittedType(type);
    setShowSubmissionModal(true);
    setTimeout(() => {
      addEntry(type, text, uiLang);
      setShowSubmissionModal(false);
      setSubmittedType(null);
      goHome();
    }, 4000);
  };

  const showRejection = (ctx: RejectionContext) => {
    setRejectionType(ctx);
    setShowRejectionModal(true);
    setTimeout(() => {
      setShowRejectionModal(false);
      setRejectionType(null);
    }, 4000);
  };

  return (
    <main className="min-h-screen p-6 bg-gradient-to-b from-neutral-900 to-neutral-800 text-white" onClick={reset} onKeyDown={reset}>
      <div className="max-w-4xl mx-auto">
        <nav className="flex items-center justify-between mb-8">
          <div className="w-[140px]" />
          <LanguageToggle value={uiLang} label={t("lang")} onChange={setUiLang} />
        </nav>

        {page === "idle" && (
          <IdleScreen
            heading={t("idle_title")}
            hint={t("idle_hint")}
            prompts={displayPrompts}
            onSelect={selectPrompt}
            onRefresh={() => { refresh(); refreshPrompts(); }}
            refreshLabel={t("refresh")}
          />
        )}

        {page !== "idle" && selected && (
          lastAnswer.trim() === "" ? (
            <ThoughtScreen
              uiLang={uiLang}
              prompt={{ id: selected.id, text: promptText(selected, uiLang) }}
              onSubmit={submitThought}
              onBack={goHome}
              onRejection={() => showRejection("thought")}
            />
          ) : (
            <FinalStep
              uiLang={uiLang}
              lastAnswer={lastAnswer}
              finalMode={finalMode}
              onSelectMode={setFinalMode}
              onAddPrompt={(text) => submitWithModal(text, "prompt")}
              onAddDecree={(text) => submitWithModal(text, "decree")}
              onSkip={goHome}
              onRejection={(ctx) => showRejection(ctx)}
              title={t("final_title")}
              hint={t("final_hint")}
              promptButtonLabel={t("final_prompt_button")}
              decreeButtonLabel={t("final_decree_button")}
            />
          )
        )}

        <SubmissionModal isOpen={showSubmissionModal} type={submittedType} onClose={() => { setShowSubmissionModal(false); setSubmittedType(null); }} />
        <RejectionModal isOpen={showRejectionModal} context={rejectionType} onClose={() => { setShowRejectionModal(false); setRejectionType(null); }} />
      </div>
    </main>
  );
}
