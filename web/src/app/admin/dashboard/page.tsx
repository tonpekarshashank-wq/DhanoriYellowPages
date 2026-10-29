import Link from "next/link";
import { getDashboardStats } from "@/lib/admin";
import styles from "./page.module.css";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const cards = [
    {
      title: "Total Listings",
      value: stats.listings.total,
      detail: `${stats.listings.verified} verified · ${stats.listings.community} community · ${stats.listings.draft} draft`,
      href: "/admin/listings",
      color: "var(--primary)",
    },
    {
      title: "Pending Reviews",
      value: stats.reviews.pending,
      detail: `${stats.reviews.published} published of ${stats.reviews.total} total`,
      href: "/admin/reviews",
      color: "var(--rating-star)",
    },
    {
      title: "Pending Submissions",
      value: stats.submissions.pending,
      detail: `${stats.submissions.total} total`,
      href: "/admin/submissions",
      color: "var(--trust)",
    },
    {
      title: "Open Reports",
      value: stats.reports.open,
      detail: `${stats.reports.total} total`,
      href: "/admin/reports",
      color: "var(--on-danger-soft)",
    },
  ];

  return (
    <div>
      <h1 className="text-title-page font-display">Dashboard</h1>

      <div className={styles.statsGrid}>
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className={styles.statCard}>
            <span className={styles.statValue} style={{ color: card.color }}>
              {card.value}
            </span>
            <span className={styles.statTitle}>{card.title}</span>
            <span className={styles.statDetail}>{card.detail}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
