/* Coverage and privacy checks for the off-grid solar and battery build guide.
   Run from the repo root: node solar-battery-build-guide/page.test.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
var home = fs.readFileSync(path.join(root, "index.html"), "utf8");
var sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

assert.ok(html.indexOf("<title>Off-grid solar + battery build guide: a beginner's guide | Dukktape Studios</title>") !== -1);
assert.ok(html.indexOf('name="viewport"') !== -1);
assert.ok(html.indexOf(":focus-visible") !== -1);
assert.ok(html.indexOf("prefers-reduced-motion: reduce") !== -1);
assert.ok(html.indexOf("--column: 740px") !== -1);
assert.ok(html.indexOf("overflow-x: auto") !== -1);
assert.ok(html.indexOf('class="skip"') !== -1);
assert.ok(html.indexOf('href="/#guides"') !== -1);
assert.ok(html.indexOf('href="#content">Back to top</a>') !== -1);
assert.ok(html.indexOf("Guide · Checked on November 19, 2026") !== -1);
assert.ok(html.indexOf("A beginner-friendly, step-by-step plan to build a small 12 V solar and battery system, one phase at a time.") !== -1);
assert.ok(html.indexOf("Every step has a Remember box and a Check it works test") !== -1);
assert.ok(html.indexOf("Watt-hour worksheet (EXAMPLE numbers only)") !== -1);
assert.ok(html.indexOf("Diagrams are AI-drawn concept sketches.") !== -1);
assert.ok(html.indexOf("Always follow your own parts’ manuals, local code and an electrician’s advice.") !== -1);
assert.ok(html.indexOf("A learning guide.") !== -1);
assert.ok(html.indexOf("© 2026 Dukktape Studios") !== -1);
assert.ok(html.indexOf('class="dts-donate"') !== -1);
assert.ok(html.indexOf("Free to use. Donations welcome — they keep this going.") !== -1);
assert.ok(html.indexOf("mermaid") === -1, "diagrams are static images");
assert.strictEqual((html.match(/<script/g) || []).length, 1, "the checklist is the only script");
assert.ok(html.indexOf("giscus.app") === -1, "no comment widget");
assert.ok(html.indexOf('data-key="dts:solar-battery-build-guide:checklist:v1"') !== -1);
assert.strictEqual((html.match(/class="callout remember"/g) || []).length, 76, "a Remember box on every step");
assert.strictEqual((html.match(/class="callout check"/g) || []).length, 76, "a Check it works test on every step");
assert.strictEqual((html.match(/id="step-/g) || []).length, 76, "one id per step");

var sections = ["the-big-picture", "phase-0", "wire-size-quick-table", "phase-1", "watt-hour-worksheet-example", "phase-2", "phase-3", "phase-4", "phase-5", "phase-6", "phase-7", "phase-8", "phase-9", "things-to-always-remember", "cost-summary-and-running-total", "phase-0-costs", "phase-2-costs", "phase-3-costs", "phase-4-costs", "phase-5-costs", "phase-6-costs", "phase-7-costs", "phase-8-costs", "phase-9-costs", "not-verified-no-price-yet", "progress-checklist", "sources"];
sections.forEach(function (id) {
  assert.ok(html.indexOf('id="' + id + '"') !== -1, "missing section " + id);
});

var toc = html.split('aria-label="Contents"')[1].split("</nav>")[0];
var tocIds = [];
var tocRe = /href="#([^"]+)"/g;
var tocMatch;
while ((tocMatch = tocRe.exec(toc))) tocIds.push(tocMatch[1]);
assert.deepStrictEqual(tocIds, sections);

var sources = [
  "https://www.victronenergy.com/upload/documents/The_Wiring_Unlimited_book/43562-Wiring_Unlimited-pdf-en.pdf",
  "https://www.victronenergy.com/media/pg/The_Wiring_Unlimited_book/en/dc-wiring.html",
  "https://www.victronenergy.com/media/pg/Manual_SmartSolar_MPPT_150-60_up_to_250-70/en/installation.html",
  "https://www.home-assistant.io/integrations/victron%5Fble",
  "https://github.com/Fabian-Schmidt/esphome-victron_ble",
  "https://www.epever.com/articles/charging-lifepo4-below-freezing-risks-and-options/",
  "https://liventolife.com/solar/illinois/chicago/",
  "https://www.mikeholt.com/files/PDF/20SOLAR_690.12.pdf",
  "https://interlockkit.com/faqs/",
  "https://breezystove.com/en-us/blogs/wood-stove-fan-guide/how-does-a-wood-stove-fan-work",
  "https://www.usstove.com/wp-content/uploads/2023/05/mh4-use-and-care-manual-1.pdf",
  "https://thermoelectric-generator.com/product/teg10w-stove-top-teg-generator/",
  "https://www.hse.gov.uk/Research/assets/docs/rr1177.pdf"
];
sources.forEach(function (url) {
  assert.ok(html.indexOf('href="' + url + '"') !== -1, "missing source " + url);
});

var assets = {};
var assetRe = /\.\.\/assets\/[A-Za-z0-9._/-]+/g;
var assetMatch;
while ((assetMatch = assetRe.exec(html))) assets[assetMatch[0]] = true;
Object.keys(assets).forEach(function (rel) {
  assert.ok(fs.existsSync(path.join(root, rel.replace(/^\.\.\//, ""))), "missing asset " + rel);
});
assert.ok(html.indexOf('href="../assets/') !== -1, "guide assets use the shared relative path");

["diagram-1.jpg", "diagram-2.jpg"].forEach(function (name) {
  assert.ok(html.indexOf('src="' + name + '"') !== -1, "missing image " + name);
  var bytes = fs.readFileSync(path.join(__dirname, name));
  assert.strictEqual(bytes.readUInt16BE(0), 0xffd8, name + " is a jpeg");
  assert.ok(bytes.length > 1000, name + " has pixels");
});

var guides = home.split('id="guides"')[1].split('id="tools"')[0];
assert.ok(guides.indexOf("https://dukktapestudios.github.io/solar-battery-build-guide/") !== -1);
assert.ok(guides.indexOf("Off-grid solar + battery build guide") !== -1);
assert.ok(guides.indexOf('A beginner-friendly, step-by-step plan to build a small 12 V solar and battery system, one phase at a time, with real prices, a "Remember" box and a "Check it works" test at every step.') !== -1);
assert.ok(sitemap.indexOf("https://dukktapestudios.github.io/solar-battery-build-guide/") !== -1);

var banned = [
  /\bAlexander\b/,
  /\bDESKTOP-/,
  /C:\\Users/i,
  /mailto:/i,
  /\b\d{3}-\d{3}-\d{4}\b/,
  /\b\d{2,6}\s+[A-Za-z0-9'’-]{2,}(?:\s+[A-Za-z0-9'’-]{2,}){0,4}\s+(?:Rd|Road|St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Ln|Lane|Ct|Court|Way|Trail)\b/i
];
banned.forEach(function (pattern) {
  assert.ok(!pattern.test(html), "privacy pattern " + pattern);
});

var emails = html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
assert.deepStrictEqual(emails, [], "no plain email addresses");
assert.strictEqual((html.match(/dukktapestudios%40gmail\.com/g) || []).length, 1, "studio donation link only");
assert.ok(!/google-analytics|googletagmanager|gtag\(|plausible|umami|hotjar/i.test(html));

console.log("Off-grid solar and battery build guide checks passed.");
