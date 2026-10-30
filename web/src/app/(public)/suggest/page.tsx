import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getCategories, getSubLocalities } from "@/lib/search";
import { getMessages, t, DEFAULT_LOCALE, LOCALE_COOKIE, isValidLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { AddBusinessForm } from "../add-business/AddBusinessForm";
import styles from "../add-business/page.module.css";

export const metadata: Metadata = {
  title: "Suggest a Business — Dhanori Yellow Pages",
  description:
    "Know a business in Dhanori that should be listed? Suggest it here.",
};

export default async function SuggestBusinessPage() {
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
      <h1 className="text-title-page font-display">{t(msgs, "suggest.title")}</h1>
      <p className={`text-body ${styles.intro}`}>
        {t(msgs, "suggest.intro")}
      </p>
      <AddBusinessForm
        categories={categories as { slug: string; name: string }[]}
        subLocalities={subLocalities as { slug: string; name: string }[]}
        type="suggestion"
      />
    </div>
  );
}
