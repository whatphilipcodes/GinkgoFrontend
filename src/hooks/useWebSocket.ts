import { useCallback, useEffect, useRef, useState } from "react";

export type InputType = "thought" | "prompt" | "decree";
export type InputLang = "en" | "de";
export type InputSource = "seed" | "audience";

export interface InputRecord {
  id: number;
  text: string;
  type: InputType;
  lang: InputLang;
  source: InputSource;
  attribute_class: string | null;
  trait: string | null;
  created_at: string;
  updated_at: string;
}

// —— Thought commands ————————————————————————————————————————
export interface AddThoughtCommand {
  action: "add";
  type: "thought";
  text: string;
  lang: InputLang;
  source: InputSource;
}

export interface QueryThoughtCommand {
  action: "query";
  type: "thought";
  query_type: "all" | "recent" | "by_id";
  filters?: Record<string, any>;
}

export interface DeleteThoughtCommand {
  action: "delete";
  type: "thought";
  record_id: number;
}

export interface UpdateThoughtCommand {
  action: "update";
  type: "thought";
  record_id: number;
  text: string;
}

// —— Prompt commands ————————————————————————————————————————
export interface AddPromptCommand {
  action: "add";
  type: "prompt";
  text: string;
  lang: InputLang;
  source: InputSource;
}

export interface QueryPromptCommand {
  action: "query";
  type: "prompt";
  query_type: "all" | "recent" | "by_id";
  filters?: Record<string, any>;
}

export interface DeletePromptCommand {
  action: "delete";
  type: "prompt";
  record_id: number;
}

export interface UpdatePromptCommand {
  action: "update";
  type: "prompt";
  record_id: number;
  text: string;
}

// —— Decree commands ————————————————————————————————————————
export interface AddDecreeCommand {
  action: "add";
  type: "decree";
  text: string;
  lang: InputLang;
  source: InputSource;
}

export interface QueryDecreeCommand {
  action: "query";
  type: "decree";
  query_type: "all" | "recent" | "by_id";
  filters?: Record<string, any>;
}

export interface DeleteDecreeCommand {
  action: "delete";
  type: "decree";
  record_id: number;
}

export interface UpdateDecreeCommand {
  action: "update";
  type: "decree";
  record_id: number;
  text: string;
}

export type WebSocketCommand =
  | AddThoughtCommand
  | QueryThoughtCommand
  | DeleteThoughtCommand
  | UpdateThoughtCommand
  | AddPromptCommand
  | QueryPromptCommand
  | DeletePromptCommand
  | UpdatePromptCommand
  | AddDecreeCommand
  | QueryDecreeCommand
  | DeleteDecreeCommand
  | UpdateDecreeCommand;

export interface WebSocketResponse {
  status: "success" | "error";
  action?: string;
  type?: InputType;
  error?: string;
  record?: InputRecord;
  records?: InputRecord[];
  count?: number;
  query_type?: string;
  [key: string]: any;
}

/**
 * Custom hook for WebSocket connection management
 * Handles connection lifecycle and command sending
 */
export function useWebSocket(
  onMessageReceived?: (data: WebSocketResponse) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const callbackRef = useRef(onMessageReceived);

  // Keep callback ref in sync
  useEffect(() => {
    callbackRef.current = onMessageReceived;
  }, [onMessageReceived]);

  // Send a command through WebSocket
  const send = useCallback((command: WebSocketCommand): boolean => {
    const isReady =
      wsRef.current && wsRef.current.readyState === WebSocket.OPEN;

    if (!isReady) {
      console.warn("WebSocket not ready when trying to send", {
        connected: !!wsRef.current,
        readyState: wsRef.current?.readyState,
        readyStateNames: {
          0: "CONNECTING",
          1: "OPEN",
          2: "CLOSING",
          3: "CLOSED",
        },
      });
      return false;
    }

    try {
      console.log("Sending command:", command.action, command.type);
      wsRef.current!.send(JSON.stringify(command));
      return true;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to send command";
      console.error("Send error:", errorMsg);
      return false;
    }
  }, []);

  // Connect on mount and cleanup on unmount
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/ws/frontend`;

    console.log("Creating WebSocket connection to:", url);
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log("WebSocket connected successfully");
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketResponse;
        console.log("WebSocket message received:", data);
        callbackRef.current?.(data);
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    wsRef.current.onerror = (event) => {
      console.error("WebSocket error:", event);
      setIsConnected(false);
      setError("WebSocket error");
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
    };

    // Cleanup: close connection when component unmounts
    return () => {
      console.log("Closing WebSocket connection");
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { isConnected, error, send };
}
