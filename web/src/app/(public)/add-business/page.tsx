import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getCategories, getSubLocalities } from "@/lib/search";
import { getMessages, t, DEFAULT_LOCALE, LOCALE_COOKIE, isValidLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { AddBusinessForm } from "./AddBusinessForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Add Your Business — Dhanori Yellow Pages",
  description:
    "List your business on Dhanori Yellow Pages for free. Reach local customers in Dhanori, Pune.",
};

export default async function AddBusinessPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value ?? "";
  const locale: Locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const msgs = getMessages(locale);

  const [categories, subLocalities] = await Promise.all([
    getCategories(),
    getSubLocalities(),
  ]);

  return (
    <div className={styles.page}>
      <h1 className="text-title-page font-display">{t(msgs, "addBusiness.title")}</h1>
      <p className={`text-body ${styles.intro}`}>
        {t(msgs, "addBusiness.intro")}
      </p>
      <AddBusinessForm
        categories={categories as { slug: string; name: string }[]}
        subLocalities={subLocalities as { slug: string; name: string }[]}
        type="provider"
      />
    </div>
  );
}
