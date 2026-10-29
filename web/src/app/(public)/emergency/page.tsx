import type { Metadata } from "next";
import Link from "next/link";
import { getEmergencyListings } from "@/lib/search";
import { getOpenStatus } from "@/lib/status";
import { ListingCard, type ListingCardData } from "@/components/listings/ListingCard";
import { PhoneIcon, AlertTriangleIcon } from "@/components/ui/Icons";
import type { OpenStatus, HourEntry } from "@/lib/status";
import styles from "./page.module.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Emergency & Helpline Numbers",
  description:
    "Police, fire, ambulance and 24/7 emergency contacts in Dhanori, Pune. Save this page offline.",
};

const HELPLINES = [
  { label: "Police", number: "112", note: "All emergencies" },
  { label: "Fire", number: "101", note: "Pune Fire Brigade" },
  { label: "Ambulance", number: "108", note: "Free govt ambulance" },
  { label: "Women Helpline", number: "181", note: "24/7" },
  { label: "Child Helpline", number: "1098", note: "24/7" },
  { label: "MSEDCL", number: "1912", note: "Power outage" },
  { label: "PMC Water", number: "1800-233-3455", note: "Water supply" },
  { label: "Gas Leak", number: "1906", note: "Gas emergency" },
];

export default async function EmergencyPage() {
  const results = await getEmergencyListings();

  const cards: ListingCardData[] = results.map((r) => {
    const hours: HourEntry[] =
      r.weekday !== null && r.opens && r.closes
        ? [{ weekday: r.weekday, opens: r.opens, closes: r.closes }]
        : [];
    const openStatus: OpenStatus = getOpenStatus(hours, r.is24x7);

    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      primaryService: r.primaryService,
      subLocalityName: r.subLocalityName,
      status: r.status as "verified" | "community_submitted",
      openStatus,
      phone: r.phone,
      whatsapp: r.whatsapp,
      description: r.description,
      ratingAvg: r.ratingAvg,
      ratingCount: r.ratingCount,
      emergencyAvailable: r.emergencyAvailable,
      isPromoted: false,
    };
  });

  return (
    <div className={styles.page}>
      {/* Header banner */}
      <section className={styles.banner}>
        <div className="container">
          <div className={styles.bannerInner}>
            <AlertTriangleIcon size={28} />
            <div>
              <h1 className="text-title-page font-display">
                Emergency & Helpline Numbers
              </h1>
              <p className={`text-body ${styles.bannerSub}`}>
                Dhanori, Pune — save this page for offline access
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
        {/* Helpline grid */}
        <section className={styles.helplines}>
          <h2 className="text-title-section font-display" style={{ marginBottom: 16 }}>
            Government Helplines
          </h2>
          <div className={styles.helplineGrid}>
            {HELPLINES.map((h) => (
              <a
                key={h.number}
                href={`tel:${h.number}`}
                className={styles.helplineCard}
              >
                <PhoneIcon size={20} />
                <div>
                  <span className={styles.helplineNumber}>{h.number}</span>
                  <span className={styles.helplineLabel}>{h.label}</span>
                  <span className={styles.helplineNote}>{h.note}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Local emergency businesses */}
        {cards.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <h2
              className="text-title-section font-display"
              style={{ marginBottom: 16 }}
            >
              Local Emergency Services
            </h2>
            <div className="feed-grid">
              {cards.map((card) => (
                <ListingCard key={card.id} listing={card} />
              ))}
            </div>
          </section>
        )}

        <p
          className="text-meta"
          style={{ color: "var(--ink-muted)", marginTop: 32, textAlign: "center" }}
        >
          Missing an emergency contact?{" "}
          <Link href="/suggest" style={{ color: "var(--accent)" }}>
            Suggest one
          </Link>
        </p>
      </div>
    </div>
  );
}
