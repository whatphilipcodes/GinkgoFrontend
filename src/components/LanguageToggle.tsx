import type { InputLang } from "@/lib/types";

interface LanguageToggleProps {
  value: InputLang;
  label: string;
  onChange: (lang: InputLang) => void;
}

export default function LanguageToggle({ value, label, onChange }: LanguageToggleProps) {
  return (
    <div className="w-[140px] flex justify-end items-center gap-2 text-xs">
      <span className="opacity-70">{label}:</span>
      <button
        type="button"
        onClick={() => onChange("en")}
        className={
          value === "en"
            ? "px-2 py-1 rounded bg-white/15"
            : "px-2 py-1 rounded hover:bg-white/10"
        }
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onChange("de")}
        className={
          value === "de"
            ? "px-2 py-1 rounded bg-white/15"
            : "px-2 py-1 rounded hover:bg-white/10"
        }
      >
        DE
      </button>
    </div>
  );
}
