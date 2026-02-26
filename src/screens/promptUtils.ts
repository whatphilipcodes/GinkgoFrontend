import type { InputLang, InputRecord, Prompt, SeedPrompt, UserPrompt } from "@/lib/types";

export function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

export function groupSeedPrompts(records: InputRecord[]): SeedPrompt[] {
  const grouped = new Map<string, SeedPrompt>();

  records.forEach((record, idx) => {
    const lang = record.lang;
    const id = String(record.id ?? idx);
    const existing = Array.from(grouped.values()).find((prompt) => !(lang in prompt.text));

    if (existing) {
      existing.text[lang] = record.text;
      return;
    }

    grouped.set(id, {
      id,
      text: { [lang]: record.text } as Record<InputLang, string>,
      source: "seed",
    });
  });

  return Array.from(grouped.values());
}

export function mapUserPrompts(records: InputRecord[]): UserPrompt[] {
  return records.map((r, idx) => ({
    id: String(r.id ?? idx),
    text: r.text,
    lang: r.lang,
    source: "audience",
  }));
}

export function promptText(prompt: Prompt, lang: InputLang): string {
  if (prompt.source === "seed") {
    return (prompt.text as Record<InputLang, string>)[lang];
  }
  return prompt.text as string;
}
