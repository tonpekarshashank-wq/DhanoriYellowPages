"use client";

import { useState } from "react";
import { StarIcon } from "@/components/ui/Icons";
import styles from "./page.module.css";

interface ReviewModerationListProps {
  reviews: Record<string, unknown>[];
}

export function ReviewModerationList({ reviews: initialReviews }: ReviewModerationListProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [acting, setActing] = useState<number | null>(null);

  async function handleAction(reviewId: number, action: "approve" | "reject") {
    setActing(reviewId);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setActing(null);
    }
  }

  if (reviews.length === 0) {
    return (
      <p className="text-body" style={{ color: "var(--ink-muted)", marginTop: 16 }}>
        All caught up! No more pending reviews.
      </p>
    );
  }

  return (
    <div className={styles.list}>
      {reviews.map((r) => (
        <div key={r.id as number} className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <a
                href={`/listing/${r.listingSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.listingLink}
              >
                {r.listingName as string}
              </a>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    size={16}
                    filled={star <= (r.rating as number)}
                    style={{
                      color:
                        star <= (r.rating as number)
                          ? "var(--rating-star)"
                          : "var(--border)",
                    }}
                  />
                ))}
              </div>
            </div>
            <span className="text-meta" style={{ color: "var(--ink-muted)" }}>
              {new Date(r.createdAt as string).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {(r.displayName as string) ? (
            <p className="text-meta" style={{ fontWeight: 600 }}>
              {r.displayName as string}
            </p>
          ) : null}
          {(r.comment as string) ? (
            <p className="text-body" style={{ marginTop: 4 }}>
              {r.comment as string}
            </p>
          ) : null}

          <div className={styles.actions}>
            <button
              className="btn btn--primary"
              onClick={() => handleAction(r.id as number, "approve")}
              disabled={acting === (r.id as number)}
            >
              {acting === (r.id as number) ? "…" : "Approve"}
            </button>
            <button
              className="btn btn--outline"
              onClick={() => handleAction(r.id as number, "reject")}
              disabled={acting === (r.id as number)}
              style={{ color: "var(--on-danger-soft)" }}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
