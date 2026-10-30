import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getListingById } from "@/lib/listings";
import { getMessages, t, DEFAULT_LOCALE, LOCALE_COOKIE, isValidLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { ReportForm } from "./ReportForm";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(parseInt(id, 10));
  if (!listing) return { title: "Not Found" };
  return {
    title: `Report ${listing.name} — Dhanori Yellow Pages`,
  };
}

export default async function ReportPage({ params }: PageProps) {
  const { id } = await params;
  const listingId = parseInt(id, 10);
  if (isNaN(listingId)) notFound();

  const listing = await getListingById(listingId);
  if (!listing) notFound();

  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value ?? "";
  const locale: Locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const msgs = getMessages(locale);

  return (
    <div className={styles.page}>
      <h1 className="text-title-page font-display">{t(msgs, "report.title")}</h1>
      <p className="text-body" style={{ color: "var(--ink-muted)", marginBottom: 8 }}>
        {t(msgs, "report.reporting")}{" "}
        <Link href={`/listing/${listing.slug}`} style={{ color: "var(--primary)", fontWeight: 600 }}>
          {listing.name}
        </Link>
      </p>
      <p className="text-body" style={{ color: "var(--ink-muted)", marginBottom: 24 }}>
        {t(msgs, "report.intro")}
      </p>
      <ReportForm listingId={listingId} listingName={listing.name} />
    </div>
  );
}
