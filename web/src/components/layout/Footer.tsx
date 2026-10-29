import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.notice}>
          Basic listings are free. Paid and promoted listings are always labelled.
        </p>
        <nav className={styles.links}>
          <Link href="/about">About</Link>
          <Link href="/about#verify">How we verify</Link>
          <Link href="/add-business">Add your business</Link>
          <Link href="/get-featured">Get featured</Link>
        </nav>
        <p className={styles.copy}>
          © {new Date().getFullYear()} Dhanori Yellow Pages
        </p>
      </div>
    </footer>
  );
}
