import { chromium } from "playwright";

const url = process.argv[2] || "http://localhost:3000";
const outDir =
  "C:\\Users\\himan\\AppData\\Local\\Temp\\claude\\c--Users-himan-OneDrive-Desktop-DGB-India\\4ffdd92b-8431-4470-a14b-0d50bbb46f97\\scratchpad";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.emulateMedia({ reducedMotion: "no-preference" });
const errors: string[] = [];
const logs: string[] = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
  if (msg.text().includes("[ScrollHero]")) logs.push(msg.text());
});
page.on("pageerror", (err) => errors.push(String(err)));

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(4000);
console.log("ScrollHero logs:\n" + logs.join("\n"));

const rm = await page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
const iw = await page.evaluate(() => window.innerWidth);
console.log("reducedMotion:", rm, "innerWidth:", iw);
const mode = await page.evaluate(() => document.querySelector("[data-scroll-stage]")?.getAttribute("data-mode"));
const stageHeight = await page.evaluate(() => {
  const el = document.querySelector("[data-scroll-stage]") as HTMLElement | null;
  return el ? el.getBoundingClientRect().height : 0;
});
const pinRange = Math.max(stageHeight - 900, 1); // ScrollTrigger's actual "top top" -> "bottom bottom" scroll distance
console.log("mode:", mode, "stageHeight:", stageHeight, "pinRange:", pinRange);

await page.screenshot({ path: `${outDir}\\hero-0.png` });

const fractions = [0.05, 0.18, 0.3, 0.45, 0.6, 0.75, 0.95];
for (const f of fractions) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(pinRange * f));
  await page.waitForTimeout(1200); // let scrub:0.6 catch up before capturing
  await page.screenshot({ path: `${outDir}\\hero-${f}.png` });
}

console.log("Console/page errors:", errors.length ? errors.join(" | ") : "none");
await browser.close();
console.log("Done.");
