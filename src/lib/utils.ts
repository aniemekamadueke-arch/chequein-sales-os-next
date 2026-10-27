import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { addDays, differenceInCalendarDays, format, getISOWeek, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const naira = (n: number | null | undefined) =>
  "₦" + Math.round(Number(n) || 0).toLocaleString("en-NG");

export const num = (n: number | null | undefined) =>
  Number(n || 0).toLocaleString("en-NG");

export const pct = (n: number | null | undefined) => Math.round((Number(n) || 0) * 100) + "%";

export const todayISO = () => format(new Date(), "yyyy-MM-dd");

export const addDaysISO = (iso: string, days: number) =>
  format(addDays(parseISO(iso), days), "yyyy-MM-dd");

export const dayDiff = (a: string, b: string) =>
  differenceInCalendarDays(parseISO(a), parseISO(b));

export function dueLabel(iso: string) {
  const n = dayDiff(iso, todayISO());
  if (n < 0) return `${Math.abs(n)}d overdue`;
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  return format(parseISO(iso), "EEE d MMM");
}

export const shortDate = (iso: string) => format(parseISO(iso), "d MMM");

export const longDate = (d: Date) => format(d, "EEEE d MMMM");

export const weekNumber = () => getISOWeek(new Date());

export function fillScript(text: string, emp: { name: string; contact?: string }) {
  return String(text || "")
    .replace(/\{contact\}/g, emp.contact || emp.name)
    .replace(/\{employer\}/g, emp.name)
    .replace(/\{name\}/g, emp.name);
}

export function whatsappNumber(phone: string) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) digits = "234" + digits.slice(1);
  return digits.length >= 10 ? digits : "";
}

export function whatsappHref(phone: string, text?: string) {
  const n = whatsappNumber(phone);
  if (!n) return "";
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      ta.remove();
    }
  }
}
