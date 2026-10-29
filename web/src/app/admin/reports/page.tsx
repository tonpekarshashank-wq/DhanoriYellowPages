import Link from "next/link";
import { getAdminReports } from "@/lib/admin";
import { ReportActions } from "./ReportActions";
import styles from "./page.module.css";

interface PageProps {
  searchParams: Promise<{ page?: string; resolved?: string }>;
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const showResolved = params.resolved === "1";

  const { reports, total, totalPages } = await getAdminReports({
    page,
    resolved: showResolved ? undefined : false,
  });

  return (
    <div>
      <div className={styles.header}>
        <h1 className="text-title-page font-display">Reports</h1>
        <span className="text-meta" style={{ color: "var(--ink-muted)" }}>
          {total} {showResolved ? "total" : "open"}
        </span>
      </div>

      <div className={styles.filters}>
        <Link
          href="/admin/reports"
          className={`chip ${!showResolved ? "chip--active" : ""}`}
        >
          Open
        </Link>
        <Link
          href="/admin/reports?resolved=1"
          className={`chip ${showResolved ? "chip--active" : ""}`}
        >
          All
        </Link>
      </div>

      <div className={styles.list}>
        {(reports as Record<string, unknown>[]).map((r) => (
          <div key={r.id as number} className={styles.card}>
            <div className={styles.cardTop}>
              <div>
                <Link
                  href={`/admin/listings/${r.listingId}`}
                  className={styles.listingLink}
                >
                  {r.listingName as string}
                </Link>
                <div className={styles.reason}>
                  {(r.reason as string).replace(/_/g, " ")}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  className={styles.statusDot}
                  style={{
                    background: (r.resolved as boolean)
                      ? "var(--trust)"
                      : "var(--on-danger-soft)",
                  }}
                />
                <span className="text-meta" style={{ color: "var(--ink-muted)" }}>
                  {(r.resolved as boolean) ? "Resolved" : "Open"}
                </span>
                <div className="text-meta" style={{ color: "var(--ink-muted)", marginTop: 4 }}>
                  {new Date(r.createdAt as string).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short",
                  })}
                </div>
              </div>
            </div>
            {(r.details as string) && (
              <p className="text-body" style={{ marginTop: 8, color: "var(--ink-muted)" }}>
                {r.details as string}
              </p>
            )}
            {!(r.resolved as boolean) && (
              <ReportActions reportId={r.id as number} />
            )}
          </div>
        ))}
        {reports.length === 0 && (
          <p className="text-body" style={{ color: "var(--ink-muted)" }}>
            No {showResolved ? "" : "open "}reports.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <nav className={styles.pagination}>
          {page > 1 && (
            <Link
              href={`/admin/reports?page=${page - 1}${showResolved ? "&resolved=1" : ""}`}
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
              href={`/admin/reports?page=${page + 1}${showResolved ? "&resolved=1" : ""}`}
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
