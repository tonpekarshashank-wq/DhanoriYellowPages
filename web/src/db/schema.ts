import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  decimal,
  pgEnum,
  serial,
  index,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";

/* ==========================================================================
   Enums
   ========================================================================== */

export const listingStatusEnum = pgEnum("listing_status", [
  "draft",
  "community_submitted",
  "verified",
  "hidden",
]);

export const verificationMethodEnum = pgEnum("verification_method", [
  "call",
  "visit",
  "document",
]);

export const paidPlanEnum = pgEnum("paid_plan", [
  "none",
  "promoted_slot",
  "ranking_boost",
  "category_feature",
]);

export const reportReasonEnum = pgEnum("report_reason", [
  "wrong_number",
  "permanently_closed",
  "incorrect_info",
  "other",
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "pending",
  "published",
  "rejected",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "approved",
  "rejected",
  "merged",
]);

export const userRoleEnum = pgEnum("user_role", ["admin", "editor"]);

/* ==========================================================================
   Categories
   ========================================================================== */

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  nameMarathi: varchar("name_mr", { length: 150 }),
  nameHindi: varchar("name_hi", { length: 150 }),
  sortOrder: integer("sort_order").notNull().default(0),
  isEmergency: boolean("is_emergency").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subCategories = pgTable(
  "sub_categories",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    nameMarathi: varchar("name_mr", { length: 150 }),
    nameHindi: varchar("name_hi", { length: 150 }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("sub_categories_category_slug_idx").on(t.categoryId, t.slug),
  ]
);

/* ==========================================================================
   Sub-localities
   ========================================================================== */

export const subLocalities = pgTable("sub_localities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  nameMarathi: varchar("name_mr", { length: 150 }),
  nameHindi: varchar("name_hi", { length: 150 }),
  aliases: text("aliases").array(),
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ==========================================================================
   Listings (core table — HSDS-mapped field names)
   ========================================================================== */

export const listings = pgTable(
  "listings",
  {
    id: serial("id").primaryKey(),

    /* Identity */
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    primaryService: varchar("primary_service", { length: 40 }).notNull(),

    /* Taxonomy */
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    subCategoryId: integer("sub_category_id").references(() => subCategories.id),

    /* Location */
    subLocalityId: integer("sub_locality_id")
      .notNull()
      .references(() => subLocalities.id),
    servesSubLocalities: integer("serves_sub_localities").array(),
    address: text("address"),
    landmark: varchar("landmark", { length: 40 }),
    lat: decimal("lat", { precision: 10, scale: 7 }),
    lng: decimal("lng", { precision: 10, scale: 7 }),

    /* Contact */
    phone: varchar("phone", { length: 15 }).notNull(),
    whatsapp: varchar("whatsapp", { length: 15 }),

    /* Detail */
    services: text("services").array(),
    description: text("description"),
    languages: varchar("languages", { length: 5 }).array().default(["en"]),
    emergencyAvailable: boolean("emergency_available").notNull().default(false),
    is24x7: boolean("is_24x7").notNull().default(false),

    /* Verification */
    status: listingStatusEnum("status").notNull().default("draft"),
    verifiedOn: timestamp("verified_on", { withTimezone: true }),
    verificationMethod: verificationMethodEnum("verification_method"),

    /* Ratings (denormalized from reviews) */
    ratingAvg: decimal("rating_avg", { precision: 2, scale: 1 }),
    ratingCount: integer("rating_count").notNull().default(0),

    /* Monetization */
    paidPlan: paidPlanEnum("paid_plan").notNull().default("none"),
    planStartDate: timestamp("plan_start_date", { withTimezone: true }),
    planEndDate: timestamp("plan_end_date", { withTimezone: true }),

    /* Source */
    source: varchar("source", { length: 20 }).notNull().default("admin_seed"),
    openReportCount: integer("open_report_count").notNull().default(0),

    /* Timestamps */
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("listings_category_idx").on(t.categoryId),
    index("listings_sub_locality_idx").on(t.subLocalityId),
    index("listings_status_idx").on(t.status),
    index("listings_paid_plan_idx").on(t.paidPlan),
  ]
);

/* ==========================================================================
   Listing hours (weekly schedule per listing)
   ========================================================================== */

export const listingHours = pgTable(
  "listing_hours",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    weekday: integer("weekday").notNull(), // 0 = Sunday, 6 = Saturday
    opens: varchar("opens", { length: 5 }).notNull(), // "HH:MM" in IST
    closes: varchar("closes", { length: 5 }).notNull(), // "HH:MM" in IST
  },
  (t) => [
    index("listing_hours_listing_idx").on(t.listingId),
    uniqueIndex("listing_hours_unique_idx").on(t.listingId, t.weekday),
  ]
);

/* ==========================================================================
   Reviews (resident ratings and comments)
   ========================================================================== */

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1–5
    comment: text("comment"),
    displayName: varchar("display_name", { length: 50 }),
    language: varchar("language", { length: 5 }).default("en"),
    status: reviewStatusEnum("status").notNull().default("pending"),
    ipHash: varchar("ip_hash", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    moderatedAt: timestamp("moderated_at", { withTimezone: true }),
    moderatedBy: integer("moderated_by").references(() => adminUsers.id),
  },
  (t) => [
    index("reviews_listing_idx").on(t.listingId),
    index("reviews_status_idx").on(t.status),
  ]
);

/* ==========================================================================
   Submissions (provider "Add your business" and resident "Suggest")
   ========================================================================== */

export const submissions = pgTable(
  "submissions",
  {
    id: serial("id").primaryKey(),
    type: varchar("type", { length: 10 }).notNull(), // "provider" or "suggest"

    /* Listing data (same fields as listings) */
    name: varchar("name", { length: 80 }).notNull(),
    primaryService: varchar("primary_service", { length: 40 }).notNull(),
    categorySlug: varchar("category_slug", { length: 100 }),
    subLocalitySlug: varchar("sub_locality_slug", { length: 100 }),
    phone: varchar("phone", { length: 15 }).notNull(),
    whatsapp: varchar("whatsapp", { length: 15 }),
    address: text("address"),
    landmark: varchar("landmark", { length: 40 }),
    services: text("services").array(),
    description: text("description"),
    hoursJson: jsonb("hours_json"), // weekly schedule as JSON

    /* Submitter (never shown publicly; deleted after verification) */
    submitterName: varchar("submitter_name", { length: 80 }),
    submitterPhone: varchar("submitter_phone", { length: 15 }),
    submitterRelation: varchar("submitter_relation", { length: 40 }),

    /* Admin workflow */
    status: submissionStatusEnum("status").notNull().default("pending"),
    mergedIntoListingId: integer("merged_into_listing_id").references(() => listings.id),
    reviewedBy: integer("reviewed_by").references(() => adminUsers.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    notes: text("notes"),

    /* Spam */
    turnstileToken: varchar("turnstile_token", { length: 2048 }),
    ipHash: varchar("ip_hash", { length: 64 }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("submissions_status_idx").on(t.status),
    index("submissions_phone_idx").on(t.phone),
  ]
);

/* ==========================================================================
   Reports ("Report an issue" on listings)
   ========================================================================== */

export const reports = pgTable(
  "reports",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    reason: reportReasonEnum("reason").notNull(),
    details: text("details"),
    ipHash: varchar("ip_hash", { length: 64 }),
    resolved: boolean("resolved").notNull().default(false),
    resolvedBy: integer("resolved_by").references(() => adminUsers.id),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("reports_listing_idx").on(t.listingId),
    index("reports_resolved_idx").on(t.resolved),
  ]
);

/* ==========================================================================
   Search synonyms (editable in admin)
   ========================================================================== */

export const synonyms = pgTable("synonyms", {
  id: serial("id").primaryKey(),
  term: varchar("term", { length: 100 }).notNull(),
  synonyms: text("synonyms").array().notNull(), // list of equivalent terms
  language: varchar("language", { length: 5 }).notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ==========================================================================
   Admin users (Google sign-in, allow-listed)
   ========================================================================== */

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 100 }),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("editor"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ==========================================================================
   Audit log
   ========================================================================== */

export const auditLog = pgTable(
  "audit_log",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => adminUsers.id),
    action: varchar("action", { length: 50 }).notNull(), // e.g. "listing.update", "review.approve"
    entityType: varchar("entity_type", { length: 30 }).notNull(), // "listing", "review", etc.
    entityId: integer("entity_id").notNull(),
    changes: jsonb("changes"), // { field: { from, to } }
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_log_entity_idx").on(t.entityType, t.entityId),
    index("audit_log_user_idx").on(t.userId),
  ]
);

/* ==========================================================================
   Query log (anonymous, for zero-result analysis)
   ========================================================================== */

export const queryLog = pgTable(
  "query_log",
  {
    id: serial("id").primaryKey(),
    query: varchar("query", { length: 200 }).notNull(),
    resultCount: integer("result_count").notNull(),
    filters: jsonb("filters"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("query_log_created_idx").on(t.createdAt)]
);
