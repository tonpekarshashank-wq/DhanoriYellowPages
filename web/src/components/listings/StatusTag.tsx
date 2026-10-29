import type { OpenStatus } from "@/lib/status";
import { getStatusLabel, getStatusDetail } from "@/lib/status";

interface StatusTagProps {
  status: OpenStatus;
}

export function StatusTag({ status }: StatusTagProps) {
  const label = getStatusLabel(status);
  const detail = getStatusDetail(status);

  let className = "status-tag";
  switch (status.state) {
    case "open":
    case "open_24h":
      className += " status-tag--open";
      break;
    case "closing_soon":
      className += " status-tag--closing-soon";
      break;
    case "closed":
      className += " status-tag--closed";
      break;
  }

  return (
    <span className={className}>
      {(status.state === "open" || status.state === "open_24h") && (
        <span className="status-dot" aria-hidden="true" />
      )}
      <span>{label}</span>
      {detail && (
        <span style={{ fontWeight: 500, opacity: 0.8 }}> · {detail}</span>
      )}
    </span>
  );
}
