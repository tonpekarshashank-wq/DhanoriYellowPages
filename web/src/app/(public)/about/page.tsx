import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getMessages, t, DEFAULT_LOCALE, LOCALE_COOKIE, isValidLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About — Dhanori Yellow Pages",
  description:
    "Dhanori Yellow Pages is a free, community-driven business directory for Dhanori, Pune.",
};

export default async function AboutPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value ?? "";
  const locale: Locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const msgs = getMessages(locale);

  return (
    <div className={styles.page}>
      <h1 className="text-title-page font-display">{t(msgs, "about.title")}</h1>

      <section className={styles.section}>
        <p className="text-body">{t(msgs, "about.introParagraph")}</p>
      </section>

      <section className={styles.section}>
        <h2 className="text-title-section font-display">{t(msgs, "about.whyTitle")}</h2>
        <p className="text-body">{t(msgs, "about.whyParagraph")}</p>
      </section>

      <section className={styles.section}>
        <h2 className="text-title-section font-display">{t(msgs, "about.howTitle")}</h2>
        <ul className={styles.list}>
          <li><strong>{t(msgs, "about.howSearch")}</strong></li>
          <li><strong>{t(msgs, "about.howVerified")}</strong></li>
          <li><strong>{t(msgs, "about.howReviews")}</strong></li>
          <li><strong>{t(msgs, "about.howEmergency")}</strong></li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className="text-title-section font-display">{t(msgs, "about.involvedTitle")}</h2>
        <div className={styles.cards}>
          <Link href="/add-business" className={styles.card}>
            <strong>{t(msgs, "about.addYourBusiness")}</strong>
            <span className="text-meta" style={{ color: "var(--ink-muted)" }}>
              {t(msgs, "about.addYourBusinessDesc")}
            </span>
          </Link>
          <Link href="/suggest" className={styles.card}>
            <strong>{t(msgs, "about.suggestBusiness")}</strong>
            <span className="text-meta" style={{ color: "var(--ink-muted)" }}>
              {t(msgs, "about.suggestBusinessDesc")}
            </span>
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="text-title-section font-display">{t(msgs, "about.coverageTitle")}</h2>
        <p className="text-body">{t(msgs, "about.coverageParagraph")}</p>
      </section>

      <section className={styles.section}>
        <h2 className="text-title-section font-display">{t(msgs, "about.contactTitle")}</h2>
        <p className="text-body">
          {t(msgs, "about.contactParagraph")}{" "}
          <a href="mailto:hello@dhanoriyellowpages.in" className={styles.link}>
            hello@dhanoriyellowpages.in
          </a>
        </p>
      </section>
    </div>
  );
}
