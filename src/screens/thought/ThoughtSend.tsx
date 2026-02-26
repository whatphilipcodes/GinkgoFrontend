import { motion } from "framer-motion";

interface ThoughtSendProps {
  answer: string;
  flyY: number;
  onDone: () => void;
}

export function ThoughtSend({ answer, flyY, onDone }: ThoughtSendProps) {
  return (
    <motion.div
      key="send"
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 0 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.7, 1.9, 0.55], y: [0, 0, flyY] }}
        transition={{ duration: 3.35, ease: [0.22, 1, 0.36, 1], times: [0, 0.18, 0.72, 1] }}
        onAnimationComplete={onDone}
        style={{ width: 26, height: 26, borderRadius: 9999, background: "rgba(255,255,255,0.98)", boxShadow: "0 0 55px rgba(255,255,255,0.55), 0 0 140px rgba(255,255,255,0.22)" }}
      />
    </motion.div>
  );
}
