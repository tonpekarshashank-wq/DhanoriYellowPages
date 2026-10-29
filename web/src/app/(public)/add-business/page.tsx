import type { Metadata } from "next";
import { getCategories, getSubLocalities } from "@/lib/search";
import { AddBusinessForm } from "./AddBusinessForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Add Your Business — Dhanori Yellow Pages",
  description:
    "List your business on Dhanori Yellow Pages for free. Reach local customers in Dhanori, Pune.",
};

export default async function AddBusinessPage() {
  const [categories, subLocalities] = await Promise.all([
    getCategories(),
    getSubLocalities(),
  ]);

  return (
    <div className={styles.page}>
      <h1 className="text-title-page font-display">Add Your Business</h1>
      <p className={`text-body ${styles.intro}`}>
        List your business on Dhanori Yellow Pages for free.
        After review, it will appear in search results and category pages.
      </p>
      <AddBusinessForm
        categories={categories as { slug: string; name: string }[]}
        subLocalities={subLocalities as { slug: string; name: string }[]}
        type="provider"
      />
    </div>
  );
}
