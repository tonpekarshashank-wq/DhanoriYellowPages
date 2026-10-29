"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReportActions({ reportId }: { reportId: number }) {
  const [acting, setActing] = useState(false);
  const router = useRouter();

  async function handleResolve() {
    setActing(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve" }),
      });
      if (res.ok) router.refresh();
    } catch {
      // user can retry
    } finally {
      setActing(false);
    }
  }

  return (
    <button
      className="btn btn--outline"
      onClick={handleResolve}
      disabled={acting}
      style={{ marginTop: 12 }}
    >
      {acting ? "…" : "Mark resolved"}
    </button>
  );
}
