import { useEffect, useRef } from "react";

const INACTIVITY_TIMEOUT = 30_000;

export function useInactivity(onTimeout: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onTimeout, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    reset();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { reset };
}
