import type { Metadata, Viewport } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
