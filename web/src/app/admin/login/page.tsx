import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignInButton } from "./SignInButton";
import styles from "./page.module.css";

export const metadata = {
  title: "Admin Login",
  robots: "noindex, nofollow",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/admin/dashboard");

  const params = await searchParams;
  const error = params.error;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className="text-title-section font-display">DYP Admin</h1>
        <p className="text-body" style={{ color: "var(--ink-muted)", marginTop: 8 }}>
          Sign in with your authorized Google account.
        </p>

        {error && (
          <div className={styles.error}>
            {error === "AccessDenied"
              ? "Your email is not authorized for admin access."
              : "Sign-in failed. Please try again."}
          </div>
        )}

        <SignInButton />
      </div>
    </div>
  );
}
