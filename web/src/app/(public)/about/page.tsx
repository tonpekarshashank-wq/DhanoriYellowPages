import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About — Dhanori Yellow Pages",
  description:
    "Dhanori Yellow Pages is a free, community-driven business directory for Dhanori, Pune. Find verified local businesses, emergency contacts, and services.",
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <h1 className="text-title-page font-display">About Dhanori Yellow Pages</h1>

      <section className={styles.section}>
        <p className="text-body">
          Dhanori Yellow Pages is a free, community-driven directory of local
          businesses and services in Dhanori, Pune. Our goal is simple: make it
          easy for residents to find trusted, verified businesses in their
          neighbourhood — from plumbers and electricians to doctors and grocery
          stores.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className="text-title-section font-display">Why we built this</h2>
        <p className="text-body">
          Finding reliable local services in a growing area like Dhanori can be
          frustrating. Google Maps listings are often outdated, phone numbers
          change, and new businesses pop up faster than any map can track. We
          wanted a directory that is maintained by and for the community — where
          anyone can suggest a business, leave a review, and flag incorrect
          information.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className="text-title-section font-display">How it works</h2>
        <ul className={styles.list}>
          <li>
            <strong>Search & browse</strong> — Find businesses by name, service,
            category, or area. Filter by open now, verified, or emergency
            availability.
          </li>
          <li>
            <strong>Verified listings</strong> — Our team verifies business
            details by calling them directly. Look for the verified badge.
          </li>
          <li>
            <strong>Community reviews</strong> — Rate and review businesses
            you&apos;ve used. All reviews are moderated before publishing.
          </li>
          <li>
            <strong>Emergency contacts</strong> — Quick access to police, fire,
            ambulance, and other emergency helplines — always one tap away.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className="text-title-section font-display">Get involved</h2>
        <div className={styles.cards}>
          <Link href="/add-business" className={styles.card}>
            <strong>Add your business</strong>
            <span className="text-meta" style={{ color: "var(--ink-muted)" }}>
              Own a business in Dhanori? List it for free.
            </span>
          </Link>
          <Link href="/suggest" className={styles.card}>
            <strong>Suggest a business</strong>
            <span className="text-meta" style={{ color: "var(--ink-muted)" }}>
              Know a great local place? Tell us about it.
            </span>
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="text-title-section font-display">Coverage area</h2>
        <p className="text-body">
          We cover Dhanori and its surrounding sub-localities including
          Dhanori Gaon, Vishrantwadi, Lohegaon, Dhanori Phata, Kalas, and more.
          If your business serves the Dhanori area, it belongs here.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className="text-title-section font-display">Contact</h2>
        <p className="text-body">
          Have questions, feedback, or need help with your listing?
          Email us at{" "}
          <a href="mailto:hello@dhanoriyellowpages.in" className={styles.link}>
            hello@dhanoriyellowpages.in
          </a>
        </p>
      </section>
    </div>
  );
}
