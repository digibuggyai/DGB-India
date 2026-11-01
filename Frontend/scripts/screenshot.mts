import { chromium } from "playwright";

const url = process.argv[2] || "http://localhost:3000";
const out =
  process.argv[3] ||
  "C:\\Users\\himan\\AppData\\Local\\Temp\\claude\\c--Users-himan-OneDrive-Desktop-DGB-India\\4ffdd92b-8431-4470-a14b-0d50bbb46f97\\scratchpad\\screenshot.png";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });

let y = 0;
for (;;) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  if (y >= height) break;
  await page.evaluate((py) => window.scrollTo(0, py), y);
  await page.waitForTimeout(150);
  y += 150;
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);

await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log("Saved to", out);
