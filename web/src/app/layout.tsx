import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isValidLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Dhanori Yellow Pages — Trusted help, two lanes away",
    template: "%s | Dhanori Yellow Pages",
  },
  description:
    "Find verified electricians, plumbers, pharmacies and emergency contacts in Dhanori, Pune. One-tap Call and WhatsApp — no login required.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://dhanoriyellowpages.com"
  ),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B3D66",
};

const LANG_MAP: Record<Locale, string> = {
  en: "en",
  mr: "mr",
  hi: "hi",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value ?? "";
  const locale: Locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;

  return (
    <html lang={LANG_MAP[locale]}>
      <body>{children}</body>
    </html>
  );
}
