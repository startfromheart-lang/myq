import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function generateCheckinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
