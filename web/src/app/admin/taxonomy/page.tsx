import { getFullTaxonomy } from "@/lib/admin";
import styles from "./page.module.css";

export default async function AdminTaxonomyPage() {
  const { categories, subCategories, subLocalities, synonyms } =
    await getFullTaxonomy();

  return (
    <div>
      <h1 className="text-title-page font-display">Taxonomy</h1>
      <p className="text-meta" style={{ color: "var(--ink-muted)", marginBottom: 24 }}>
        Categories, sub-categories, areas, and search synonyms.
        Edit via the database or admin API.
      </p>

      <div className={styles.grid}>
        {/* Categories */}
        <section className={styles.section}>
          <h2 className="text-title-section font-display">
            Categories ({categories.length})
          </h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Emergency</th>
                  <th>Order</th>
                </tr>
              </thead>
              <tbody>
                {(categories as Record<string, unknown>[]).map((c) => (
                  <tr key={c.id as number}>
                    <td><strong>{c.name as string}</strong></td>
                    <td className="text-meta">{c.slug as string}</td>
                    <td>{(c.isEmergency as boolean) ? "Yes" : "—"}</td>
                    <td>{c.sortOrder as number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sub-categories */}
        <section className={styles.section}>
          <h2 className="text-title-section font-display">
            Sub-categories ({subCategories.length})
          </h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Slug</th>
                </tr>
              </thead>
              <tbody>
                {(subCategories as Record<string, unknown>[]).map((sc) => (
                  <tr key={sc.id as number}>
                    <td>{sc.name as string}</td>
                    <td className="text-meta">{sc.categoryName as string}</td>
                    <td className="text-meta">{sc.slug as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sub-localities */}
        <section className={styles.section}>
          <h2 className="text-title-section font-display">
            Areas ({subLocalities.length})
          </h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Aliases</th>
                </tr>
              </thead>
              <tbody>
                {(subLocalities as Record<string, unknown>[]).map((sl) => (
                  <tr key={sl.id as number}>
                    <td><strong>{sl.name as string}</strong></td>
                    <td className="text-meta">{sl.slug as string}</td>
                    <td className="text-meta">
                      {(sl.aliases as string[] | null)?.join(", ") ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Synonyms */}
        <section className={styles.section}>
          <h2 className="text-title-section font-display">
            Search Synonyms ({synonyms.length})
          </h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Term</th>
                  <th>Synonyms</th>
                  <th>Lang</th>
                </tr>
              </thead>
              <tbody>
                {(synonyms as Record<string, unknown>[]).map((s) => (
                  <tr key={s.id as number}>
                    <td><strong>{s.term as string}</strong></td>
                    <td className="text-meta">
                      {(s.synonyms as string[]).join(", ")}
                    </td>
                    <td>{s.language as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
