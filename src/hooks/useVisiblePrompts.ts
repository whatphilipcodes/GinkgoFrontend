import { useMemo, useState } from "react";
import type { Prompt } from "@/lib/types";
import { pickRandom } from "@/screens/promptUtils";

interface VisiblePromptsResult {
  visiblePrompts: Prompt[];
  refresh: () => void;
}

export function useVisiblePrompts(page: "idle" | "ask" | "final", prompts: Prompt[]): VisiblePromptsResult {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastPickedIds, setLastPickedIds] = useState<Set<string>>(new Set());

  const visiblePrompts = useMemo(() => {
    if (page !== "idle") return [];
    const N = 10;
    const tries = 10;
    let best: Prompt[] = [];
    let bestOverlap = Number.POSITIVE_INFINITY;

    for (let k = 0; k < tries; k++) {
      const candidate = pickRandom(prompts, N);
      const ids = new Set(candidate.map((p) => p.id));
      let overlap = 0;
      ids.forEach((id) => { if (lastPickedIds.has(id)) overlap++; });
      if (lastPickedIds.size > 0 && overlap === 0) return candidate;
      if (overlap < bestOverlap) { bestOverlap = overlap; best = candidate; }
    }

    return best;
  }, [page, prompts, lastPickedIds, refreshKey]);

  const refresh = () => {
    setLastPickedIds(new Set(visiblePrompts.map((p) => p.id)));
    setRefreshKey((k) => k + 1);
  };

  return { visiblePrompts, refresh };
}
