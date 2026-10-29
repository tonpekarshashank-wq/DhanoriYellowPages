import type { Metadata } from "next";
import { getCategories, getSubLocalities } from "@/lib/search";
import { AddBusinessForm } from "../add-business/AddBusinessForm";
import styles from "../add-business/page.module.css";

export const metadata: Metadata = {
  title: "Suggest a Business — Dhanori Yellow Pages",
  description:
    "Know a business in Dhanori that should be listed? Suggest it here.",
};

export default async function SuggestBusinessPage() {
  const [categories, subLocalities] = await Promise.all([
    getCategories(),
    getSubLocalities(),
  ]);

  return (
    <div className={styles.page}>
      <h1 className="text-title-page font-display">Suggest a Business</h1>
      <p className={`text-body ${styles.intro}`}>
        Know a local business in Dhanori that should be listed?
        Fill in the details below and our team will review it.
      </p>
      <AddBusinessForm
        categories={categories as { slug: string; name: string }[]}
        subLocalities={subLocalities as { slug: string; name: string }[]}
        type="suggestion"
      />
    </div>
  );
}
