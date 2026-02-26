import type React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { InputType } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleKeyInput(
  e: KeyboardEvent | React.KeyboardEvent,
  context: InputType
) {
  const allowedPattern = /^[A-Za-zäöüßÄÖÜ0-9 ]$/;
  if (allowedPattern.test(e.key)) {
    console.log({ key: e.key, context: context });
  }
  if (e.key === " " || e.code === "Space") {
    console.log({ key: "space", context: context });
  } else if (e.key === "Enter") {
    console.log({ key: "return", context: context });
    e.preventDefault();
  }
}