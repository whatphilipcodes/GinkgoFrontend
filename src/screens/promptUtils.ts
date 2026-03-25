import type { InputRecord, Prompt } from "@/lib/types";

export function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

export function mapPrompts(records: InputRecord[]): Prompt[] {
  return records.map((r, idx) => ({
    id: String(r.id ?? idx),
    text: r.text,
    lang: r.lang,
    source: r.source,
  }));
}

export function promptText(prompt: Prompt): string {
  return prompt.text;
}
