import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingById } from "@/lib/listings";
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

  return (
    <div className={styles.page}>
      <h1 className="text-title-page font-display">Report an Issue</h1>
      <p className="text-body" style={{ color: "var(--ink-muted)", marginBottom: 8 }}>
        Reporting:{" "}
        <Link href={`/listing/${listing.slug}`} style={{ color: "var(--primary)", fontWeight: 600 }}>
          {listing.name}
        </Link>
      </p>
      <p className="text-body" style={{ color: "var(--ink-muted)", marginBottom: 24 }}>
        Help us keep Dhanori Yellow Pages accurate.
        Your report will be reviewed by our team.
      </p>
      <ReportForm listingId={listingId} listingName={listing.name} />
    </div>
  );
}
