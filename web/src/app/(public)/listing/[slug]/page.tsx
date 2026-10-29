import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingBySlug, getListingReviews } from "@/lib/listings";
import { getOpenStatus } from "@/lib/status";
import { StatusTag } from "@/components/listings/StatusTag";
import { TrustBadge } from "@/components/listings/TrustBadge";
import { ActionButtons } from "@/components/listings/ActionButtons";
import {
  MapPinIcon,
  ClockIcon,
  StarIcon,
  CheckCircleIcon,
  ShareIcon,
  FlagIcon,
  ExternalLinkIcon,
} from "@/components/ui/Icons";
import type { HourEntry } from "@/lib/status";
import styles from "./page.module.css";

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Not Found" };

  return {
    title: `${listing.name} — ${listing.primaryService} in ${listing.subLocalityName}`,
    description: listing.description ?? `${listing.primaryService} in ${listing.subLocalityName}, Dhanori`,
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const { reviews, total: reviewTotal } = await getListingReviews(listing.id);

  // Compute open status
  const hours: HourEntry[] = listing.hours.map((h) => ({
    weekday: h.weekday,
    opens: h.opens,
    closes: h.closes,
  }));
  const openStatus = getOpenStatus(hours, listing.is24x7);

  // Today's weekday in IST
  const now = new Date();
  const istOffset = 5.5 * 60;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const todayWeekday =
    utcMinutes + istOffset >= 24 * 60
      ? (now.getUTCDay() + 1) % 7
      : now.getUTCDay();

  // Format verified date
  const verifiedDate = listing.verifiedOn
    ? new Date(listing.verifiedOn).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  // Map link
  const mapUrl =
    listing.lat && listing.lng
      ? `https://www.google.com/maps?q=${listing.lat},${listing.lng}`
      : null;

  // JSON-LD Schema.org
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.name,
    description: listing.description,
    telephone: listing.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.subLocalityName,
      addressRegion: "Maharashtra",
      addressCountry: "IN",
      streetAddress: listing.address,
    },
    ...(listing.lat &&
      listing.lng && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: listing.lat,
          longitude: listing.lng,
        },
      }),
    ...(listing.ratingAvg && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: listing.ratingAvg,
        reviewCount: listing.ratingCount,
      },
    }),
  };

  const isPromoted =
    listing.paidPlan !== "none" &&
    !listing.isEmergencyCategory;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className={styles.page}>
        <div className={`container ${styles.content}`}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">›</span>
            <Link href={`/category/${listing.categorySlug}`}>
              {listing.categoryName}
            </Link>
            <span aria-hidden="true">›</span>
            <span>{listing.name}</span>
          </nav>

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.tags}>
                <span className="badge badge--neutral">
                  {listing.primaryService}
                </span>
                <span className="badge badge--neutral">
                  <MapPinIcon size={14} />
                  {listing.subLocalityName}
                </span>
                {listing.emergencyAvailable && (
                  <span className="badge badge--danger-soft">
                    24×7 Emergency
                  </span>
                )}
                {isPromoted && (
                  <span className="badge badge--promoted">Promoted</span>
                )}
              </div>
              <h1 className="text-title-page font-display">{listing.name}</h1>
            </div>
            <StatusTag status={openStatus} />
          </div>

          {/* Trust + rating row */}
          <div className={styles.trustRow}>
            <TrustBadge
              status={listing.status as "verified" | "community_submitted"}
            />
            {listing.ratingAvg && (
              <span className={styles.rating}>
                <StarIcon
                  size={18}
                  filled
                  style={{ color: "var(--rating-star)" }}
                />
                <strong>{listing.ratingAvg}</strong>
                <span style={{ color: "var(--ink-muted)" }}>
                  ({listing.ratingCount} review{listing.ratingCount !== 1 ? "s" : ""})
                </span>
              </span>
            )}
          </div>

          {/* Description */}
          {listing.description && (
            <p className="text-body" style={{ marginTop: 16 }}>
              {listing.description}
            </p>
          )}

          {/* Info grid */}
          <div className={styles.infoGrid}>
            {/* Hours */}
            <section className={styles.infoSection}>
              <h2 className="text-title-section font-display">
                <ClockIcon size={20} /> Hours
              </h2>
              {listing.is24x7 ? (
                <p className="text-body">Open 24 hours, 7 days a week</p>
              ) : listing.hours.length > 0 ? (
                <table className={styles.hoursTable}>
                  <tbody>
                    {listing.hours.map((h) => (
                      <tr
                        key={h.weekday}
                        className={
                          h.weekday === todayWeekday ? styles.hoursToday : ""
                        }
                      >
                        <td className={styles.hoursDay}>
                          {WEEKDAY_NAMES[h.weekday]}
                          {h.weekday === todayWeekday && (
                            <span className={styles.todayBadge}>Today</span>
                          )}
                        </td>
                        <td className={styles.hoursTime}>
                          {h.opens} – {h.closes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p
                  className="text-body"
                  style={{ color: "var(--ink-muted)" }}
                >
                  Hours not provided
                </p>
              )}
            </section>

            {/* Location */}
            <section className={styles.infoSection}>
              <h2 className="text-title-section font-display">
                <MapPinIcon size={20} /> Location
              </h2>
              {listing.address && (
                <p className="text-body">{listing.address}</p>
              )}
              {listing.landmark && (
                <p className="text-meta" style={{ color: "var(--ink-muted)" }}>
                  Near {listing.landmark}
                </p>
              )}
              <p className="text-body" style={{ marginTop: 4 }}>
                {listing.subLocalityName}, Dhanori, Pune
              </p>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapLink}
                >
                  <ExternalLinkIcon size={16} /> Open in Maps
                </a>
              )}
              {listing.servesSubLocalities.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <p
                    className="text-meta"
                    style={{
                      color: "var(--ink-muted)",
                      marginBottom: 4,
                    }}
                  >
                    Also serves:
                  </p>
                  <div className={styles.servesTags}>
                    {listing.servesSubLocalities.map((name) => (
                      <span key={name} className="badge badge--neutral">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Services */}
            {listing.services && listing.services.length > 0 && (
              <section className={styles.infoSection}>
                <h2 className="text-title-section font-display">Services</h2>
                <ul className={styles.servicesList}>
                  {listing.services.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Verification */}
            <section className={styles.infoSection}>
              <h2 className="text-title-section font-display">
                <CheckCircleIcon size={20} /> Verification
              </h2>
              <TrustBadge
                status={listing.status as "verified" | "community_submitted"}
              />
              {verifiedDate && (
                <p
                  className="text-meta"
                  style={{ color: "var(--ink-muted)", marginTop: 8 }}
                >
                  Last verified on {verifiedDate}
                  {listing.verificationMethod &&
                    ` (${listing.verificationMethod})`}
                </p>
              )}
            </section>
          </div>

          {/* Reviews section */}
          <section className={styles.reviews}>
            <h2 className="text-title-section font-display">
              Reviews
              {reviewTotal > 0 && (
                <span
                  className="text-meta"
                  style={{
                    fontWeight: 400,
                    color: "var(--ink-muted)",
                    marginLeft: 8,
                  }}
                >
                  ({reviewTotal})
                </span>
              )}
            </h2>

            {reviews.length > 0 ? (
              <div className={styles.reviewList}>
                {reviews.map((review) => (
                  <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            size={16}
                            filled={star <= review.rating}
                            style={{
                              color:
                                star <= review.rating
                                  ? "var(--rating-star)"
                                  : "var(--border)",
                            }}
                          />
                        ))}
                      </div>
                      <span
                        className="text-meta"
                        style={{ color: "var(--ink-muted)" }}
                      >
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </span>
                    </div>
                    {review.displayName && (
                      <p className="text-meta" style={{ fontWeight: 600 }}>
                        {review.displayName}
                      </p>
                    )}
                    {review.comment && (
                      <p className="text-body">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p
                className="text-body"
                style={{ color: "var(--ink-muted)", marginTop: 8 }}
              >
                No reviews yet. Be the first to review this business.
              </p>
            )}
          </section>

          {/* Action links */}
          <div className={styles.actionLinks}>
            <button className={styles.actionLink} aria-label="Share listing">
              <ShareIcon size={18} /> Share
            </button>
            <Link
              href={`/report/${listing.id}`}
              className={styles.actionLink}
            >
              <FlagIcon size={18} /> Report an issue
            </Link>
            <Link href="/add-business" className={styles.actionLink}>
              Is this your business?
            </Link>
          </div>
        </div>

        {/* Sticky bottom bar — Call + WhatsApp (mobile) */}
        <div className={styles.stickyBar}>
          <div className="container">
            <ActionButtons
              phone={listing.phone}
              whatsapp={listing.whatsapp}
              listingName={listing.name}
            />
          </div>
        </div>
      </article>
    </>
  );
}
