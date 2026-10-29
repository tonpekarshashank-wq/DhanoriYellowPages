import { getAdminUsers } from "@/lib/admin";
import { UserActions } from "./UserActions";
import styles from "./page.module.css";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div>
      <div className={styles.header}>
        <h1 className="text-title-page font-display">Admin Users</h1>
        <span className="text-meta" style={{ color: "var(--ink-muted)" }}>
          {users.length} user{users.length !== 1 ? "s" : ""}
        </span>
      </div>

      <UserActions users={users as Record<string, unknown>[]} />
    </div>
  );
}
