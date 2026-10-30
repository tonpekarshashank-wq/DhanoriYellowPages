/**
 * Minimal i18n framework.
 * Supports en, mr (Marathi) and hi (Hindi).
 * Locale stored in a cookie; translations loaded at render time.
 */

import en from "@/messages/en.json";
import mr from "@/messages/mr.json";
import hi from "@/messages/hi.json";

export type Locale = "en" | "mr" | "hi";

export const LOCALES: Locale[] = ["en", "mr", "hi"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  mr: "मराठी",
  hi: "हिन्दी",
};

export const DEFAULT_LOCALE: Locale = "en";

export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

type Messages = typeof en;

const messages: Record<Locale, Messages> = { en, mr, hi };

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages.en;
}

/**
 * Resolve a dot-path key like "nav.home" against a messages object.
 * Supports simple interpolation: {key} replaced with vars[key].
 */
export function t(
  msgs: Messages,
  key: string,
  vars?: Record<string, string | number>
): string {
  const parts = key.split(".");
  let result: unknown = msgs;
  for (const part of parts) {
    if (result && typeof result === "object" && part in result) {
      result = (result as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }

  if (typeof result !== "string") return key;

  if (vars) {
    return result.replace(/\{(\w+)\}/g, (_, k) =>
      k in vars ? String(vars[k]) : `{${k}}`
    );
  }

  return result;
}

export const LOCALE_COOKIE = "dyp-locale";
