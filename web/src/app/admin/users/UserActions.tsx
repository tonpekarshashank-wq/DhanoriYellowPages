"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export function UserActions({
  users,
}: {
  users: Record<string, unknown>[];
}) {
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add user");
        return;
      }
      setEmail("");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(userId: number) {
    if (!confirm("Remove this admin user?")) return;
    setRemovingId(userId);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to remove user");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <>
      <form onSubmit={handleAdd} className={styles.addForm}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
        />
        <button type="submit" className="btn btn--primary" disabled={adding}>
          {adding ? "Adding…" : "Add admin"}
        </button>
      </form>

      {error && (
        <p className={styles.error}>{error}</p>
      )}

      <div className={styles.list}>
        {users.map((u) => (
          <div key={u.id as number} className={styles.card}>
            <div>
              <strong>{u.email as string}</strong>
              <div className="text-meta" style={{ color: "var(--ink-muted)", marginTop: 2 }}>
                {u.role as string} · added{" "}
                {new Date(u.createdAt as string).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
            <button
              className="btn btn--outline"
              onClick={() => handleRemove(u.id as number)}
              disabled={removingId === (u.id as number)}
              style={{ color: "var(--on-danger-soft)" }}
            >
              {removingId === (u.id as number) ? "…" : "Remove"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
