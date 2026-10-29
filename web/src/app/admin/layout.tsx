import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "./AdminSidebar";
import styles from "./layout.module.css";

export const metadata = {
  title: "Admin Console",
  robots: "noindex, nofollow",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar
        userName={session.user.name ?? session.user.email ?? "Admin"}
        userImage={session.user.image ?? undefined}
      />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
