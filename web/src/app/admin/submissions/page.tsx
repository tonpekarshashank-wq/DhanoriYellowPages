import Link from "next/link";
import { getAdminSubmissions } from "@/lib/admin";
import { SubmissionActions } from "./SubmissionActions";
import styles from "./page.module.css";

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminSubmissionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const status = params.status;

  const { submissions, total, totalPages } = await getAdminSubmissions({
    page,
    status,
  });

  const FILTERS = [
    { label: "All", value: undefined },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  function filterUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = { status, ...overrides };
    if (merged.status) p.set("status", merged.status);
    if (overrides.page) p.set("page", overrides.page);
    return `/admin/submissions${p.toString() ? `?${p}` : ""}`;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className="text-title-page font-display">Submissions</h1>
        <span className="text-meta" style={{ color: "var(--ink-muted)" }}>
          {total} total
        </span>
      </div>

      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={filterUrl({ status: f.value, page: undefined })}
            className={`chip ${status === f.value || (!status && !f.value) ? "chip--active" : ""}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className={styles.list}>
        {(submissions as Record<string, unknown>[]).map((s) => (
          <div key={s.id as number} className={styles.card}>
            <div className={styles.cardTop}>
              <div>
                <span className={styles.type}>{s.type as string}</span>
                <strong className={styles.name}>{s.name as string}</strong>
                <span className="text-meta" style={{ color: "var(--ink-muted)" }}>
                  {s.primaryService as string} · {s.phone as string}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={`${styles.statusBadge} ${styles[`status_${s.status as string}`] ?? ""}`}>
                  {s.status as string}
                </span>
                <div className="text-meta" style={{ color: "var(--ink-muted)", marginTop: 4 }}>
                  {new Date(s.createdAt as string).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </div>
              </div>
            </div>
            {(s.submitterName as string) ? (
              <p className="text-meta" style={{ color: "var(--ink-muted)", marginTop: 4 }}>
                Submitted by: {s.submitterName as string}
                {(s.submitterRelation as string) ? ` (${s.submitterRelation as string})` : ""}
              </p>
            ) : null}
            {(s.mergedIntoListingId as number) ? (
              <p className="text-meta" style={{ marginTop: 4 }}>
                <Link href={`/admin/listings/${s.mergedIntoListingId}`} style={{ color: "var(--primary)" }}>
                  View merged listing →
                </Link>
              </p>
            ) : null}
            {s.status === "pending" && (
              <SubmissionActions submissionId={s.id as number} />
            )}
          </div>
        ))}
        {submissions.length === 0 && (
          <p className="text-body" style={{ color: "var(--ink-muted)" }}>
            No submissions found.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <nav className={styles.pagination}>
          {page > 1 && (
            <Link href={filterUrl({ page: String(page - 1) })} className="btn btn--outline">
              ← Prev
            </Link>
          )}
          <span className="text-meta" style={{ color: "var(--ink-muted)" }}>
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={filterUrl({ page: String(page + 1) })} className="btn btn--outline">
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
