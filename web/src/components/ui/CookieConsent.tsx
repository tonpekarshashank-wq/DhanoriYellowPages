"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/components/i18n/I18nProvider";
import styles from "./CookieConsent.module.css";

const CONSENT_KEY = "dyp-consent";

export function CookieConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  function handleAccept() {
    try {
      localStorage.setItem(CONSENT_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className={styles.banner} role="alert">
      <p className={styles.text}>{t("consent.message")}</p>
      <button className="btn btn--primary" onClick={handleAccept}>
        {t("consent.accept")}
      </button>
    </div>
  );
}
