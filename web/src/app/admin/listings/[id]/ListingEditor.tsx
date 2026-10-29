"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ListingEditorProps {
  listing: Record<string, unknown>;
  hours: { weekday: number; opens: string; closes: string }[];
  categories: { id: number; name: string; slug: string }[];
  subLocalities: { id: number; name: string; slug: string }[];
}

export function ListingEditor({
  listing,
  hours: initialHours,
  categories,
  subLocalities,
}: ListingEditorProps) {
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [hours, setHours] = useState(initialHours);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setResult(null);

    const form = new FormData(e.currentTarget);

    const data = {
      name: form.get("name") as string,
      primaryService: form.get("primaryService") as string,
      phone: form.get("phone") as string,
      whatsapp: (form.get("whatsapp") as string) || null,
      address: (form.get("address") as string) || null,
      landmark: (form.get("landmark") as string) || null,
      description: (form.get("description") as string) || null,
      status: form.get("status") as string,
      is24x7: form.get("is24x7") === "on",
      emergencyAvailable: form.get("emergencyAvailable") === "on",
      verificationMethod: (form.get("verificationMethod") as string) || null,
      hours,
    };

    try {
      const res = await fetch(`/api/admin/listings/${listing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (res.ok) {
        setResult({ ok: true, message: "Listing updated successfully." });
      } else {
        setResult({ ok: false, message: json.error ?? "Update failed." });
      }
    } catch {
      setResult({ ok: false, message: "Network error." });
    } finally {
      setSaving(false);
    }
  }

  function addHourRow() {
    const usedDays = new Set(hours.map((h) => h.weekday));
    const nextDay = [1, 2, 3, 4, 5, 6, 0].find((d) => !usedDays.has(d));
    if (nextDay === undefined) return;
    setHours([...hours, { weekday: nextDay, opens: "09:00", closes: "18:00" }]);
  }

  function removeHourRow(idx: number) {
    setHours(hours.filter((_, i) => i !== idx));
  }

  function updateHour(idx: number, field: string, value: string | number) {
    setHours(hours.map((h, i) => (i === idx ? { ...h, [field]: value } : h)));
  }

  return (
    <form onSubmit={handleSubmit} className={styles.editor}>
      <div className={styles.editorHeader}>
        <div>
          <Link href="/admin/listings" className={styles.backLink}>
            ← Back to Listings
          </Link>
          <h1 className="text-title-page font-display">
            Edit: {listing.name as string}
          </h1>
        </div>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {result && (
        <div
          className={styles.resultMsg}
          style={{
            background: result.ok ? "var(--trust-soft)" : "var(--danger-soft)",
            color: result.ok ? "var(--on-trust-soft)" : "var(--on-danger-soft)",
          }}
        >
          {result.message}
        </div>
      )}

      <div className={styles.grid}>
        {/* Basic Info */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Basic Info</legend>
          <label className={styles.label}>
            Name
            <input name="name" defaultValue={listing.name as string} className="input" required />
          </label>
          <label className={styles.label}>
            Primary Service
            <input name="primaryService" defaultValue={listing.primary_service as string} className="input" required />
          </label>
          <label className={styles.label}>
            Description
            <textarea name="description" defaultValue={(listing.description as string) ?? ""} className="input" rows={3} />
          </label>
        </fieldset>

        {/* Contact */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Contact</legend>
          <label className={styles.label}>
            Phone
            <input name="phone" defaultValue={listing.phone as string} className="input" required />
          </label>
          <label className={styles.label}>
            WhatsApp
            <input name="whatsapp" defaultValue={(listing.whatsapp as string) ?? ""} className="input" />
          </label>
        </fieldset>

        {/* Location */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Location</legend>
          <label className={styles.label}>
            Address
            <input name="address" defaultValue={(listing.address as string) ?? ""} className="input" />
          </label>
          <label className={styles.label}>
            Landmark
            <input name="landmark" defaultValue={(listing.landmark as string) ?? ""} className="input" />
          </label>
        </fieldset>

        {/* Status */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Status & Flags</legend>
          <label className={styles.label}>
            Status
            <select name="status" defaultValue={listing.status as string} className="input">
              <option value="draft">Draft</option>
              <option value="community_submitted">Community Submitted</option>
              <option value="verified">Verified</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
          <label className={styles.label}>
            Verification Method
            <select name="verificationMethod" defaultValue={(listing.verification_method as string) ?? ""} className="input">
              <option value="">Not set</option>
              <option value="call">Phone call</option>
              <option value="visit">In-person visit</option>
              <option value="document">Document</option>
            </select>
          </label>
          <label className={styles.checkLabel}>
            <input type="checkbox" name="is24x7" defaultChecked={listing.is_24x7 as boolean} />
            Open 24/7
          </label>
          <label className={styles.checkLabel}>
            <input type="checkbox" name="emergencyAvailable" defaultChecked={listing.emergency_available as boolean} />
            Emergency available
          </label>
        </fieldset>

        {/* Hours */}
        <fieldset className={`${styles.fieldset} ${styles.fullWidth}`}>
          <legend className={styles.legend}>Operating Hours</legend>
          {hours.map((h, idx) => (
            <div key={idx} className={styles.hourRow}>
              <select
                value={h.weekday}
                onChange={(e) => updateHour(idx, "weekday", parseInt(e.target.value))}
                className="input"
                style={{ width: 140 }}
              >
                {WEEKDAY_NAMES.map((name, i) => (
                  <option key={i} value={i}>{name}</option>
                ))}
              </select>
              <input
                type="time"
                value={h.opens}
                onChange={(e) => updateHour(idx, "opens", e.target.value)}
                className="input"
                style={{ width: 120 }}
              />
              <span>to</span>
              <input
                type="time"
                value={h.closes}
                onChange={(e) => updateHour(idx, "closes", e.target.value)}
                className="input"
                style={{ width: 120 }}
              />
              <button
                type="button"
                onClick={() => removeHourRow(idx)}
                className={styles.removeBtn}
              >
                ×
              </button>
            </div>
          ))}
          {hours.length < 7 && (
            <button type="button" onClick={addHourRow} className="btn btn--outline" style={{ marginTop: 8 }}>
              + Add day
            </button>
          )}
        </fieldset>
      </div>
    </form>
  );
}
