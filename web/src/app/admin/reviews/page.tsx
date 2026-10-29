import { getPendingReviews } from "@/lib/reviews";
import { ReviewModerationList } from "./ReviewModerationList";

export default async function AdminReviewsPage() {
  const { reviews, total } = await getPendingReviews();

  return (
    <div>
      <h1 className="text-title-page font-display">
        Review Moderation
        {total > 0 && (
          <span
            className="text-meta"
            style={{ fontWeight: 400, color: "var(--ink-muted)", marginLeft: 12 }}
          >
            {total} pending
          </span>
        )}
      </h1>

      {reviews.length > 0 ? (
        <ReviewModerationList
          reviews={reviews as Record<string, unknown>[]}
        />
      ) : (
        <p className="text-body" style={{ color: "var(--ink-muted)", marginTop: 16 }}>
          No reviews pending moderation.
        </p>
      )}
    </div>
  );
}
