import type { Metadata } from "next";
import Link from "next/link";
import { searchListings, getCategories, getSubLocalities } from "@/lib/search";
import { getOpenStatus } from "@/lib/status";
import { ListingCard, type ListingCardData } from "@/components/listings/ListingCard";
import { SearchIcon, XIcon } from "@/components/ui/Icons";
import type { OpenStatus, HourEntry } from "@/lib/status";
import styles from "./page.module.css";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    area?: string;
    open?: string;
    verified?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q ?? "";
  return {
    title: query ? `${query} — Search` : "Search",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const category = params.category;
  const area = params.area;
  const openNow = params.open === "1";
  const verifiedOnly = params.verified === "1";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  // Fetch search results and filter options in parallel
  const [searchResponse, categories, subLocalities] = await Promise.all([
    searchListings({
      query,
      category,
      subLocality: area,
      openNow,
      verifiedOnly,
      page,
      limit: 20,
    }),
    getCategories(),
    getSubLocalities(),
  ]);

  const { results, total } = searchResponse;

  // Convert results to ListingCardData
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

  // Build current filter URL params for chip toggling
  function filterUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    const merged = { category, area, open: openNow ? "1" : undefined, verified: verifiedOnly ? "1" : undefined, ...overrides };
    if (merged.category) p.set("category", merged.category);
    if (merged.area) p.set("area", merged.area);
    if (merged.open) p.set("open", merged.open);
    if (merged.verified) p.set("verified", merged.verified);
    return `/search?${p.toString()}`;
  }

  const hasFilters = !!(category || area || openNow || verifiedOnly);
  const totalPages = Math.ceil(total / 20);

  return (
    <div className={styles.page}>
      {/* Sticky search header */}
      <div className={styles.searchHeader}>
        <div className="container">
          <form action="/search" method="GET" className={styles.searchForm}>
            <div className="search-pill">
              <SearchIcon
                size={20}
                style={{ color: "var(--ink-muted)", flexShrink: 0 }}
              />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search for services…"
                autoComplete="off"
                aria-label="Search for services"
              />
            </div>
          </form>

          {/* Filter chips */}
          <div className={styles.filters}>
            {/* Category chips */}
            {(categories as { slug: string; name: string }[]).map((cat) => (
              <Link
                key={cat.slug}
                href={filterUrl({
                  category: category === cat.slug ? undefined : cat.slug,
                })}
                className={`chip ${category === cat.slug ? "chip--active" : ""}`}
              >
                {cat.name}
                {category === cat.slug && <XIcon size={14} />}
              </Link>
            ))}

            <span className={styles.filterDivider} />

            {/* Sub-locality chips */}
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

            {/* Open now */}
            <Link
              href={filterUrl({ open: openNow ? undefined : "1" })}
              className={`chip ${openNow ? "chip--active" : ""}`}
            >
              Open now
              {openNow && <XIcon size={14} />}
            </Link>

            {/* Verified only */}
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
        {/* Meta line */}
        <div className={styles.meta}>
          <span className="text-meta" style={{ color: "var(--ink-muted)" }}>
            {total} result{total !== 1 ? "s" : ""}
            {query && <> for <strong style={{ color: "var(--ink)" }}>&ldquo;{query}&rdquo;</strong></>}
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
            <Link
              href={`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`}
              className={styles.clearLink}
            >
              Clear filters
            </Link>
          )}
        </div>

        {/* Cards or empty state */}
        {cards.length > 0 ? (
          <div className="feed-grid">
            {cards.map((card) => (
              <ListingCard key={card.id} listing={card} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔍</div>
            <h2 className="text-title-section font-display">
              {query
                ? `No ${query} found${area ? ` in ${(subLocalities as { slug: string; name: string }[]).find((l) => l.slug === area)?.name ?? area}` : ""}`
                : "No results match these filters"}
            </h2>
            <p
              className="text-body"
              style={{ color: "var(--ink-muted)", marginTop: 8 }}
            >
              {hasFilters
                ? "Try removing a filter to see more results."
                : "Try a different search term, or suggest a business."}
            </p>
            <div className={styles.emptyActions}>
              {hasFilters && (
                <Link
                  href={`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`}
                  className="btn btn--outline"
                >
                  Clear filters
                </Link>
              )}
              <Link href="/suggest" className="btn btn--outline">
                Recommend someone
              </Link>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Search results pages">
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
  );
}
