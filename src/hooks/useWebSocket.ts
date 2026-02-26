import { useCallback, useEffect, useRef, useState } from "react";
import type {
  WebSocketCommand,
  WebSocketResponse,
} from "@/lib/types";

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
