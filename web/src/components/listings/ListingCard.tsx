import { MapPinIcon, ClockIcon, StarIcon } from "@/components/ui/Icons";
import { StatusTag } from "./StatusTag";
import { TrustBadge } from "./TrustBadge";
import { ActionButtons } from "./ActionButtons";
import type { OpenStatus } from "@/lib/status";
import styles from "./ListingCard.module.css";

export interface ListingCardData {
  id: number;
  name: string;
  slug: string;
  primaryService: string;
  subLocalityName: string;
  status: "verified" | "community_submitted";
  openStatus: OpenStatus;
  phone: string;
  whatsapp?: string | null;
  description?: string | null;
  ratingAvg?: string | null;
  ratingCount?: number;
  hoursDetail?: string | null;
  emergencyAvailable?: boolean;
  isPromoted?: boolean;
}

interface ListingCardProps {
  listing: ListingCardData;
}

export function ListingCard({ listing }: ListingCardProps) {
  const {
    name,
    slug,
    primaryService,
    subLocalityName,
    status,
    openStatus,
    phone,
    whatsapp,
    description,
    ratingAvg,
    ratingCount,
    emergencyAvailable,
    isPromoted,
  } = listing;

  const cardId = `listing-${listing.id}`;

  return (
    <article
      className={`card ${styles.card} ${isPromoted ? "card--promoted" : ""}`}
      aria-labelledby={`${cardId}-name`}
    >
      {/* Top row: tags + name | status */}
      <div className={styles.topRow}>
        <div className={styles.nameBlock}>
          <div className={styles.tags}>
            <span className="badge badge--neutral">{primaryService}</span>
            <span className="badge badge--neutral">
              <MapPinIcon size={14} />
              {subLocalityName}
            </span>
            {emergencyAvailable && (
              <span className="badge badge--danger-soft">24×7 Emergency</span>
            )}
            {isPromoted && (
              <span className="badge badge--promoted">Promoted</span>
            )}
          </div>
          <h3 id={`${cardId}-name`} className={`font-display text-title-card line-clamp-2 ${styles.name}`}>
            <a href={`/listing/${slug}`} className={styles.nameLink}>
              {name}
            </a>
          </h3>
        </div>
        <StatusTag status={openStatus} />
      </div>

      {/* Verification badge */}
      <div className={styles.badges}>
        <TrustBadge status={status} />
      </div>

      {/* Meta row: rating · hours */}
      <div className={`text-meta ${styles.metaRow}`}>
        {ratingAvg && (
          <span className={styles.rating}>
            <StarIcon size={16} filled style={{ color: "var(--rating-star)" }} />
            <strong style={{ color: "var(--ink)" }}>{ratingAvg}</strong>
            {ratingCount !== undefined && ratingCount > 0 && (
              <span>({ratingCount} reviews)</span>
            )}
          </span>
        )}
        {openStatus.state !== "open_24h" && openStatus.state === "open" && (
          <span className={styles.metaItem}>
            <ClockIcon size={16} />
            Until {openStatus.closesAt}
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-body line-clamp-2" style={{ color: "var(--ink-muted)" }}>
          {description}
        </p>
      )}

      {/* Actions */}
      <ActionButtons phone={phone} whatsapp={whatsapp} listingName={name} />
    </article>
  );
}
