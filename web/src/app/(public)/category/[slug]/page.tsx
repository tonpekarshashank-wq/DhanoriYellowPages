import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  searchListings,
  getCategoryBySlug,
  getSubLocalities,
  getSubCategoriesByCategoryId,
  getAllCategorySlugs,
} from "@/lib/search";
import { getOpenStatus } from "@/lib/status";
import { ListingCard, type ListingCardData } from "@/components/listings/ListingCard";
import { SearchIcon, XIcon } from "@/components/ui/Icons";
import type { OpenStatus, HourEntry } from "@/lib/status";
import styles from "./page.module.css";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    area?: string;
    open?: string;
    verified?: string;
    page?: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Not Found" };

  return {
    title: `${category.name} in Dhanori, Pune`,
    description: `Find verified ${(category.name as string).toLowerCase()} businesses and services in Dhanori, Pune.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const area = sp.area;
  const openNow = sp.open === "1";
  const verifiedOnly = sp.verified === "1";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [searchResponse, subLocalities, subCategories] = await Promise.all([
    searchListings({
      query: "",
      category: slug,
      subLocality: area,
      openNow,
      verifiedOnly,
      page,
      limit: 20,
    }),
    getSubLocalities(),
    getSubCategoriesByCategoryId(category.id as number),
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
      area,
      open: openNow ? "1" : undefined,
      verified: verifiedOnly ? "1" : undefined,
      ...overrides,
    };
    if (merged.area) p.set("area", merged.area);
    if (merged.open) p.set("open", merged.open);
    if (merged.verified) p.set("verified", merged.verified);
    const qs = p.toString();
    return `/category/${slug}${qs ? `?${qs}` : ""}`;
  }

  const hasFilters = !!(area || openNow || verifiedOnly);
  const totalPages = Math.ceil(total / 20);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} in Dhanori, Pune`,
    description: `Directory of ${(category.name as string).toLowerCase()} businesses in Dhanori, Pune`,
    url: `https://dhanoriyellowpages.com/category/${slug}`,
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
              <span>{category.name as string}</span>
            </nav>
            <h1 className="text-title-page font-display">
              {category.name as string}
            </h1>
            {(subCategories as { slug: string; name: string }[]).length > 0 && (
              <div className={styles.subCats}>
                {(subCategories as { slug: string; name: string }[]).map((sc) => (
                  <Link
                    key={sc.slug}
                    href={`/search?q=${encodeURIComponent(sc.name)}&category=${slug}`}
                    className="chip"
                  >
                    {sc.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Filters */}
        <div className={styles.filterBar}>
          <div className="container">
            <div className={styles.filters}>
              {(subLocalities as { slug: string; name: string }[]).map((loc) => (
                <Link
                  key={loc.slug}
                  href={filterUrl({
                    area: area === loc.slug ? undefined : loc.slug,
                  })}
                  className={`chip ${area === loc.slug ? "chip--active" : ""}`}
                >
                  {loc.name}
                  {area === loc.slug && <XIcon size={14} />}
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
              {area && (
                <>
                  {" "}in{" "}
                  <strong style={{ color: "var(--ink)" }}>
                    {(subLocalities as { slug: string; name: string }[]).find(
                      (l) => l.slug === area
                    )?.name ?? area}
                  </strong>
                </>
              )}
            </span>
            {hasFilters && (
              <Link href={`/category/${slug}`} className={styles.clearLink}>
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
              <div className={styles.emptyIcon}>📂</div>
              <h2 className="text-title-section font-display">
                No listings yet
              </h2>
              <p
                className="text-body"
                style={{ color: "var(--ink-muted)", marginTop: 8 }}
              >
                {hasFilters
                  ? "Try removing a filter to see more results."
                  : "Know a business in this category? Suggest it."}
              </p>
              <div className={styles.emptyActions}>
                {hasFilters && (
                  <Link href={`/category/${slug}`} className="btn btn--outline">
                    Clear filters
                  </Link>
                )}
                <Link href="/suggest" className="btn btn--outline">
                  Recommend someone
                </Link>
                <Link
                  href={`/search?category=${slug}`}
                  className="btn btn--outline"
                >
                  <SearchIcon size={16} /> Search in this category
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
