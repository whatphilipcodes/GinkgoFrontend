import type { SeedPrompt, UserPrompt } from "@/lib/types";

export const fakeSeeds: SeedPrompt[] = [
  {
    id: "seed-1",
    text: {
      en: "Should cities add more free public parks?",
      de: "Sollten Städte mehr kostenlose öffentliche Parks einrichten?",
    },
    source: "seed",
  },
  {
    id: "seed-2",
    text: {
      en: "How should we decide on shared community funds?",
      de: "Wie sollten wir über gemeinsame Gemeinschaftsfonds entscheiden?",
    },
    source: "seed",
  },
  {
    id: "seed-3",
    text: {
      en: "What makes a neighborhood feel safe?",
      de: "Was lässt ein Viertel sicher erscheinen?",
    },
    source: "seed",
  },
];

export const fakeUsers: UserPrompt[] = [
  {
    id: "user-1",
    text: "Can we have free community workshops on weekends?",
    lang: "en",
    source: "audience",
  },
  {
    id: "user-2",
    text: "Mehr Fahrradwege in der Stadt",
    lang: "de",
    source: "audience",
  },
];
