import { useMemo, useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import RejectionModal from "@/components/RejectionModal";
import SubmissionModal from "@/components/SubmissionModal";
import FinalStep, { type FinalMode } from "@/screens/FinalStep";
import IdleScreen, { type DisplayPrompt, makeDisplayPrompts } from "@/screens/IdleScreen";
import ThoughtScreen from "@/screens/ThoughtScreen";
import { useInactivity } from "@/hooks/useInactivity";
import { useLanguage } from "@/hooks/useLanguage";
import { usePromptSocket } from "@/hooks/usePromptSocket";
import { useVisiblePrompts } from "@/hooks/useVisiblePrompts";
import { promptText } from "@/screens/promptUtils";
import { REJECTION_MODAL_TIMEOUT_MS } from "@/config";
import type { Prompt } from "@/lib/types";

const STORAGE_LANG_KEY = "uiLang";

type Page = "idle" | "ask" | "final";

type RejectionContext = "thought" | "prompt" | "decree" | null;

export default function FlowApp() {
  const { uiLang, setUiLang, t } = useLanguage(STORAGE_LANG_KEY);
  const { allPrompts, addEntry, refreshPrompts, sendKeystroke } = usePromptSocket({
    onRejection: (ctx) => showRejection(ctx),
  });
  const [page, setPage] = useState<Page>("idle");
  const [selected, setSelected] = useState<Prompt | null>(null);
  const [lastAnswer, setLastAnswer] = useState("");
  const [finalMode, setFinalMode] = useState<FinalMode>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submittedType, setSubmittedType] = useState<Exclude<FinalMode, null> | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionType, setRejectionType] = useState<RejectionContext>(null);
  const [isWaiting, setIsWaiting] = useState(false);

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
    refresh();
    refreshPrompts();
    setPage("idle");
  };

  const selectPrompt = (item: DisplayPrompt) => {
    reset();
    setSelected(item.q);
    setPage("ask");
  };

  const submitThought = async (text: string) => {
    reset();
    setIsWaiting(true);
    const resp = await addEntry("thought", text, uiLang);
    setIsWaiting(false);

    if (!resp || resp.status === "error") {
      showRejection("thought");
      return false;
    }

    setLastAnswer(text);
    setFinalMode(null);
    setPage("final");
    return true;
  };

  const submitWithModal = async (text: string, type: Exclude<FinalMode, null>) => {
    setSubmittedType(type);
    setShowSubmissionModal(true);
    setIsWaiting(true);

    const resp = await addEntry(type, text, uiLang);

    setIsWaiting(false);

    if (!resp || resp.status === "error") {
      showRejection(type);
      setShowSubmissionModal(false);
      setSubmittedType(null);
      return;
    }
  };

  const showRejection = (ctx: RejectionContext) => {
    setRejectionType(ctx);
    setShowRejectionModal(true);
    setTimeout(() => {
      setShowRejectionModal(false);
      setRejectionType(null);
    }, REJECTION_MODAL_TIMEOUT_MS);
  };

  return (
    <main className="min-h-screen p-6 bg-gradient-to-b from-neutral-900 to-neutral-800 text-white" onClick={reset} onKeyDown={reset}>
      <div className="max-w-4xl mx-auto">
        <nav className="flex items-center justify-between mb-8">
          <div className="w-[140px]" />
          <LanguageToggle value={uiLang} label={t("lang")} onChange={setUiLang} />
        </nav>

        {isWaiting && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" aria-label="Loading" />
          </div>
        )}

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
              onKeystroke={sendKeystroke}
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
              onKeystroke={sendKeystroke}
              title={t("final_title")}
              hint={t("final_hint")}
              promptButtonLabel={t("final_prompt_button")}
              decreeButtonLabel={t("final_decree_button")}
            />
          )
        )}

        <SubmissionModal isOpen={showSubmissionModal} type={submittedType} onClose={() => { setShowSubmissionModal(false); setSubmittedType(null); goHome(); }} />
        <RejectionModal isOpen={showRejectionModal} context={rejectionType} onClose={() => { setShowRejectionModal(false); setRejectionType(null); }} />
      </div>
    </main>
  );
}
