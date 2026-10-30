"use client";

import { useState, useRef, useEffect } from "react";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n";
import { useTranslation } from "./I18nProvider";
import { GlobeIcon } from "@/components/ui/Icons";
import styles from "./LanguageSwitcher.module.css";

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        aria-expanded={open}
      >
        <GlobeIcon size={20} />
        <span className={styles.label}>
          {locale.toUpperCase()}
        </span>
      </button>

      {open && (
        <ul className={styles.menu} role="listbox">
          {LOCALES.map((l) => (
            <li key={l}>
              <button
                className={`${styles.option} ${l === locale ? styles.active : ""}`}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                role="option"
                aria-selected={l === locale}
              >
                {LOCALE_LABELS[l]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
