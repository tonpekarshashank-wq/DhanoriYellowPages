"use client";

import { createContext, useContext, useCallback } from "react";
import type { Locale } from "@/lib/i18n";
import { getMessages, t as translate, LOCALE_COOKIE } from "@/lib/i18n";

type Messages = ReturnType<typeof getMessages>;

interface I18nContextValue {
  locale: Locale;
  messages: Messages;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const msgs = getMessages(locale);

  const tFn = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(msgs, key, vars),
    [msgs]
  );

  const setLocale = useCallback((newLocale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${newLocale};path=/;max-age=${365 * 24 * 60 * 60};samesite=lax`;
    window.location.reload();
  }, []);

  return (
    <I18nContext.Provider value={{ locale, messages: msgs, t: tFn, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within I18nProvider");
  }
  return ctx;
}
