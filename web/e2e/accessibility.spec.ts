import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  { name: "Homepage", path: "/" },
  { name: "Search", path: "/search" },
  { name: "Emergency", path: "/emergency" },
  { name: "About", path: "/about" },
  { name: "Add Business", path: "/add-business" },
  { name: "Suggest", path: "/suggest" },
  { name: "Get Featured", path: "/get-featured" },
];

for (const { name, path } of PAGES) {
  test(`${name} (${path}) has no critical accessibility violations`, async ({
    page,
  }) => {
    await page.goto(path);
    await page.waitForLoadState("domcontentloaded");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast", "link-in-text-block"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    if (critical.length > 0) {
      const summary = critical
        .map((v) => `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`)
        .join("\n");
      expect(critical, `Accessibility violations:\n${summary}`).toHaveLength(0);
    }
  });
}
