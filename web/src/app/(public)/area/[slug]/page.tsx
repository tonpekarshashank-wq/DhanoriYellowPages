import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  searchListings,
  getSubLocalityBySlug,
  getCategories,
  getAllSubLocalitySlugs,
} from "@/lib/search";
import { getOpenStatus } from "@/lib/status";
import { ListingCard, type ListingCardData } from "@/components/listings/ListingCard";
import { SearchIcon, XIcon, MapPinIcon } from "@/components/ui/Icons";
import type { OpenStatus, HourEntry } from "@/lib/status";
import styles from "./page.module.css";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    category?: string;
    open?: string;
    verified?: string;
    page?: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = await getAllSubLocalitySlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const area = await getSubLocalityBySlug(slug);
  if (!area) return { title: "Not Found" };

  return {
    title: `Businesses in ${area.name}, Dhanori, Pune`,
    description: `Find verified businesses and services in ${area.name}, Dhanori, Pune.`,
  };
}

export default async function AreaPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const area = await getSubLocalityBySlug(slug);
  if (!area) notFound();

  const categoryFilter = sp.category;
  const openNow = sp.open === "1";
  const verifiedOnly = sp.verified === "1";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [searchResponse, categories] = await Promise.all([
    searchListings({
      query: "",
      category: categoryFilter,
      subLocality: slug,
      openNow,
      verifiedOnly,
      page,
      limit: 20,
    }),
    getCategories(),
  ]);

  const { results, total } = searchResponse;

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
      isPromoted:
        r.paidPlan !== "none" &&
        !r.isEmergencyCategory &&
        r.planEndDate !== null &&
        new Date(r.planEndDate) > new Date(),
    };
  });

  function filterUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = {
      category: categoryFilter,
      open: openNow ? "1" : undefined,
      verified: verifiedOnly ? "1" : undefined,
      ...overrides,
    };
    if (merged.category) p.set("category", merged.category);
    if (merged.open) p.set("open", merged.open);
    if (merged.verified) p.set("verified", merged.verified);
    const qs = p.toString();
    return `/area/${slug}${qs ? `?${qs}` : ""}`;
  }

  const hasFilters = !!(categoryFilter || openNow || verifiedOnly);
  const totalPages = Math.ceil(total / 20);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Businesses in ${area.name}, Dhanori, Pune`,
    description: `Directory of businesses and services in ${area.name}, Dhanori, Pune`,
    url: `https://dhanoriyellowpages.com/area/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.page}>
        {/* Header */}
        <section className={styles.header}>
          <div className="container">
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">›</span>
              <span>{area.name as string}</span>
            </nav>
            <h1 className="text-title-page font-display">
              <MapPinIcon size={24} style={{ verticalAlign: "text-bottom" }} />{" "}
              {area.name as string}
            </h1>
            {(area.aliases as string[] | null)?.length ? (
              <p className="text-meta" style={{ color: "var(--ink-muted)", marginTop: 4 }}>
                Also known as: {(area.aliases as string[]).join(", ")}
              </p>
            ) : null}
          </div>
        </section>

        {/* Filters */}
        <div className={styles.filterBar}>
          <div className="container">
            <div className={styles.filters}>
              {(categories as { slug: string; name: string }[]).map((cat) => (
                <Link
                  key={cat.slug}
                  href={filterUrl({
                    category: categoryFilter === cat.slug ? undefined : cat.slug,
                  })}
                  className={`chip ${categoryFilter === cat.slug ? "chip--active" : ""}`}
                >
                  {cat.name}
                  {categoryFilter === cat.slug && <XIcon size={14} />}
                </Link>
              ))}
              <span className={styles.filterDivider} />
              <Link
                href={filterUrl({ open: openNow ? undefined : "1" })}
                className={`chip ${openNow ? "chip--active" : ""}`}
              >
                Open now
                {openNow && <XIcon size={14} />}
              </Link>
              <Link
                href={filterUrl({ verified: verifiedOnly ? undefined : "1" })}
                className={`chip ${verifiedOnly ? "chip--active" : ""}`}
              >
                Verified only
                {verifiedOnly && <XIcon size={14} />}
              </Link>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="container" style={{ paddingTop: 16, paddingBottom: 32 }}>
          <div className={styles.meta}>
            <span className="text-meta" style={{ color: "var(--ink-muted)" }}>
              {total} listing{total !== 1 ? "s" : ""}
              {categoryFilter && (
                <>
                  {" "}in{" "}
                  <strong style={{ color: "var(--ink)" }}>
                    {(categories as { slug: string; name: string }[]).find(
                      (c) => c.slug === categoryFilter
                    )?.name ?? categoryFilter}
                  </strong>
                </>
              )}
            </span>
            {hasFilters && (
              <Link href={`/area/${slug}`} className={styles.clearLink}>
                Clear filters
              </Link>
            )}
          </div>

          {cards.length > 0 ? (
            <div className="feed-grid">
              {cards.map((card) => (
                <ListingCard key={card.id} listing={card} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🏘️</div>
              <h2 className="text-title-section font-display">
                No listings in {area.name as string}
              </h2>
              <p
                className="text-body"
                style={{ color: "var(--ink-muted)", marginTop: 8 }}
              >
                {hasFilters
                  ? "Try removing a filter to see more results."
                  : "Know a business here? Suggest it."}
              </p>
              <div className={styles.emptyActions}>
                {hasFilters && (
                  <Link href={`/area/${slug}`} className="btn btn--outline">
                    Clear filters
                  </Link>
                )}
                <Link href="/suggest" className="btn btn--outline">
                  Recommend someone
                </Link>
                <Link
                  href={`/search?area=${slug}`}
                  className="btn btn--outline"
                >
                  <SearchIcon size={16} /> Search in {area.name as string}
                </Link>
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Pages">
              {page > 1 && (
                <Link
                  href={filterUrl({ page: undefined })}
                  className="btn btn--outline"
                >
                  ← Previous
                </Link>
              )}
              <span className="text-meta" style={{ color: "var(--ink-muted)" }}>
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={filterUrl({ page: String(page + 1) })}
                  className="btn btn--outline"
                >
                  Next →
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
