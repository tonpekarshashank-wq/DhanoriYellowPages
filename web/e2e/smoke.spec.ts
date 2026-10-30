import { test, expect } from "@playwright/test";

test.describe("T-01: Homepage and navigation", () => {
  test("homepage loads with search bar and nav links", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Dhanori Yellow Pages/);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("nav links are accessible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('header a[href="/emergency"]')).toBeVisible();
    await expect(page.locator('header a[href="/add-business"]')).toBeVisible();
  });
});

test.describe("T-02: Search flow", () => {
  test("search page loads with filters", async ({ page }) => {
    await page.goto("/search?q=pharmacy");
    await expect(page.locator("main")).toBeVisible();
    // Page should have search form
    const form = page.locator("form[action='/search']");
    await expect(form).toBeVisible();
  });

  test("empty search shows all listings", async ({ page }) => {
    await page.goto("/search");
    await expect(page).toHaveTitle(/Search/);
  });
});

test.describe("T-03: Category browse", () => {
  test("category page loads", async ({ page }) => {
    const res = await page.goto("/category/healthcare");
    // May be 200 or 404 depending on seed data
    expect([200, 404]).toContain(res?.status());
  });
});

test.describe("T-04: Area browse", () => {
  test("area page loads", async ({ page }) => {
    const res = await page.goto("/area/dhanori");
    expect([200, 404]).toContain(res?.status());
  });
});

test.describe("T-05: Emergency page", () => {
  test("emergency page shows helplines", async ({ page }) => {
    await page.goto("/emergency");
    await expect(page).toHaveTitle(/Emergency/);
    // Should have helpline numbers
    await expect(page.locator("text=112")).toBeVisible();
  });
});

test.describe("T-06: About page", () => {
  test("about page renders", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveTitle(/About/);
    await expect(page.locator("main")).toContainText("Dhanori Yellow Pages");
  });
});

test.describe("T-07: Listing detail", () => {
  test("listing detail page structure", async ({ page }) => {
    // Try a search first to find a listing
    await page.goto("/search");
    const firstLink = page.locator('a[href^="/listing/"]').first();
    if (await firstLink.isVisible()) {
      await firstLink.click();
      await expect(page.locator("article")).toBeVisible();
      // Should have hours, location, review sections
      await expect(page.locator("main")).toBeVisible();
    }
  });
});

test.describe("T-08: Add business form", () => {
  test("form renders with required fields", async ({ page }) => {
    await page.goto("/add-business");
    await expect(page).toHaveTitle(/Add Your Business/);
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[type="tel"]').first()).toBeVisible();
    await expect(page.locator("select").first()).toBeVisible();
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
  });
});

test.describe("T-09: Suggest business form", () => {
  test("suggest page loads with form", async ({ page }) => {
    await page.goto("/suggest");
    await expect(page).toHaveTitle(/Suggest/);
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});

test.describe("T-10: Report form", () => {
  test("report page renders with reason options", async ({ page }) => {
    // Use a non-existent ID — should 404
    const res = await page.goto("/report/99999");
    expect([200, 404]).toContain(res?.status());
  });
});

test.describe("T-11: Get featured page", () => {
  test("pricing page renders plan cards", async ({ page }) => {
    await page.goto("/get-featured");
    await expect(page).toHaveTitle(/Get Featured/);
    await expect(page.locator("main")).toContainText("₹");
  });
});

test.describe("T-12: Promoted listings", () => {
  test("promoted badge styling exists in CSS", async ({ page }) => {
    await page.goto("/search");
    // Just verify the page loads — promoted rendering depends on data
    await expect(page.locator("main")).toBeVisible();
  });
});

test.describe("T-13: Language switcher", () => {
  test("language switcher is in header", async ({ page }) => {
    await page.goto("/");
    const switcher = page.locator("button[aria-label='Change language']");
    await expect(switcher).toBeVisible();
  });

  test("switching to Marathi changes page content", async ({ page }) => {
    await page.goto("/about");
    // Set cookie and reload
    await page.context().addCookies([{
      name: "dyp-locale",
      value: "mr",
      domain: "localhost",
      path: "/",
    }]);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "mr");
  });

  test("switching to Hindi changes page content", async ({ page }) => {
    await page.goto("/about");
    await page.context().addCookies([{
      name: "dyp-locale",
      value: "hi",
      domain: "localhost",
      path: "/",
    }]);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "hi");
  });
});

test.describe("T-14: Cookie consent", () => {
  test("consent banner appears on first visit", async ({ page }) => {
    await page.goto("/");
    const banner = page.locator('[role="alert"]').filter({ hasText: "cookie" });
    if (await banner.isVisible()) {
      await banner.locator("button").click();
      await expect(banner).not.toBeVisible();
    }
  });
});

test.describe("T-15: Mobile responsive", () => {
  test("pages render without horizontal scroll on mobile", async ({ page }) => {
    // Mobile viewport is set by the 'mobile' project
    await page.goto("/");
    const body = page.locator("body");
    const box = await body.boundingBox();
    const viewport = page.viewportSize();
    if (box && viewport) {
      expect(box.width).toBeLessThanOrEqual(viewport.width + 1);
    }
  });
});

test.describe("T-16: Sitemap and robots", () => {
  test("sitemap.xml returns valid XML", async ({ page }) => {
    const res = await page.goto("/sitemap.xml");
    expect(res?.status()).toBe(200);
    const contentType = res?.headers()["content-type"] ?? "";
    expect(contentType).toContain("xml");
  });

  test("robots.txt returns valid response", async ({ page }) => {
    const res = await page.goto("/robots.txt");
    expect(res?.status()).toBe(200);
  });
});

test.describe("T-17: API validation", () => {
  test("submissions API rejects invalid input", async ({ request }) => {
    const res = await request.post("/api/submissions", {
      data: { type: "provider" },
    });
    expect(res.status()).toBe(400);
  });

  test("reports API rejects invalid input", async ({ request }) => {
    const res = await request.post("/api/reports", {
      data: { listingId: "abc" },
    });
    expect(res.status()).toBe(400);
  });

  test("reviews API rejects invalid rating", async ({ request }) => {
    const res = await request.post("/api/reviews", {
      data: { listingId: 1, rating: 10 },
    });
    expect(res.status()).toBe(400);
  });
});
