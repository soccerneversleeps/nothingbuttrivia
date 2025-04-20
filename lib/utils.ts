import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateGameCode(): string {
  // Generate a random 6-character code using uppercase letters and numbers
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
