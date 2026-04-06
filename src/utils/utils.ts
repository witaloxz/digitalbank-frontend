import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = "USD", locale: string = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
}

export function formatTimeAgo(dateString: string, language: string = "pt") {
  try {
    const locale = language === "pt" ? ptBR : enUS;
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale });
  } catch {
    return dateString;
  }
}

export function getUserInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0][0].toUpperCase();
}