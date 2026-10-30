"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/components/i18n/I18nProvider";
import styles from "./page.module.css";

const REASON_KEYS = [
  { value: "incorrect_info", key: "report.incorrectInfo" },
  { value: "closed_permanently", key: "report.closedPermanently" },
  { value: "spam", key: "report.spam" },
  { value: "duplicate", key: "report.duplicate" },
  { value: "inappropriate", key: "report.inappropriate" },
  { value: "other", key: "report.other" },
];

interface Props {
  listingId: number;
  listingName: string;
}

export function ReportForm({ listingId, listingName }: Props) {
  const { t } = useTranslation();
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
        setError(data.error || t("common.error"));
        return;
      }

      setSuccess(true);
    } catch {
      setError(t("common.networkError"));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={styles.success}>
        <div className={styles.successTitle}>{t("success.reportSubmitted")}</div>
        <p className="text-body">
          {t("success.reportThanks", { name: listingName })}
        </p>
        <Link href="/" className="btn btn--primary" style={{ marginTop: 16, display: "inline-block" }}>
          {t("success.backToHome")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          {t("report.reason")} <span className={styles.required}>*</span>
        </label>
        <div className={styles.radioGroup}>
          {REASON_KEYS.map((r) => (
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
              {t(r.key)}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          {t("report.details")}
          <textarea
            className={styles.textarea}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={t("report.detailsPlaceholder")}
            maxLength={1000}
            rows={4}
          />
        </label>
      </div>

      <button
        type="submit"
        className="btn btn--primary"
        disabled={submitting || !reason}
        style={{ alignSelf: "flex-start", padding: "12px 32px" }}
      >
        {submitting ? t("report.submitting") : t("report.submit")}
      </button>
    </form>
  );
}
