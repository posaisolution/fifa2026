import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function flagUrl(fifaCode: string): string {
  return `https://flagcdn.com/w80/${fifaCode.toLowerCase()}.png`
}
