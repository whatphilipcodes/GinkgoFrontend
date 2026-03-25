import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ADD_ENTRY_TIMEOUT_MS } from "@/config";
import type {
  InputLang,
  InputRecord,
  InputType,
  Prompt,
  WebSocketResponse,
} from "@/lib/types";
import { mapPrompts } from "@/screens/promptUtils";
import { QUERY_LIMIT } from "@/config";

interface PromptSocket {
  allPrompts: Prompt[];
  addEntry: (type: "thought" | "prompt" | "decree", text: string, lang: InputLang) => Promise<WebSocketResponse | null>;
  refreshPrompts: () => Promise<WebSocketResponse | null>;
  wsError?: string | null;
  isConnected: boolean;
  sendKeystroke: (key: string, context: InputType) => boolean;
}

interface PromptSocketOptions {
  onRejection?: (context: InputType) => void;
}

export function usePromptSocket(options?: PromptSocketOptions): PromptSocket {
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);

  const refreshPromptsRef = useRef<() => Promise<WebSocketResponse | null>>(async () => null);

  const handleMessage = useCallback(
    (response: WebSocketResponse) => {
      if (!response) return;

      if (response.status === "error") {
        if (
          response.action === "add" &&
          (response.type === "thought" || response.type === "prompt" || response.type === "decree")
        ) {
          options?.onRejection?.(response.type);
        }
        return;
      }

      if (
        response.status === "success" &&
        response.action === "query" &&
        response.type === "prompt" &&
        Array.isArray(response.records)
      ) {
        const records = response.records as InputRecord[];
        setAllPrompts(mapPrompts(records));
        return;
      }

      if (response.status === "success" && response.action === "add" && response.type === "prompt") {
        refreshPromptsRef.current();
      }
    },
    [options?.onRejection],
  );

  const { error: wsError, send, sendAndWait, isConnected } = useWebSocket(handleMessage);

  const refreshPrompts = useCallback(async () => {
    try {
      return await sendAndWait(
        { action: "query", type: "prompt", query_type: "all", filters: { limit: QUERY_LIMIT, offset: 0, recent: true } },
        (resp) => resp.type === "prompt" && resp.action === "query",
      );
    } catch {
      return null;
    }
  }, [sendAndWait]);

  useEffect(() => {
    refreshPromptsRef.current = refreshPrompts;
  }, [refreshPrompts]);

  useEffect(() => {
    if (!isConnected) return;
    refreshPrompts();
  }, [isConnected, refreshPrompts]);

  const addEntry = async (type: "thought" | "prompt" | "decree", text: string, lang: InputLang) => {
    const trimmed = text.trim();
    if (!trimmed) return null;

    try {
      const resp = await sendAndWait(
        { action: "add", text: trimmed, type, lang, source: "audience" },
        (r) => r.action === "add" && r.type === type,
        ADD_ENTRY_TIMEOUT_MS,
      );
      if (resp.status === "success" && type !== "thought") refreshPrompts();
      if (resp.status === "error") options?.onRejection?.(type);
      return resp;
    } catch (err) {
      return null;
    }
  };

  const sendKeystroke = useCallback(
    (key: string, context: InputType) => send({ action: "send", type: "keystroke", key, context }),
    [send],
  );

  return { allPrompts, addEntry, refreshPrompts, wsError, isConnected, sendKeystroke };
}
