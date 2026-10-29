import { PhoneIcon, ChatBubbleIcon } from "@/components/ui/Icons";
import { telUrl, whatsappUrl } from "@/lib/whatsapp";
import styles from "./ActionButtons.module.css";

interface ActionButtonsProps {
  phone: string;
  whatsapp?: string | null;
  listingName?: string;
}

export function ActionButtons({ phone, whatsapp, listingName }: ActionButtonsProps) {
  const hasWhatsApp = !!whatsapp;

  return (
    <div className={styles.actions} style={{ gridTemplateColumns: hasWhatsApp ? "1fr 1fr" : "1fr" }}>
      <a
        href={telUrl(phone)}
        className="btn btn--primary tap-target"
        aria-label={`Call ${listingName ?? "this business"}`}
      >
        <PhoneIcon size={20} />
        Call
      </a>
      {hasWhatsApp && (
        <a
          href={whatsappUrl(whatsapp, listingName)}
          className="btn btn--trust tap-target"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp ${listingName ?? "this business"}`}
        >
          <ChatBubbleIcon size={20} />
          WhatsApp
        </a>
      )}
    </div>
  );
}
