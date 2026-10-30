"use client";

import Link from "next/link";
import { useTranslation } from "@/components/i18n/I18nProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import styles from "./Header.module.css";

export function Header() {
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo} aria-label={t("nav.home")}>
          <span className={styles.logoMark}>{t("site.logoAbbr")}</span>
          <span className={styles.logoText}>{t("site.name")}</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/emergency" className={styles.navLink}>
            {t("nav.emergency")}
          </Link>
          <Link href="/add-business" className={styles.navLink}>
            {t("nav.addBusiness")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
