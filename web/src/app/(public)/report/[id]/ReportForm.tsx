"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const REASONS = [
  { value: "incorrect_info", label: "Incorrect information" },
  { value: "closed_permanently", label: "Permanently closed" },
  { value: "spam", label: "Spam or fake listing" },
  { value: "duplicate", label: "Duplicate listing" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "other", label: "Other" },
];

interface Props {
  listingId: number;
  listingName: string;
}

export function ReportForm({ listingId, listingName }: Props) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          reason,
          details: details || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={styles.success}>
        <div className={styles.successTitle}>Report Submitted</div>
        <p className="text-body">
          Thank you for helping keep Dhanori Yellow Pages accurate.
          Our team will review your report about <strong>{listingName}</strong>.
        </p>
        <Link href="/" className="btn btn--primary" style={{ marginTop: 16, display: "inline-block" }}>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Reason <span className={styles.required}>*</span>
        </label>
        <div className={styles.radioGroup}>
          {REASONS.map((r) => (
            <label key={r.value} className={styles.radioLabel}>
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={(e) => setReason(e.target.value)}
                className={styles.radio}
                required
              />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Details</label>
        <textarea
          className={styles.textarea}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Please provide any additional details that would help us investigate"
          maxLength={1000}
          rows={4}
        />
      </div>

      <button
        type="submit"
        className="btn btn--primary"
        disabled={submitting || !reason}
        style={{ alignSelf: "flex-start", padding: "12px 32px" }}
      >
        {submitting ? "Submitting…" : "Submit Report"}
      </button>
    </form>
  );
}
