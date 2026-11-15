/* Coverage and privacy checks for the Custom PCB Crash Course.
   Run from the repo root: node pcb-crash-course/page.test.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
var home = fs.readFileSync(path.join(root, "index.html"), "utf8");
var sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

assert.ok(html.indexOf("<title>Custom PCB Crash Course | Dukktape Studios</title>") !== -1);
assert.ok(html.indexOf('name="viewport"') !== -1);
assert.ok(html.indexOf(":focus-visible") !== -1);
assert.ok(html.indexOf("prefers-reduced-motion: reduce") !== -1);
assert.ok(html.indexOf("--column: 740px") !== -1);
assert.ok(html.indexOf("overflow-x: auto") !== -1);
assert.ok(html.indexOf('class="skip"') !== -1);
assert.ok(html.indexOf('href="/#guides"') !== -1);
assert.ok(html.indexOf('href="#content">Back to top</a>') !== -1);
assert.ok(html.indexOf("does not describe one person’s accounts, projects, or hardware") !== -1);
assert.ok(html.indexOf("A learning guide, not a command to buy anything.") !== -1);
assert.ok(html.indexOf("Nothing here is an affiliate link.") !== -1);
assert.ok(html.indexOf("From $2.00 for 5 boards.") !== -1);
assert.ok(html.indexOf("$5 per square inch, which includes three copies.") !== -1);
assert.ok(html.indexOf("Starts at $8 setup plus $0.0016 per solder joint.") !== -1);
assert.ok(html.indexOf("larger sizes (such as 0805) are friendlier than tiny ones.") !== -1);
assert.ok(html.indexOf("main ESP32-S3 power traces to be no less than 25 mil wide.") !== -1);
assert.ok(html.indexOf("A free, long") !== -1);
assert.ok(html.indexOf("Phil") === -1, "no personal name in the visible citation");
assert.ok(html.indexOf("https://www.phils-lab.net/videos") !== -1, "cited videos page stays");
assert.ok(html.indexOf("Feedback &amp; Suggestions") !== -1);
assert.ok(html.indexOf("© 2026 Dukktape Studios") !== -1);
assert.ok(html.indexOf('data-repo="dukktapestudios/dukktapestudios.github.io"') !== -1);
assert.ok(html.indexOf('data-repo-id="R_kgDOVcgvLw"') !== -1);
assert.ok(html.indexOf('data-category="General"') !== -1);
assert.ok(html.indexOf('data-category-id="DIC_kwDOVcgvL84DKFnn"') !== -1);
assert.ok(html.indexOf('data-mapping="pathname"') !== -1);
assert.ok(html.indexOf('data-theme="dark"') !== -1);
assert.ok(html.indexOf('class="dts-donate"') !== -1);
assert.ok(html.indexOf("Free to use. Donations welcome — they keep this going.") !== -1);
assert.ok(html.indexOf("mermaid") === -1, "diagram is static HTML and CSS");
assert.strictEqual((html.match(/<script/g) || []).length, 1, "giscus is the only script");
assert.ok(html.indexOf('src="https://giscus.app/client.js"') !== -1);

var sections = ["what-is-pcb", "why-design", "real-goals", "workflow", "tools", "first-project", "mistakes", "learning-path", "glossary", "sources"];
sections.forEach(function (id) {
  assert.ok(html.indexOf('id="' + id + '"') !== -1, "missing section " + id);
});
assert.ok(html.indexOf('id="feedback"') !== -1);

var toc = html.split('aria-label="Contents"')[1].split("</nav>")[0];
var tocIds = [];
var tocRe = /href="#([^"]+)"/g;
var tocMatch;
while ((tocMatch = tocRe.exec(toc))) tocIds.push(tocMatch[1]);
assert.deepStrictEqual(tocIds, sections);

var sources = [
  "https://jlcpcb.com/",
  "https://jlcpcb.com/pcb-assembly",
  "https://jlcpcb.com/capabilities/pcb-capabilities",
  "https://docs.oshpark.com/services/two-layer/",
  "https://docs.oshpark.com/services/",
  "https://www.pcbway.com/",
  "https://www.kicad.org/",
  "https://easyeda.com/",
  "https://www.flux.ai/",
  "https://protoflow.ai/",
  "https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/pcb-layout-design.html",
  "https://docs.kicad.org/10.0/en/getting_started_in_kicad/getting_started_in_kicad.html",
  "https://docs.kicad.org/10.0/en/pcb_calculator/pcb_calculator.html"
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
assert.ok(html.indexOf('href="/esp32-crash-course/"') !== -1);
assert.ok(fs.existsSync(path.join(root, "esp32-crash-course/index.html")), "ESP32 link target");

var guides = home.split('id="guides"')[1].split('id="tools"')[0];
assert.ok(guides.indexOf("https://dukktapestudios.github.io/pcb-crash-course/") !== -1);
assert.ok(sitemap.indexOf("https://dukktapestudios.github.io/pcb-crash-course/") !== -1);

var banned = [
  /\bAlexander\b/,
  /\bDESKTOP-/,
  /C:\\Users/i,
  /mailto:/i,
  /\b\d{3}-\d{3}-\d{4}\b/,
  /\b\d{2,6}\s+[A-Za-z0-9.'’-]{2,}(?:\s+[A-Za-z0-9.'’-]{2,}){0,4}\s+(?:Rd|Road|St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Ln|Lane|Ct|Court|Way|Trail)\b/i
];
banned.forEach(function (pattern) {
  assert.ok(!pattern.test(html), "privacy pattern " + pattern);
});

var emails = html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
assert.deepStrictEqual(emails, [], "no plain email addresses");
assert.strictEqual((html.match(/dukktapestudios%40gmail\.com/g) || []).length, 1, "studio donation link only");
assert.ok(!/google-analytics|googletagmanager|gtag\(|plausible|umami|hotjar/i.test(html));

console.log("Custom PCB Crash Course checks passed.");
