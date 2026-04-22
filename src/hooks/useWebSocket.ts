import { useCallback, useEffect, useRef, useState } from "react";
import { DEBUG_WS, REQUEST_TIMEOUT_MS } from "@/config";
import type { WebSocketCommand, WebSocketMatcher, WebSocketResponse } from "@/lib/types";

const BASE_DELAY_MS = 500;
const MAX_DELAY_MS = 15000;

interface Waiter {
  match: WebSocketMatcher;
  resolve: (resp: WebSocketResponse) => void;
  reject: (err: Error) => void;
  timeoutId: ReturnType<typeof setTimeout> | null;
}

export function useWebSocket(
  onMessageReceived?: (data: WebSocketResponse) => void,
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const callbackRef = useRef(onMessageReceived);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualCloseRef = useRef(false);
  const attemptRef = useRef(0);
  const connectRef = useRef<() => void>(() => {});
  const waitersRef = useRef<Waiter[]>([]);

  useEffect(() => {
    callbackRef.current = onMessageReceived;
  }, [onMessageReceived]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const cleanupSocket = useCallback(() => {
    const socket = wsRef.current;
    if (!socket) return;

    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    try {
      socket.close();
    } catch {
      /* ignore */
    }
    wsRef.current = null;
  }, []);

  const flushWaitersWithError = useCallback((message: string) => {
    waitersRef.current.forEach((w) => {
      if (w.timeoutId) clearTimeout(w.timeoutId);
      w.reject(new Error(message));
    });
    waitersRef.current = [];
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (manualCloseRef.current) return;

    const delay = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** attemptRef.current);
    attemptRef.current += 1;
    clearReconnectTimer();

    reconnectTimerRef.current = setTimeout(() => {
      connectRef.current();
    }, delay);
  }, [clearReconnectTimer]);

  const connect = useCallback(() => {
    cleanupSocket();

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/ws/frontend`;

    try {
      const socket = new WebSocket(url);
      wsRef.current = socket;

      socket.onopen = () => {
        attemptRef.current = 0;
        clearReconnectTimer();
        setIsConnected(true);
        setError(null);
        if (DEBUG_WS) console.log("[ws] open", url);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketResponse;
          
          // Ignore keepalive ping messages from server
          if (data.type === "ping") {
            if (DEBUG_WS) console.log("[ws] recv (ping - ignored)");
            return;
          }
          
          if (DEBUG_WS) console.log("[ws] recv", data);

          // resolve the first waiter that matches
          for (let i = 0; i < waitersRef.current.length; i++) {
            const w = waitersRef.current[i];
            if (w.match(data)) {
              if (w.timeoutId) clearTimeout(w.timeoutId);
              waitersRef.current.splice(i, 1);
              w.resolve(data);
              break;
            }
          }

          callbackRef.current?.(data);
        } catch (err) {
          console.error("Failed to parse WebSocket message", err);
          setError("Invalid WebSocket message");
        }
      };

      socket.onerror = () => {
        setError("WebSocket error");
        flushWaitersWithError("WebSocket error");
      };

      socket.onclose = () => {
        setIsConnected(false);
        flushWaitersWithError("WebSocket closed");
        scheduleReconnect();
        if (DEBUG_WS) console.log("[ws] closed", url);
      };
    } catch (err) {
      console.error("WebSocket init failed", err);
      setError("WebSocket init failed");
      scheduleReconnect();
    }
  }, [cleanupSocket, clearReconnectTimer, scheduleReconnect]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    manualCloseRef.current = false;
    connect();
    return () => {
      manualCloseRef.current = true;
      clearReconnectTimer();
      cleanupSocket();
      flushWaitersWithError("WebSocket unmounted");
    };
  }, [connect, clearReconnectTimer, cleanupSocket, flushWaitersWithError]);

  const send = useCallback((command: WebSocketCommand): boolean => {
    const socket = wsRef.current;
    const isReady = socket && socket.readyState === WebSocket.OPEN;

    if (!isReady) {
      setError("WebSocket not connected");
      return false;
    }

    try {
      if (DEBUG_WS) console.log("[ws] send", command);
      socket!.send(JSON.stringify(command));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send";
      setError(message);
      return false;
    }
  }, []);

  const sendAndWait = useCallback(
    async (
      command: WebSocketCommand,
      match: WebSocketMatcher,
      timeoutMs: number = REQUEST_TIMEOUT_MS,
    ): Promise<WebSocketResponse> => {
      return new Promise<WebSocketResponse>((resolve, reject) => {
        if (!send(command)) {
          reject(new Error("WebSocket not connected"));
          return;
        }

        const timeoutId = setTimeout(() => {
          reject(new Error("WebSocket response timeout"));
        }, timeoutMs);

        waitersRef.current.push({ match, resolve, reject, timeoutId });
      });
    },
    [send],
  );

  return { isConnected, error, send, sendAndWait };
}
