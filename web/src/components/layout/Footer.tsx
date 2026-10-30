"use client";

import Link from "next/link";
import { useTranslation } from "@/components/i18n/I18nProvider";
import styles from "./Footer.module.css";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.notice}>
          {t("footer.freeNotice")}
        </p>
        <nav className={styles.links}>
          <Link href="/about">{t("nav.about")}</Link>
          <Link href="/about#verify">{t("footer.howWeVerify")}</Link>
          <Link href="/add-business">{t("nav.addBusiness")}</Link>
          <Link href="/get-featured">{t("footer.getFeatured")}</Link>
        </nav>
        <p className={styles.copy}>
          {t("footer.copyright", { year: String(new Date().getFullYear()) })}
        </p>
      </div>
    </footer>
  );
}
