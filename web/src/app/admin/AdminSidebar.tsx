"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import styles from "./layout.module.css";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Listings", href: "/admin/listings" },
  { label: "Reviews", href: "/admin/reviews" },
  { label: "Submissions", href: "/admin/submissions" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Taxonomy", href: "/admin/taxonomy" },
  { label: "Users", href: "/admin/users" },
];

interface AdminSidebarProps {
  userName: string;
  userImage?: string;
}

export function AdminSidebar({ userName, userImage }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <strong>DYP Admin</strong>
      </div>
      <nav className={styles.sidebarNav}>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`${styles.sidebarLink} ${
              pathname.startsWith(item.href) ? styles.sidebarLinkActive : ""
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className={styles.sidebarFooter}>
        <div className={styles.userInfo}>
          {userImage && (
            <img
              src={userImage}
              alt=""
              className={styles.userAvatar}
              width={28}
              height={28}
            />
          )}
          <span className={styles.userName}>{userName}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className={styles.signOutBtn}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
