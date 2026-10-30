import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getMessages, t, DEFAULT_LOCALE, LOCALE_COOKIE, isValidLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Get Featured — Dhanori Yellow Pages",
  description:
    "Promote your business on Dhanori Yellow Pages. Reach more local customers with promoted listings and ranking boosts.",
};

const PLANS = [
  {
    key: "free",
    titleKey: "getFeatured.freePlanTitle",
    priceKey: "getFeatured.freePlanPrice",
    features: [
      "getFeatured.freeFeature1",
      "getFeatured.freeFeature2",
      "getFeatured.freeFeature3",
      "getFeatured.freeFeature4",
    ],
    ctaKey: "getFeatured.freePlanCta",
    href: "/add-business",
    highlight: false,
  },
  {
    key: "promoted",
    titleKey: "getFeatured.promotedPlanTitle",
    priceKey: "getFeatured.promotedPlanPrice",
    features: [
      "getFeatured.promotedFeature1",
      "getFeatured.promotedFeature2",
      "getFeatured.promotedFeature3",
      "getFeatured.promotedFeature4",
      "getFeatured.promotedFeature5",
    ],
    ctaKey: "getFeatured.promotedPlanCta",
    href: "mailto:hello@dhanoriyellowpages.in?subject=Promoted%20Listing",
    highlight: true,
  },
  {
    key: "boost",
    titleKey: "getFeatured.boostPlanTitle",
    priceKey: "getFeatured.boostPlanPrice",
    features: [
      "getFeatured.boostFeature1",
      "getFeatured.boostFeature2",
      "getFeatured.boostFeature3",
    ],
    ctaKey: "getFeatured.boostPlanCta",
    href: "mailto:hello@dhanoriyellowpages.in?subject=Ranking%20Boost",
    highlight: false,
  },
];

export default async function GetFeaturedPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value ?? "";
  const locale: Locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const msgs = getMessages(locale);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className="text-title-page font-display">{t(msgs, "getFeatured.title")}</h1>
        <p className="text-body" style={{ color: "var(--ink-muted)", maxWidth: 560 }}>
          {t(msgs, "getFeatured.subtitle")}
        </p>
      </div>

      <div className={styles.plans}>
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`${styles.planCard} ${plan.highlight ? styles.planHighlight : ""}`}
          >
            <h2 className="text-title-section font-display">{t(msgs, plan.titleKey)}</h2>
            <div className={styles.price}>{t(msgs, plan.priceKey)}</div>
            <ul className={styles.features}>
              {plan.features.map((fKey) => (
                <li key={fKey}>{t(msgs, fKey)}</li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={`btn ${plan.highlight ? "btn--primary" : "btn--outline"} ${styles.cta}`}
            >
              {t(msgs, plan.ctaKey)}
            </Link>
          </div>
        ))}
      </div>

      <section className={styles.faq}>
        <h2 className="text-title-section font-display">{t(msgs, "getFeatured.faqTitle")}</h2>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQ}>{t(msgs, "getFeatured.faq1Q")}</h3>
            <p className="text-body" style={{ color: "var(--ink-muted)" }}>
              {t(msgs, "getFeatured.faq1A")}
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQ}>{t(msgs, "getFeatured.faq2Q")}</h3>
            <p className="text-body" style={{ color: "var(--ink-muted)" }}>
              {t(msgs, "getFeatured.faq2A")}
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQ}>{t(msgs, "getFeatured.faq3Q")}</h3>
            <p className="text-body" style={{ color: "var(--ink-muted)" }}>
              {t(msgs, "getFeatured.faq3A")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
