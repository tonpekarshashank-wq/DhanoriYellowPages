import Link from "next/link";
import { SearchIcon, AlertTriangleIcon, PhoneIcon } from "@/components/ui/Icons";
import styles from "./page.module.css";

/** Quick-access chips — spec S1 */
const QUICK_CHIPS = [
  { label: "Emergency", href: "/emergency", icon: "alert", accent: true },
  { label: "24/7 Pharmacy", href: "/search?q=24h+chemist", icon: "default" },
  { label: "MSEDCL", href: "/search?q=msedcl", icon: "default" },
  { label: "Water Tanker", href: "/search?q=water+tanker", icon: "default" },
  { label: "Electrician", href: "/search?q=electrician", icon: "default" },
  { label: "Plumber", href: "/search?q=plumber", icon: "default" },
];

/** Category grid */
const CATEGORIES = [
  { name: "Emergency & Utilities", slug: "emergency-utilities", emoji: "🚨" },
  { name: "Daily Essentials", slug: "daily-essentials", emoji: "🏠" },
  { name: "Home Maintenance", slug: "home-maintenance", emoji: "🔧" },
  { name: "Healthcare & Wellness", slug: "healthcare-wellness", emoji: "🏥" },
  { name: "Education & Childcare", slug: "education-childcare", emoji: "📚" },
  { name: "Shops & Local Services", slug: "shops-local-services", emoji: "🛍️" },
];

/** Rotating placeholder examples */
const PLACEHOLDERS = [
  "24h chemist",
  "plumber near me",
  "Porwal Road gym",
  "electrician Dhanori",
];

export default function HomePage() {
  // Use a static placeholder for SSR; client-side rotation added later
  const placeholder = PLACEHOLDERS[0];

  return (
    <div className={styles.page}>
      {/* Hero: logo, title, search — spec: "Search is the homepage" */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={`text-title-page font-display ${styles.title}`}>
            Find help near you
          </h1>
          <p className={`text-body ${styles.subtitle}`}>
            Verified businesses and emergency contacts in Dhanori, Pune.
          </p>

          {/* Master search pill */}
          <form action="/search" method="GET" className={styles.searchForm}>
            <div className="search-pill">
              <SearchIcon size={20} style={{ color: "var(--ink-muted)", flexShrink: 0 }} />
              <input
                type="search"
                name="q"
                placeholder={placeholder}
                autoComplete="off"
                aria-label="Search for services"
              />
            </div>
          </form>

          {/* Quick-access chips */}
          <div className={styles.chips}>
            {QUICK_CHIPS.map((chip) => (
              <Link
                key={chip.label}
                href={chip.href}
                className={`chip ${chip.accent ? "chip--active" : ""}`}
              >
                {chip.accent && <AlertTriangleIcon size={16} />}
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency strip */}
      <section className={styles.emergencyStrip} aria-label="Emergency numbers">
        <div className={`container ${styles.emergencyInner}`}>
          <span className={styles.emergencyLabel}>
            <PhoneIcon size={16} />
            Emergency
          </span>
          <div className={styles.emergencyNumbers}>
            <a href="tel:112" className={styles.emergencyNumber}>
              <strong>112</strong> Police
            </a>
            <a href="tel:101" className={styles.emergencyNumber}>
              <strong>101</strong> Fire
            </a>
            <a href="tel:108" className={styles.emergencyNumber}>
              <strong>108</strong> Ambulance
            </a>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className={styles.categories}>
        <div className="container">
          <h2 className={`text-title-section font-display ${styles.sectionTitle}`}>
            Browse by category
          </h2>
          <div className={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={styles.categoryCard}
              >
                <span className={styles.categoryEmoji} aria-hidden="true">
                  {cat.emoji}
                </span>
                <span className={styles.categoryName}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Add business CTA */}
      <section className={styles.ctaSection}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className={`text-title-section font-display ${styles.sectionTitle}`}>
            Are you a local business?
          </h2>
          <p className="text-body" style={{ color: "var(--ink-muted)", marginBottom: 16 }}>
            Get listed for free. Reach customers searching in your area.
          </p>
          <Link href="/add-business" className="btn btn--primary tap-target">
            Add your business
          </Link>
        </div>
      </section>
    </div>
  );
}
