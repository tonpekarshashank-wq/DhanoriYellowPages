import { notFound } from "next/navigation";
import { getAdminListingById } from "@/lib/admin";
import { getCategories, getSubLocalities } from "@/lib/search";
import { ListingEditor } from "./ListingEditor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminListingEditPage({ params }: PageProps) {
  const { id } = await params;
  const listingId = parseInt(id, 10);
  if (isNaN(listingId)) notFound();

  const [listing, categories, subLocalities] = await Promise.all([
    getAdminListingById(listingId),
    getCategories(),
    getSubLocalities(),
  ]);

  if (!listing) notFound();

  return (
    <div>
      <ListingEditor
        listing={listing as Record<string, unknown>}
        hours={listing.hours as { weekday: number; opens: string; closes: string }[]}
        categories={categories as { id: number; name: string; slug: string }[]}
        subLocalities={subLocalities as { id: number; name: string; slug: string }[]}
      />
    </div>
  );
}
