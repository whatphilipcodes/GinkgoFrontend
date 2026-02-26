import type { FinalMode } from "@/screens/flow/FinalStep";

interface SubmissionModalProps {
  isOpen: boolean;
  type: Exclude<FinalMode, null> | null;
  onClose: () => void;
}

export default function SubmissionModal({ isOpen, type, onClose }: SubmissionModalProps) {
  if (!isOpen || !type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-neutral-900 p-6 rounded-xl max-w-sm text-center text-white">
        <h2 className="text-xl font-semibold mb-4">
          {type === "prompt" ? "Prompt submitted!" : "Decree submitted!"}
        </h2>
        <p className="mb-6">
          {type === "prompt"
            ? "Thank you for leaving a prompt. It will be shown to the next visitor."
            : "Thank you for adding a decree. It will help shape this democracy."}
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
