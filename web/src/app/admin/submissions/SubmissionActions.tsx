"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubmissionActions({ submissionId }: { submissionId: number }) {
  const [acting, setActing] = useState(false);
  const router = useRouter();

  async function handleAction(action: "approve" | "reject") {
    setActing(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) router.refresh();
    } catch {
      // user can retry
    } finally {
      setActing(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <button
        className="btn btn--primary"
        onClick={() => handleAction("approve")}
        disabled={acting}
      >
        {acting ? "…" : "Approve & Create Listing"}
      </button>
      <button
        className="btn btn--outline"
        onClick={() => handleAction("reject")}
        disabled={acting}
        style={{ color: "var(--on-danger-soft)" }}
      >
        Reject
      </button>
    </div>
  );
}
