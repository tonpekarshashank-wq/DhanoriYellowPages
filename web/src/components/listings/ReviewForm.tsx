"use client";

import { useState } from "react";
import { StarIcon } from "@/components/ui/Icons";
import styles from "./ReviewForm.module.css";

interface ReviewFormProps {
  listingId: number;
  listingName: string;
}

export function ReviewForm({ listingId, listingName }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          rating,
          comment: comment.trim() || null,
          displayName: displayName.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          ok: true,
          message:
            "Thank you! Your review will appear after moderation.",
        });
        setRating(0);
        setComment("");
        setDisplayName("");
      } else {
        setResult({
          ok: false,
          message: data.error ?? "Something went wrong. Please try again.",
        });
      }
    } catch {
      setResult({
        ok: false,
        message: "Network error. Please check your connection.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 className={`text-title-card font-display ${styles.title}`}>
        Rate {listingName}
      </h3>

      {/* Star picker */}
      <fieldset className={styles.starPicker}>
        <legend className="sr-only">Rating</legend>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={styles.starBtn}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          >
            <StarIcon
              size={28}
              filled={star <= (hoveredStar || rating)}
              style={{
                color:
                  star <= (hoveredStar || rating)
                    ? "var(--rating-star)"
                    : "var(--border)",
                transition: "color 0.1s ease",
              }}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className={`text-meta ${styles.ratingLabel}`}>
            {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
          </span>
        )}
      </fieldset>

      {/* Name (optional) */}
      <input
        type="text"
        placeholder="Your name (optional)"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        maxLength={50}
        className="input"
        autoComplete="name"
      />

      {/* Comment */}
      <textarea
        placeholder="Share your experience (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={3}
        className="input"
      />

      {/* Result message */}
      {result && (
        <p
          className={`text-meta ${styles.resultMsg}`}
          style={{ color: result.ok ? "var(--trust)" : "var(--on-danger-soft)" }}
        >
          {result.message}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="btn btn--primary tap-target"
        disabled={rating === 0 || submitting}
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
