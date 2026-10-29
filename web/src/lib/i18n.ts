/**
 * Minimal i18n framework.
 * Supports en, mr (Marathi) and hi (Hindi).
 * Strings are loaded server-side; the switcher reloads via route prefix.
 */

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
