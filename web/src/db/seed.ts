/**
 * Seed script: loads taxonomy (categories, sub-categories, sub-localities, synonyms)
 * and sample listings with fake data. Run with `npm run db:seed`.
 *
 * All phone numbers and business names are clearly fake.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import * as schema from "./schema";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("Seeding categories…");
  const categoryRows = await db
    .insert(schema.categories)
    .values([
      { name: "Emergency & Utilities", slug: "emergency-utilities", nameMarathi: "आपत्कालीन आणि सुविधा", nameHindi: "आपातकालीन और सुविधाएं", sortOrder: 1, isEmergency: true },
      { name: "Daily Essentials", slug: "daily-essentials", nameMarathi: "दैनंदिन गरजा", nameHindi: "दैनिक आवश्यकताएं", sortOrder: 2 },
      { name: "Home Maintenance", slug: "home-maintenance", nameMarathi: "घर दुरुस्ती", nameHindi: "घर की मरम्मत", sortOrder: 3 },
      { name: "Healthcare & Wellness", slug: "healthcare-wellness", nameMarathi: "आरोग्य आणि निरोगीपण", nameHindi: "स्वास्थ्य और कल्याण", sortOrder: 4 },
      { name: "Education & Childcare", slug: "education-childcare", nameMarathi: "शिक्षण आणि बालसंगोपन", nameHindi: "शिक्षा और बाल देखभाल", sortOrder: 5 },
      { name: "Shops & Local Services", slug: "shops-local-services", nameMarathi: "दुकाने आणि स्थानिक सेवा", nameHindi: "दुकानें और स्थानीय सेवाएं", sortOrder: 6 },
    ])
    .returning();

  const catMap = Object.fromEntries(categoryRows.map((c) => [c.slug, c.id]));

  console.log("Seeding sub-categories…");
  await db.insert(schema.subCategories).values([
    // Emergency & Utilities
    { categoryId: catMap["emergency-utilities"], name: "Police", slug: "police", sortOrder: 1 },
    { categoryId: catMap["emergency-utilities"], name: "Fire Station", slug: "fire-station", sortOrder: 2 },
    { categoryId: catMap["emergency-utilities"], name: "Ambulance", slug: "ambulance", sortOrder: 3 },
    { categoryId: catMap["emergency-utilities"], name: "MSEDCL", slug: "msedcl", sortOrder: 4 },
    { categoryId: catMap["emergency-utilities"], name: "PMC Water Supply", slug: "pmc-water", sortOrder: 5 },
    { categoryId: catMap["emergency-utilities"], name: "Water Tanker", slug: "water-tanker", sortOrder: 6 },
    // Daily Essentials
    { categoryId: catMap["daily-essentials"], name: "Maid & Cook", slug: "maid-cook", sortOrder: 1 },
    { categoryId: catMap["daily-essentials"], name: "Milk & Newspaper", slug: "milk-newspaper", sortOrder: 2 },
    { categoryId: catMap["daily-essentials"], name: "Grocery Delivery", slug: "grocery-delivery", sortOrder: 3 },
    { categoryId: catMap["daily-essentials"], name: "Scrap Dealer", slug: "scrap-dealer", sortOrder: 4 },
    // Home Maintenance
    { categoryId: catMap["home-maintenance"], name: "Plumber", slug: "plumber", sortOrder: 1 },
    { categoryId: catMap["home-maintenance"], name: "Electrician", slug: "electrician", sortOrder: 2 },
    { categoryId: catMap["home-maintenance"], name: "Carpenter", slug: "carpenter", sortOrder: 3 },
    { categoryId: catMap["home-maintenance"], name: "Painter", slug: "painter", sortOrder: 4 },
    { categoryId: catMap["home-maintenance"], name: "AC Repair", slug: "ac-repair", sortOrder: 5 },
    { categoryId: catMap["home-maintenance"], name: "Pest Control", slug: "pest-control", sortOrder: 6 },
    { categoryId: catMap["home-maintenance"], name: "RO Service", slug: "ro-service", sortOrder: 7 },
    // Healthcare
    { categoryId: catMap["healthcare-wellness"], name: "Clinic", slug: "clinic", sortOrder: 1 },
    { categoryId: catMap["healthcare-wellness"], name: "24/7 Pharmacy", slug: "pharmacy-24h", sortOrder: 2 },
    { categoryId: catMap["healthcare-wellness"], name: "Diagnostic Lab", slug: "diagnostic-lab", sortOrder: 3 },
    { categoryId: catMap["healthcare-wellness"], name: "Hospital", slug: "hospital", sortOrder: 4 },
    { categoryId: catMap["healthcare-wellness"], name: "Dentist", slug: "dentist", sortOrder: 5 },
    { categoryId: catMap["healthcare-wellness"], name: "Gym", slug: "gym", sortOrder: 6 },
    // Education
    { categoryId: catMap["education-childcare"], name: "Daycare", slug: "daycare", sortOrder: 1 },
    { categoryId: catMap["education-childcare"], name: "Preschool", slug: "preschool", sortOrder: 2 },
    { categoryId: catMap["education-childcare"], name: "Coaching Classes", slug: "coaching", sortOrder: 3 },
    { categoryId: catMap["education-childcare"], name: "Hobby Classes", slug: "hobby-classes", sortOrder: 4 },
    // Shops & Local Services
    { categoryId: catMap["shops-local-services"], name: "Mobile Repair", slug: "mobile-repair", sortOrder: 1 },
    { categoryId: catMap["shops-local-services"], name: "Laundry & Dry Cleaning", slug: "laundry", sortOrder: 2 },
    { categoryId: catMap["shops-local-services"], name: "Restaurant & Tiffin", slug: "restaurant-tiffin", sortOrder: 3 },
    { categoryId: catMap["shops-local-services"], name: "Hardware Store", slug: "hardware", sortOrder: 4 },
    { categoryId: catMap["shops-local-services"], name: "Tailor", slug: "tailor", sortOrder: 5 },
  ]);

  console.log("Seeding sub-localities…");
  const localityRows = await db
    .insert(schema.subLocalities)
    .values([
      { name: "Porwal Road", slug: "porwal-road", nameMarathi: "पोरवाल रोड", nameHindi: "पोरवाल रोड", aliases: ["Porwal Rd"], sortOrder: 1 },
      { name: "Dhanori Jakat Naka", slug: "jakat-naka", nameMarathi: "धनोरी जकात नाका", nameHindi: "धनोरी जकात नाका", aliases: ["Jakat Naka", "Dhanori Naka"], sortOrder: 2, notes: "Transit and retail hub" },
      { name: "Dhanori DP Road", slug: "dp-road", nameMarathi: "धनोरी डीपी रोड", nameHindi: "धनोरी डीपी रोड", aliases: ["DP Road", "Dhanori-Lohegaon DP Road"], sortOrder: 3 },
      { name: "Gokul Nagar", slug: "gokul-nagar", nameMarathi: "गोकुळ नगर", nameHindi: "गोकुल नगर", aliases: ["Gokulnagar"], sortOrder: 4, notes: "Narrow lanes; walk-in trades" },
      { name: "Tingre Nagar", slug: "tingre-nagar", nameMarathi: "टिंगरे नगर", nameHindi: "टिंगरे नगर", aliases: ["Tingrenagar"], sortOrder: 5, notes: "Border area" },
      { name: "Lohegaon", slug: "lohegaon", nameMarathi: "लोहगाव", nameHindi: "लोहेगांव", aliases: ["Airport Road side"], sortOrder: 6, notes: "Near airport perimeter" },
      { name: "Vishrantwadi", slug: "vishrantwadi", nameMarathi: "विश्रांतवाडी", nameHindi: "विश्रांतवाड़ी", aliases: ["Vishrantwadi Chowk", "Alandi Road"], sortOrder: 7, notes: "Police, fire and MSEDCL offices" },
      { name: "Dhanori Gaon", slug: "dhanori-gaon", nameMarathi: "धनोरी गाव", nameHindi: "धनोरी गांव", aliases: ["Dhanori village", "Dhanori"], sortOrder: 8, notes: "Default bucket" },
    ])
    .returning();

  const locMap = Object.fromEntries(localityRows.map((l) => [l.slug, l.id]));

  console.log("Seeding synonyms…");
  await db.insert(schema.synonyms).values([
    { term: "chemist", synonyms: ["pharmacy", "medical", "औषध", "dawai", "medicine"], language: "en" },
    { term: "plumber", synonyms: ["nal wala", "प्लंबर", "pipe repair", "plumbing"], language: "en" },
    { term: "electrician", synonyms: ["bijli wala", "इलेक्ट्रिशियन", "wiring", "MCB"], language: "en" },
    { term: "maid", synonyms: ["bai", "domestic help", "cleaner", "मोलकरीण"], language: "en" },
    { term: "tutor", synonyms: ["coaching", "tuition", "teacher", "शिक्षक"], language: "en" },
    { term: "gym", synonyms: ["fitness", "workout", "व्यायामशाळा"], language: "en" },
    { term: "tiffin", synonyms: ["dabba", "lunch box", "meal delivery", "डबा"], language: "en" },
    { term: "water tanker", synonyms: ["tanker", "पाणी टँकर", "pani tanker"], language: "en" },
  ]);

  console.log("Seeding sample listings (fake data)…");
  const sampleListings = await db
    .insert(schema.listings)
    .values([
      // Emergency (no paid plans ever)
      {
        name: "Vishrantwadi Police Station",
        slug: "vishrantwadi-police-station",
        primaryService: "Police",
        categoryId: catMap["emergency-utilities"],
        subLocalityId: locMap["vishrantwadi"],
        phone: "+910000000112",
        is24x7: true,
        status: "verified" as const,
        verifiedOn: new Date("2026-10-01"),
        verificationMethod: "visit" as const,
        emergencyAvailable: true,
        source: "admin_seed",
      },
      {
        name: "Dhanori Fire Station",
        slug: "dhanori-fire-station",
        primaryService: "Fire Station",
        categoryId: catMap["emergency-utilities"],
        subLocalityId: locMap["dhanori-gaon"],
        phone: "+910000000101",
        is24x7: true,
        status: "verified" as const,
        verifiedOn: new Date("2026-10-01"),
        verificationMethod: "visit" as const,
        emergencyAvailable: true,
        source: "admin_seed",
      },
      // Home Maintenance
      {
        name: "Sample Krupa Electricals",
        slug: "sample-krupa-electricals-porwal",
        primaryService: "Electrician",
        categoryId: catMap["home-maintenance"],
        subLocalityId: locMap["porwal-road"],
        servesSubLocalities: [locMap["jakat-naka"], locMap["gokul-nagar"]],
        phone: "+910000000001",
        whatsapp: "+910000000001",
        description: "Wiring, inverter installation and MCB repairs. Same-day visits across Porwal Road and Gokul Nagar.",
        services: ["Wiring", "Inverter Installation", "MCB Repair"],
        status: "verified" as const,
        verifiedOn: new Date("2026-09-15"),
        verificationMethod: "call" as const,
        ratingAvg: "4.8",
        ratingCount: 126,
        source: "admin_seed",
      },
      {
        name: "Sample Apex Plumbing Works",
        slug: "sample-apex-plumbing-porwal",
        primaryService: "Plumber",
        categoryId: catMap["home-maintenance"],
        subLocalityId: locMap["porwal-road"],
        phone: "+910000000002",
        whatsapp: "+910000000002",
        description: "Pipe fitting, leaks and bathroom renovation. Emergency visits available.",
        services: ["Pipe Fitting", "Leak Repair", "Bathroom Renovation"],
        status: "verified" as const,
        verifiedOn: new Date("2026-09-20"),
        verificationMethod: "call" as const,
        ratingAvg: "4.5",
        ratingCount: 89,
        emergencyAvailable: true,
        source: "admin_seed",
      },
      // Healthcare
      {
        name: "Sample 24/7 Pharmacy",
        slug: "sample-24h-pharmacy-jakat-naka",
        primaryService: "24/7 Pharmacy",
        categoryId: catMap["healthcare-wellness"],
        subLocalityId: locMap["jakat-naka"],
        phone: "+910000000003",
        whatsapp: "+910000000003",
        description: "Round-the-clock medicines and OTC drugs.",
        is24x7: true,
        status: "verified" as const,
        verifiedOn: new Date("2026-10-01"),
        verificationMethod: "visit" as const,
        ratingAvg: "4.2",
        ratingCount: 53,
        source: "admin_seed",
      },
      // Daily Essentials
      {
        name: "Sample Maid Agency",
        slug: "sample-maid-agency-dp-road",
        primaryService: "Maid & Cook",
        categoryId: catMap["daily-essentials"],
        subLocalityId: locMap["dp-road"],
        servesSubLocalities: [locMap["porwal-road"], locMap["gokul-nagar"]],
        phone: "+910000000004",
        whatsapp: "+910000000004",
        description: "Reliable domestic help — cleaning, cooking and childcare.",
        services: ["House Cleaning", "Cooking", "Childcare"],
        status: "verified" as const,
        verifiedOn: new Date("2026-09-10"),
        verificationMethod: "call" as const,
        ratingAvg: "4.6",
        ratingCount: 42,
        source: "admin_seed",
      },
      // Education
      {
        name: "Sample Preschool DP Road",
        slug: "sample-preschool-dp-road",
        primaryService: "Preschool",
        categoryId: catMap["education-childcare"],
        subLocalityId: locMap["dp-road"],
        phone: "+910000000005",
        description: "Play-based preschool for ages 2–5.",
        status: "community_submitted" as const,
        source: "admin_seed",
      },
      // Shops — promoted example
      {
        name: "Sample Quick Laundry",
        slug: "sample-quick-laundry-porwal",
        primaryService: "Laundry & Dry Cleaning",
        categoryId: catMap["shops-local-services"],
        subLocalityId: locMap["porwal-road"],
        phone: "+910000000006",
        whatsapp: "+910000000006",
        description: "Same-day wash, fold and dry cleaning.",
        services: ["Wash & Fold", "Dry Cleaning", "Ironing"],
        status: "verified" as const,
        verifiedOn: new Date("2026-10-05"),
        verificationMethod: "call" as const,
        ratingAvg: "4.3",
        ratingCount: 31,
        paidPlan: "promoted_slot" as const,
        planStartDate: new Date("2026-10-01"),
        planEndDate: new Date("2027-01-01"),
        source: "admin_seed",
      },
    ])
    .returning();

  console.log(`Seeded ${sampleListings.length} listings.`);

  // Sample hours for the electrician (Mon–Sat 9am–9pm)
  const electricianId = sampleListings.find((l) =>
    l.slug.includes("electricals")
  )!.id;

  await db.insert(schema.listingHours).values(
    [1, 2, 3, 4, 5, 6].map((day) => ({
      listingId: electricianId,
      weekday: day,
      opens: "09:00",
      closes: "21:00",
    }))
  );

  // Sample hours for the pharmacy (24/7 — all days)
  const pharmacyId = sampleListings.find((l) =>
    l.slug.includes("pharmacy")
  )!.id;

  await db.insert(schema.listingHours).values(
    [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      listingId: pharmacyId,
      weekday: day,
      opens: "00:00",
      closes: "23:59",
    }))
  );

  // Sample hours for the plumber (Mon–Sat 8am–8pm)
  const plumberId = sampleListings.find((l) =>
    l.slug.includes("plumbing")
  )!.id;

  await db.insert(schema.listingHours).values(
    [1, 2, 3, 4, 5, 6].map((day) => ({
      listingId: plumberId,
      weekday: day,
      opens: "08:00",
      closes: "20:00",
    }))
  );

  // Seed admin user
  console.log("Seeding admin user…");
  await db.insert(schema.adminUsers).values({
    email: "tonpekar.shashank@gmail.com",
    name: "Shashank",
    role: "admin",
  });

  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
