import styles from "./layout.module.css";

export const metadata = {
  title: "Admin Console",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <strong>DYP Admin</strong>
        </div>
        <nav className={styles.sidebarNav}>
          <a href="/admin/dashboard" className={styles.sidebarLink}>Dashboard</a>
          <a href="/admin/listings" className={styles.sidebarLink}>Listings</a>
          <a href="/admin/submissions" className={styles.sidebarLink}>Submissions</a>
          <a href="/admin/reports" className={styles.sidebarLink}>Reports</a>
          <a href="/admin/reviews" className={styles.sidebarLink}>Reviews</a>
          <a href="/admin/taxonomy" className={styles.sidebarLink}>Taxonomy</a>
          <a href="/admin/users" className={styles.sidebarLink}>Users</a>
        </nav>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
