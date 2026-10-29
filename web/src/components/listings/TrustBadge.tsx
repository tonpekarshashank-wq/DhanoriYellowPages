import { CheckCircleIcon } from "@/components/ui/Icons";

interface TrustBadgeProps {
  status: "verified" | "community_submitted";
}

export function TrustBadge({ status }: TrustBadgeProps) {
  if (status === "verified") {
    return (
      <span className="badge badge--trust-soft">
        <CheckCircleIcon size={14} />
        Verified
      </span>
    );
  }

  return (
    <span className="badge badge--neutral">
      Community
    </span>
  );
}
