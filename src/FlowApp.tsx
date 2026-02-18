import { useWebSocket, type InputLang } from "@/hooks/useWebSocket";
import { useEffect, useMemo, useRef, useState } from "react";
import FloatingPrompts from "@/components/FloatingPrompts";
import PromptScreen from "@/components/PromptScreen";
import FinalScreen from "@/components/FinalScreen";
import Database from "@/components/Database";

// —— Types ————————————————————————————————————————————————
type Lang = "en" | "de";

type SeedPrompt = {
  id: string;
  text: Record<Lang, string>; // translated seed text
  source: "seed";
};

type UserPrompt = {
  id: string;
  text: string; // user input text as-is
  lang: Lang; // language UI was set to when created
  source: "user";
};

type Prompt = SeedPrompt | UserPrompt;

// —— LocalStorage keys ——————————————————————————————————————
const STORAGE_LANG_KEY = "uiLang";

// —— Seed prompts (bilingual) ————————————————————————————
// Note: Seed prompts are now fetched from the backend via WebSocket

// —— UI labels (bilingual) ————————————————————————————————
const I18N: Record<Lang, Record<string, string>> = {
  en: {
    nav_choose: "Choose a Prompt",
    nav_answer: "Submit your Voice",
    nav_leave: "Leave a Prompt",
    idle_title: "Click a prompt to answer it.",
    idle_hint:
      "By responding to a prompt, you actively contribute to this evolving democracy. Your input can shape it in different ways. Share your perspective and observe how the tree transforms through collective voices.",
    final_title: "How would you like to participate in this democracy?",
    final_hint: "You can either leave a prompt for the next visitor or add a decree that will shape this democracy.",
    
    final_prompt_button: "Leave Prompt",
    final_decree_button: "Add Decree",
    lang: "Language",

    refresh: "Refresh prompts",
  },
  de: {
    nav_choose: "Wähle einen Prompt",
    nav_answer: "Antwort eingeben",
    nav_leave: "Prompt hinzufügen",
    idle_title: "Klicke einen Prompt an, um ihn zu beantworten.",
    idle_hint:
      "Mit deiner Antwort trägst du aktiv zu dieser sich entwickelnden Demokratie bei. Dein Beitrag kann sie auf unterschiedliche Weise prägen. Teile deine Perspektive und beobachte, wie sich der Baum durch die Stimmen aller verändert.",
          final_title: "Wie möchtest du dich an dieser Demokratie beteiligen?",
    final_hint: "Du kannst einen Prompt für die nächste Person hinterlassen oder ein Dekret hinzufügen, das diese Demokratie prägt.",
    final_prompt_button: "Prompt hinterlassen",
    final_decree_button: "Dekret hinzufügen",
    lang: "Sprache",
    refresh: "Prompts neu mischen",
  },
};

// —— Helpers ———————————————————————————————————————————————

// Pick N random unique items from an array
function pickRandom<T>(arr: T[], n: number) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

// Group seed records (en/de pairs) into bilingual SeedPrompts
function groupSeedPrompts(records: any[]): SeedPrompt[] {
  const grouped = new Map<string, Partial<SeedPrompt>>();

  for (const record of records) {
    // Look for existing record with same type and opposite language
    // that we can pair with this one
    let found = false;
    for (const prompt of grouped.values()) {
      if (prompt.text && typeof prompt.text !== 'string') {
        // Check if we can add this to the existing pair
        if (!(record.lang in prompt.text)) {
          prompt.text[record.lang as Lang] = record.text;
          found = true;
          break;
        }
      }
    }
    
    if (!found) {
      // Create a new seed prompt with initial language
      const id = `seed-${Object.keys(Object.fromEntries(grouped)).length}`;
      grouped.set(id, {
        id,
        text: { [record.lang]: record.text } as Record<Lang, string>,
        source: "seed",
      });
    }
  }

  return Array.from(grouped.values()) as SeedPrompt[];
}

// —— Main component —————————————————————————————————————————
export default function FlowApp() {
  // —— UI language toggle (only affects labels + seed prompt language)
  const [uiLang, setUiLang] = useState<Lang>(() => {
    const raw = localStorage.getItem(STORAGE_LANG_KEY);
    return raw === "de" || raw === "en" ? raw : "en";
  });

  // Persist UI language
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LANG_KEY, uiLang);
    } catch {
      // ignore (private mode etc.)
    }
  }, [uiLang]);

  // Translation helper
  const t = (key: keyof (typeof I18N)["en"]) => I18N[uiLang][key];

  // —— Page flow state
  const [page, setPage] = useState<"idle" | "ask" | "final">("idle");
  const [selected, setSelected] = useState<Prompt | null>(null);
  const [lastAnswer, setLastAnswer] = useState<string>("");
  // this helps show the UI when the user chooses between two buttons:
  const [finalMode, setFinalMode] = useState< "prompt" | "decree" | null>(null);
  // submission modal state
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
const [submittedType, setSubmittedType] = useState<"prompt" | "decree" | null>(null);



  // —— Refresh state (for “new set” + new layout)
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastPickedIds, setLastPickedIds] = useState<Set<string>>(new Set());
  
  // —— WebSocket connection for backend communication
  const [fetchedSeedPrompts, setFetchedSeedPrompts] = useState<SeedPrompt[]>([]);
  const [fetchedUserPrompts, setFetchedUserPrompts] = useState<UserPrompt[]>([]);
  const { error: wsError, send: sendWsCommand } = useWebSocket((response) => {
    // Handle query responses to fetch all prompts from backend
    if (response.action === "query" && response.records && Array.isArray(response.records)) {
      const seedRecords = response.records.filter((r: any) => r.source === "seed");
      const userRecords = response.records.filter((r: any) => r.source === "audience" || r.source === "user");
      
      const groupedSeeds = groupSeedPrompts(seedRecords);
      setFetchedSeedPrompts(groupedSeeds);
      
      // Map user records to UserPrompt format
      const mappedUserPrompts: UserPrompt[] = userRecords.map((r: any, idx: number) => ({
        id: r.id || `user-${idx}`,
        text: r.text,
        lang: (r.lang === "en" || r.lang === "de") ? r.lang : "en",
        source: "user" as const,
      }));
      setFetchedUserPrompts(mappedUserPrompts);
    }
  });

  // —— Combined prompt pool (seed + user from backend)
  const allPrompts = useMemo<Prompt[]>(
    () => [...fetchedUserPrompts, ...fetchedSeedPrompts],
    [fetchedUserPrompts, fetchedSeedPrompts],
  );

  // —— Visible set on idle screen
  // Goal: show 8 random prompts, and when you refresh, try to make them "completely new"
  // (meaning: minimal overlap with the previous selection, if possible).
  const visiblePrompts = useMemo(() => {
    if (page !== "idle") return [];

    const N = 10;
    const tries = 10;

    let best: Prompt[] = [];
    let bestOverlap = Number.POSITIVE_INFINITY;

    for (let k = 0; k < tries; k++) {
      const candidate = pickRandom(allPrompts, N);
      const ids = new Set(candidate.map((p) => p.id));

      let overlap = 0;
      ids.forEach((id) => {
        if (lastPickedIds.has(id)) overlap++;
      });

      // If we can achieve 0 overlap, do it immediately
      if (lastPickedIds.size > 0 && overlap === 0) return candidate;

      // Otherwise keep the best (lowest overlap)
      if (overlap < bestOverlap) {
        bestOverlap = overlap;
        best = candidate;
      }
    }

    return best;
  }, [page, allPrompts, lastPickedIds, refreshKey]);

  // —— What gets displayed (seed uses uiLang; user stays as typed)
  const visibleDisplayPrompts = useMemo(
    () =>
      visiblePrompts.map((p) => ({
        id: p.id,
        q: p, // keep original object so we know if it's seed/user later
        text: p.source === "seed" ? p.text[uiLang] : p.text,
      })),
    [visiblePrompts, uiLang],
  );

  // —— Inactivity timer (kiosk mode)
  const INACTIVITY_TIMEOUT = 30_000;
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

    inactivityTimer.current = setTimeout(() => {
      // soft reset to idle
      setSelected(null);
      setLastAnswer("");
      setPage("idle");
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // —— Fetch seed prompts from backend on mount
  useEffect(() => {
    // Check if connected before sending
    let isMounted = true;
    const attemptFetch = () => {
      if (!isMounted) return;
      
      const success = sendWsCommand({
        action: "query",
        query_type: "by_type",
        filters: { input_type: "prompt", limit: 100 },
      });
      
      if (!success) {
        console.warn("Seed prompts query failed, retrying...");
        // Retry after another delay
        const retryTimer = setTimeout(attemptFetch, 2000);
        return () => clearTimeout(retryTimer);
      } else {
        console.log("Seed prompts query sent successfully");
      }
    };

    // Wait for WebSocket to be ready before sending
    const timer = setTimeout(attemptFetch, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [sendWsCommand]);

  // —— Handlers (navigation + actions)
  // const goBack = () => {
  //   resetInactivityTimer();
  //   setFinalMode(null)
  // };
  const goHome = () => {
    resetInactivityTimer();
       setPage("idle");
  };


  // const goToAsk = () => {
  //   resetInactivityTimer();
  //   setPage("ask");
  // };

  // const goToFinal = () => {
  //   resetInactivityTimer();
  //   setPage("final");
  // };

  const handleSelect = (item: { id: string; text: string; q: Prompt }) => {
    resetInactivityTimer();
    setSelected(item.q);
    setPage("ask");
  };

  const handleSubmitAnswer = (text: string) => {
    resetInactivityTimer();
    setLastAnswer(text);
      setFinalMode(null); // 👈 reset to choice screen
    setPage("final");
  };

const handleAddPromptWithModal = (text: string) => {
  setSubmittedType("prompt");
  setShowSubmissionModal(true);

  setTimeout(() => {
    handleAddPrompt(text, "prompt");
    setShowSubmissionModal(false);
    setSubmittedType(null);
    goHome();
  }, 4000);
};

const handleAddDecreeWithModal = (text: string) => {
  setSubmittedType("decree");
  setShowSubmissionModal(true);

  setTimeout(() => {
    handleAddPrompt(text, "decree");
    setShowSubmissionModal(false);
    setSubmittedType(null);
    goHome();
  }, 4000);
};



  const handleAddPrompt = (text: string, type: "prompt" | "decree") => {
    resetInactivityTimer();

    const trimmed = text.trim();
    if (trimmed.length === 0) return;

    // Send to backend via WebSocket (no local storage)
    const success = sendWsCommand({
      action: "add",
      text: trimmed,
      type,
      lang: uiLang as InputLang,
      source: "audience",
    });

    if (!success && wsError) {
      console.error("Failed to send to backend:", wsError);
    } else {
      // Re-fetch prompts from backend to get the latest data
      setTimeout(() => {
        sendWsCommand({
          action: "query",
          query_type: "by_type",
          filters: { input_type: "prompt", limit: 100 },
        });
      }, 500);
    }

    // reset flow
    setSelected(null);
    setLastAnswer("");
    setPage("idle");
  };

  // Refresh prompts button:
  // - store current selection ids so we can avoid them next time
  // - bump refreshKey to force recompute + new layout
  const handleRefreshPrompts = () => {
    setLastPickedIds(new Set(visiblePrompts.map((p) => p.id)));
    setRefreshKey((k) => k + 1);
  };

  // —— Render ———————————————————————————————————————————————
  return (
    <main
      className="min-h-screen p-6 bg-gradient-to-b from-neutral-900 to-neutral-800 text-white"
      onClick={resetInactivityTimer}
      onKeyDown={resetInactivityTimer}
    >
      <div className="max-w-4xl mx-auto">
        {/* —— Top navigation + language toggle —— */}
        <nav className="flex items-center justify-between mb-8">
          {/* left spacer */}
          <div className="w-[140px]" />

          {/* right: language toggle */}
          <div className="w-[140px] flex justify-end items-center gap-2 text-xs">
            <span className="opacity-70">{t("lang")}:</span>
            <button
              type="button"
              onClick={() => setUiLang("en")}
              className={
                uiLang === "en"
                  ? "px-2 py-1 rounded bg-white/15"
                  : "px-2 py-1 rounded hover:bg-white/10"
              }
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setUiLang("de")}
              className={
                uiLang === "de"
                  ? "px-2 py-1 rounded bg-white/15"
                  : "px-2 py-1 rounded hover:bg-white/10"
              }
            >
              DE
            </button>
          </div>
        </nav>

        {/* —— Page: Idle (floating prompts) —— */}
        {page === "idle" && (
          <section>
            <h1 className="text-3xl font-semibold mb-6 text-center">
              {t("idle_title")}
            </h1>

            <p className="text-center text-sm text-neutral-300/80 max-w-0.4xl mx-auto mb-4">
              {t("idle_hint")}
            </p>

            {/* —— Refresh button —— */}
            <div className="flex items-center justify-center mb-4">
              <button
                type="button"
                onClick={handleRefreshPrompts}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/0 hover:bg-white/35 border border-white/15 text-sm text-white transition"
              >
                <i className="bi bi-arrow-clockwise text-base leading-none" />
                <span>{t("refresh")}</span>
              </button>
            </div>

            <FloatingPrompts
              prompts={visibleDisplayPrompts}
              onSelect={handleSelect}
              //refreshKey={refreshKey}
            />
          </section>
        )}

{page !== "idle" && selected && (
  <>
    {/* —— PromptScreen —— */}
    {lastAnswer.trim() === "" && (
      <PromptScreen
        uiLang={uiLang}
        prompt={{
          id: selected.id,
          text:
            selected.source === "seed"
              ? selected.text[uiLang]
              : selected.text,
        }}
        onSubmit={(text) => {
          handleSubmitAnswer(text);
        }}
        onBack={goHome}
        hasAnswered={false}
      />
    )}

    {/* —— FinalScreen + Database —— */}
 {page === "final" && (
  <div className="mt-6 max-w-2xl mx-auto">
    {/* Text */}
     <h1 className="text-3xl font-semibold mb-6 text-center">
              {t("final_title")}
            </h1>

            <p className="text-center text-sm text-neutral-300/80 max-w-0.4xl mx-auto mb-4">
              {t("final_hint")}
            </p>

    {/* Buttons */}
    <div className="flex justify-center gap-4 mb-6">
      <button
        onClick={() => setFinalMode("prompt")}
        className={`px-4 py-2 rounded-lg border transition
          ${finalMode === "prompt"
            ? "bg-white/20 border-white/40"
            : "bg-white/5 border-white/20 hover:bg-white/10"}
        `}
      >
      {t("final_prompt_button")}
      </button>

      <button
        onClick={() => setFinalMode("decree")}
        className={`px-4 py-2 rounded-lg border transition
          ${finalMode === "decree"
            ? "bg-white/20 border-white/40"
            : "bg-white/5 border-white/20 hover:bg-white/10"}
        `}
      >
          {t("final_decree_button")}
      </button>
        <button
    onClick={goHome}
    className="px-4 py-2 rounded-lg border border-white/20 bg-white/0 hover:bg-white/10"
  >
    Skip
  </button>
    </div>

    {/* Conditional UI below */}
    {finalMode === "prompt" && (
      <FinalScreen
        uiLang={uiLang}
        answer={lastAnswer}
        onLeavePrompt={handleAddPromptWithModal}
   
        disabled={lastAnswer.trim() === ""}
      />
    )}

    {finalMode === "decree" && (
      <Database
        uiLang={uiLang}
        answer={lastAnswer}
        onLeavePrompt={handleAddDecreeWithModal}
       
        disabled={lastAnswer.trim() === ""}
      />
    )}
  </div>
)}
{showSubmissionModal && submittedType && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-neutral-900 p-6 rounded-xl max-w-sm text-center text-white">
      <h2 className="text-xl font-semibold mb-4">
        {submittedType === "prompt" ? "Prompt submitted!" : "Decree submitted!"}
      </h2>
      <p className="mb-6">
        {submittedType === "prompt"
          ? "Thank you for leaving a prompt. It will be shown to the next visitor."
          : "Thank you for adding a decree. It will help shape this democracy."}
      </p>
   
    </div>
  </div>
)}


  </>
)}
      </div>
    </main>
  );
}
