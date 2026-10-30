"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/components/i18n/I18nProvider";
import styles from "./page.module.css";

interface Props {
  categories: { slug: string; name: string }[];
  subLocalities: { slug: string; name: string }[];
  type: "provider" | "suggestion";
}

export function AddBusinessForm({ categories, subLocalities, type }: Props) {
  const { t } = useTranslation();
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
        <div className={styles.successTitle}>{t("success.thankYou")}</div>
        <p className="text-body">
          {t("success.submissionReceived", {
            type: type === "provider" ? t("success.typeListing") : t("success.typeSuggestion"),
          })}
        </p>
        <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/" className="btn btn--primary">{t("success.backToHome")}</Link>
          <button
            className="btn btn--outline"
            onClick={() => { setSuccess(false); setForm({ name: "", primaryService: "", phone: "", whatsapp: "", address: "", landmark: "", description: "", services: "", categorySlug: "", subLocalitySlug: "", submitterName: "", submitterRelation: "" }); }}
          >
            {t("success.submitAnother")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          {t("addBusiness.businessName")} <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={styles.input}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder={t("addBusiness.businessNamePlaceholder")}
          required
          maxLength={200}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          {t("addBusiness.primaryService")} <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={styles.input}
          value={form.primaryService}
          onChange={(e) => update("primaryService", e.target.value)}
          placeholder={t("addBusiness.primaryServicePlaceholder")}
          required
          maxLength={200}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            {t("addBusiness.category")} <span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            value={form.categorySlug}
            onChange={(e) => update("categorySlug", e.target.value)}
            required
          >
            <option value="">{t("addBusiness.selectCategory")}</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            {t("addBusiness.area")} <span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            value={form.subLocalitySlug}
            onChange={(e) => update("subLocalitySlug", e.target.value)}
            required
          >
            <option value="">{t("addBusiness.selectArea")}</option>
            {subLocalities.map((sl) => (
              <option key={sl.slug} value={sl.slug}>{sl.name}</option>
            ))}
          </select>
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            {t("addBusiness.phone")} <span className={styles.required}>*</span>
          </label>
          <input
            type="tel"
            className={styles.input}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder={t("addBusiness.phonePlaceholder")}
            required
            maxLength={20}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>{t("addBusiness.whatsapp")}</label>
          <input
            type="tel"
            className={styles.input}
            value={form.whatsapp}
            onChange={(e) => update("whatsapp", e.target.value)}
            placeholder={t("addBusiness.whatsappPlaceholder")}
            maxLength={20}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>{t("addBusiness.address")}</label>
        <input
          type="text"
          className={styles.input}
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          placeholder={t("addBusiness.addressPlaceholder")}
          maxLength={500}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>{t("addBusiness.landmark")}</label>
        <input
          type="text"
          className={styles.input}
          value={form.landmark}
          onChange={(e) => update("landmark", e.target.value)}
          placeholder={t("addBusiness.landmarkPlaceholder")}
          maxLength={200}
        />
      </div>

      <hr className={styles.divider} />

      <div className={styles.fieldGroup}>
        <label className={styles.label}>{t("addBusiness.description")}</label>
        <textarea
          className={styles.textarea}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder={t("addBusiness.descriptionPlaceholder")}
          maxLength={2000}
          rows={3}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>{t("addBusiness.servicesOffered")}</label>
        <input
          type="text"
          className={styles.input}
          value={form.services}
          onChange={(e) => update("services", e.target.value)}
          placeholder={t("addBusiness.servicesPlaceholder")}
          maxLength={500}
        />
      </div>

      {type === "suggestion" && (
        <>
          <hr className={styles.divider} />
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>{t("addBusiness.yourName")}</label>
              <input
                type="text"
                className={styles.input}
                value={form.submitterName}
                onChange={(e) => update("submitterName", e.target.value)}
                placeholder={t("common.optional")}
                maxLength={100}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>{t("addBusiness.yourRelation")}</label>
              <select
                className={styles.select}
                value={form.submitterRelation}
                onChange={(e) => update("submitterRelation", e.target.value)}
              >
                <option value="">{t("addBusiness.selectRelation")}</option>
                <option value="customer">{t("addBusiness.relationCustomer")}</option>
                <option value="neighbor">{t("addBusiness.relationNeighbor")}</option>
                <option value="friend">{t("addBusiness.relationFriend")}</option>
                <option value="other">{t("addBusiness.relationOther")}</option>
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
        {submitting
          ? t("addBusiness.submitting")
          : type === "provider"
            ? t("addBusiness.submitListing")
            : t("addBusiness.submitSuggestion")}
      </button>
    </form>
  );
}
