import type React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { InputType } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type KeystrokeSender = (key: string, context: InputType) => boolean | void

export function handleKeyInput(
  e: KeyboardEvent | React.KeyboardEvent,
  context: InputType,
  sendKeystroke?: KeystrokeSender,
) {
  const allowedPattern = /^[A-Za-zäöüßÄÖÜ0-9 ]$/;
  let keyPayload: string | null = null;

  if (e.key === "Enter") {
    keyPayload = "return";
    e.preventDefault();
  } else if (e.key === " " || e.code === "Space") {
    keyPayload = "space";
  } else if (allowedPattern.test(e.key)) {
    keyPayload = e.key;
  }

  if (keyPayload && sendKeystroke) {
    sendKeystroke(keyPayload, context);
  }
}