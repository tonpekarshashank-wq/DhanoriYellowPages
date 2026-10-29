"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

interface Props {
  categories: { slug: string; name: string }[];
  subLocalities: { slug: string; name: string }[];
  type: "provider" | "suggestion";
}

export function AddBusinessForm({ categories, subLocalities, type }: Props) {
  const [form, setForm] = useState({
    name: "",
    primaryService: "",
    phone: "",
    whatsapp: "",
    address: "",
    landmark: "",
    description: "",
    services: "",
    categorySlug: "",
    subLocalitySlug: "",
    submitterName: "",
    submitterRelation: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: form.name,
          primaryService: form.primaryService,
          phone: form.phone,
          whatsapp: form.whatsapp || undefined,
          address: form.address || undefined,
          landmark: form.landmark || undefined,
          description: form.description || undefined,
          services: form.services
            ? form.services.split(",").map((s) => s.trim()).filter(Boolean)
            : undefined,
          categorySlug: form.categorySlug,
          subLocalitySlug: form.subLocalitySlug,
          submitterName: form.submitterName || undefined,
          submitterRelation: form.submitterRelation || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={styles.success}>
        <div className={styles.successTitle}>Thank you!</div>
        <p className="text-body">
          Your {type === "provider" ? "business listing" : "suggestion"} has been
          submitted and will be reviewed by our team.
          It will appear on the site once approved.
        </p>
        <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/" className="btn btn--primary">Back to Home</Link>
          <button
            className="btn btn--outline"
            onClick={() => { setSuccess(false); setForm({ name: "", primaryService: "", phone: "", whatsapp: "", address: "", landmark: "", description: "", services: "", categorySlug: "", subLocalitySlug: "", submitterName: "", submitterRelation: "" }); }}
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      {/* Business details */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Business Name <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={styles.input}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="e.g. Sharma Medical Store"
          required
          maxLength={200}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Primary Service <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={styles.input}
          value={form.primaryService}
          onChange={(e) => update("primaryService", e.target.value)}
          placeholder="e.g. Pharmacy, Plumber, Doctor"
          required
          maxLength={200}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Category <span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            value={form.categorySlug}
            onChange={(e) => update("categorySlug", e.target.value)}
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Area <span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            value={form.subLocalitySlug}
            onChange={(e) => update("subLocalitySlug", e.target.value)}
            required
          >
            <option value="">Select area</option>
            {subLocalities.map((sl) => (
              <option key={sl.slug} value={sl.slug}>{sl.name}</option>
            ))}
          </select>
        </div>
      </div>

      <hr className={styles.divider} />

      {/* Contact */}
      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Phone <span className={styles.required}>*</span>
          </label>
          <input
            type="tel"
            className={styles.input}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="e.g. 9876543210"
            required
            maxLength={20}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>WhatsApp</label>
          <input
            type="tel"
            className={styles.input}
            value={form.whatsapp}
            onChange={(e) => update("whatsapp", e.target.value)}
            placeholder="If different from phone"
            maxLength={20}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Address</label>
        <input
          type="text"
          className={styles.input}
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          placeholder="Shop no., building, street"
          maxLength={500}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Landmark</label>
        <input
          type="text"
          className={styles.input}
          value={form.landmark}
          onChange={(e) => update("landmark", e.target.value)}
          placeholder="e.g. Near Dhanori Phata"
          maxLength={200}
        />
      </div>

      <hr className={styles.divider} />

      {/* Description and services */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Description</label>
        <textarea
          className={styles.textarea}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Brief description of the business"
          maxLength={2000}
          rows={3}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Services Offered</label>
        <input
          type="text"
          className={styles.input}
          value={form.services}
          onChange={(e) => update("services", e.target.value)}
          placeholder="Comma-separated, e.g. X-ray, Blood test, ECG"
          maxLength={500}
        />
      </div>

      {type === "suggestion" && (
        <>
          <hr className={styles.divider} />
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Your Name</label>
              <input
                type="text"
                className={styles.input}
                value={form.submitterName}
                onChange={(e) => update("submitterName", e.target.value)}
                placeholder="Optional"
                maxLength={100}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Your Relation</label>
              <select
                className={styles.select}
                value={form.submitterRelation}
                onChange={(e) => update("submitterRelation", e.target.value)}
              >
                <option value="">Select</option>
                <option value="customer">Customer</option>
                <option value="neighbor">Neighbor</option>
                <option value="friend">Friend/Family of owner</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </>
      )}

      <button
        type="submit"
        className="btn btn--primary"
        disabled={submitting}
        style={{ marginTop: 8, alignSelf: "flex-start", padding: "12px 32px" }}
      >
        {submitting ? "Submitting…" : type === "provider" ? "Submit Listing" : "Suggest Business"}
      </button>
    </form>
  );
}
