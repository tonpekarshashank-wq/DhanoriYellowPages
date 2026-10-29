import Link from "next/link";
import { GlobeIcon } from "@/components/ui/Icons";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo} aria-label="Home">
          <span className={styles.logoMark}>DYP</span>
          <span className={styles.logoText}>Dhanori Yellow Pages</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/emergency" className={styles.navLink}>
            Emergency
          </Link>
          <Link href="/add-business" className={styles.navLink}>
            Add business
          </Link>
          <button
            className={styles.langButton}
            aria-label="Change language"
            title="Language"
          >
            <GlobeIcon size={20} />
            <span className={styles.langLabel}>EN</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
