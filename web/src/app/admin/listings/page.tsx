import Link from "next/link";
import { getAdminListings } from "@/lib/admin";
import styles from "./page.module.css";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    q?: string;
  }>;
}

export default async function AdminListingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const status = params.status;
  const search = params.q;

  const { listings, total, totalPages } = await getAdminListings({
    page,
    status,
    search,
  });

  function filterUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = { status, q: search, ...overrides };
    if (merged.status) p.set("status", merged.status);
    if (merged.q) p.set("q", merged.q);
    if (overrides.page) p.set("page", overrides.page);
    const qs = p.toString();
    return `/admin/listings${qs ? `?${qs}` : ""}`;
  }

  const STATUS_FILTERS = [
    { label: "All", value: undefined },
    { label: "Verified", value: "verified" },
    { label: "Community", value: "community_submitted" },
    { label: "Draft", value: "draft" },
    { label: "Hidden", value: "hidden" },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1 className="text-title-page font-display">Listings</h1>
        <span className="text-meta" style={{ color: "var(--ink-muted)" }}>
          {total} total
        </span>
      </div>

      {/* Search and filters */}
      <div className={styles.toolbar}>
        <form action="/admin/listings" method="GET" className={styles.searchForm}>
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Search by name or phone…"
            className="input"
            style={{ maxWidth: 300 }}
          />
        </form>
        <div className={styles.filterChips}>
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.label}
              href={filterUrl({ status: f.value, page: undefined })}
              className={`chip ${status === f.value || (!status && !f.value) ? "chip--active" : ""}`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Area</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Reports</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(listings as Record<string, unknown>[]).map((l) => (
              <tr key={l.id as number}>
                <td>
                  <div className={styles.listingName}>{l.name as string}</div>
                  <div className={styles.listingService}>
                    {l.primaryService as string}
                  </div>
                </td>
                <td>{l.categoryName as string}</td>
                <td>{l.subLocalityName as string}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      styles[`status_${l.status as string}`] ?? ""
                    }`}
                  >
                    {(l.status as string).replace("_", " ")}
                  </span>
                </td>
                <td>
                  {l.ratingAvg
                    ? `${l.ratingAvg} (${l.ratingCount})`
                    : "—"}
                </td>
                <td>
                  {(l.openReportCount as number) > 0 ? (
                    <span style={{ color: "var(--on-danger-soft)", fontWeight: 600 }}>
                      {l.openReportCount as number}
                    </span>
                  ) : (
                    "0"
                  )}
                </td>
                <td className={styles.dateCell}>
                  {new Date(l.updatedAt as string).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </td>
                <td>
                  <Link
                    href={`/admin/listings/${l.id}`}
                    className={styles.editLink}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {listings.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 32 }}>
                  No listings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className={styles.pagination}>
          {page > 1 && (
            <Link
              href={filterUrl({ page: String(page - 1) })}
              className="btn btn--outline"
            >
              ← Prev
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
  );
}
