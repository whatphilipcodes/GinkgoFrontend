import { useCallback, useEffect, useMemo, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { InputLang, InputRecord, Prompt, SeedPrompt, UserPrompt } from "@/lib/types";
import { fakeSeeds, fakeUsers } from "@/screens/fakePrompts";
import { groupSeedPrompts, mapUserPrompts } from "@/screens/promptUtils";

const QUERY_LIMIT = 100;

interface PromptSocket {
  allPrompts: Prompt[];
  addEntry: (type: "thought" | "prompt" | "decree", text: string, lang: InputLang) => void;
  refreshPrompts: () => void;
  wsError?: string | null;
}

export function usePromptSocket(useFake: boolean): PromptSocket {
  const [seedPrompts, setSeedPrompts] = useState<SeedPrompt[]>([]);
  const [userPrompts, setUserPrompts] = useState<UserPrompt[]>([]);

  const { error: wsError, send } = useWebSocket((response) => {
    if (response.action !== "query" || !Array.isArray(response.records)) return;
    const records = response.records as InputRecord[];
    const seeds = records.filter((r) => r.source === "seed");
    const audience = records.filter((r) => r.source !== "seed");
    setSeedPrompts(groupSeedPrompts(seeds));
    setUserPrompts(mapUserPrompts(audience));
  });

  useEffect(() => {
    if (!useFake) return;
    setSeedPrompts(fakeSeeds);
    setUserPrompts(fakeUsers);
  }, [useFake]);

  const refreshPrompts = useCallback(() => {
    if (useFake) return;
    send({ action: "query", type: "prompt", query_type: "all", filters: { limit: QUERY_LIMIT } });
  }, [send, useFake]);

  useEffect(() => {
    if (useFake) return;
    const timer = setTimeout(refreshPrompts, 1000);
    return () => clearTimeout(timer);
  }, [useFake, refreshPrompts]);

  const addEntry = (type: "thought" | "prompt" | "decree", text: string, lang: InputLang) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const success = send({ action: "add", text: trimmed, type, lang, source: "audience" });
    if (success && type !== "thought" && !useFake) setTimeout(refreshPrompts, 500);
  };

  const allPrompts = useMemo<Prompt[]>(
    () => [...userPrompts, ...seedPrompts],
    [userPrompts, seedPrompts],
  );

  return { allPrompts, addEntry, refreshPrompts, wsError };
}
