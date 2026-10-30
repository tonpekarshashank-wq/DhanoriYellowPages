import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isValidLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/ui/CookieConsent";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value ?? "";
  const locale: Locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;

  return (
    <I18nProvider locale={locale}>
      <Header />
      <main>{children}</main>
      <Footer />
      <CookieConsent />
    </I18nProvider>
  );
}
