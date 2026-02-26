interface RejectionModalProps {
  isOpen: boolean;
  context: "thought" | "prompt" | "decree" | null;
  onClose: () => void;
}

export default function RejectionModal({ isOpen, context, onClose }: RejectionModalProps) {
  if (!isOpen || !context) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-neutral-900 p-6 rounded-xl max-w-sm text-center text-white">
        <h2 className="text-xl font-semibold mb-4 text-red-400">Content Rejected</h2>
        <p className="mb-6">
          Your {context === "thought" ? "response" : context} contains inappropriate content or hate speech and cannot be submitted.
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
