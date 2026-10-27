/**
 * Smoke test against a running dev server.
 *   pnpm dev
 *   pnpm test:smoke
 */
import { chromium } from "playwright-core";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const chrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto(base + "/", { waitUntil: "networkidle" });
await page.getByText("Action queue").waitFor({ timeout: 15000 });

await page.goto(base + "/pipeline/", { waitUntil: "networkidle" });
await page.getByText("Find 25 employers this week").waitFor({ timeout: 15000 });

await page.goto(base + "/compliance/", { waitUntil: "networkidle" });
await page.getByText("Triage the seven").waitFor({ timeout: 15000 });

await page.goto(base + "/playbook/", { waitUntil: "networkidle" });
await page.getByRole("tab", { name: "Outreach" }).click();
await page.getByText("Eight touches, 21 days").waitFor({ timeout: 10000 });

await page.goto(base + "/numbers/", { waitUntil: "networkidle" });
await page.getByText("Revenue model").waitFor({ timeout: 15000 });

console.log(errors.length ? `Errors: ${errors.join(" | ")}` : "Smoke test passed");
await browser.close();
if (errors.length) process.exit(1);
