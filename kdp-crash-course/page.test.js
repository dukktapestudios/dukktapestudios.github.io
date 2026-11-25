/* Coverage and privacy checks for the Amazon KDP crash course.
   Run from the repo root: node kdp-crash-course/page.test.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
var home = fs.readFileSync(path.join(root, "index.html"), "utf8");
var sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

assert.ok(html.indexOf("<title>Make and sell your first simple book on Amazon KDP: a crash course | Dukktape Studios</title>") !== -1);
assert.ok(html.indexOf('name="viewport"') !== -1);
assert.ok(html.indexOf(":focus-visible") !== -1);
assert.ok(html.indexOf("prefers-reduced-motion: reduce") !== -1);
assert.ok(html.indexOf("--column: 740px") !== -1);
assert.ok(html.indexOf("overflow-x: auto") !== -1);
assert.ok(html.indexOf('class="skip"') !== -1);
assert.ok(html.indexOf('href="/#guides"') !== -1);
assert.ok(html.indexOf('href="#content">Back to top</a>') !== -1);
assert.ok(html.indexOf("Crash course · Checked on November 22, 2026") !== -1);
assert.ok(html.indexOf("A beginner crash course on making a simple paperback, like an activity or puzzle book, and selling it through Amazon's Kindle Direct Publishing (KDP).") !== -1);
assert.ok(html.indexOf("When in doubt, answer the AI question honestly.") !== -1);
assert.ok(html.indexOf("On Amazon.com, one cent can change your royalty a lot: $9.98 earns 50%, $9.99 earns 60%.") !== -1);
assert.ok(html.indexOf("a zero tolerance policy for metadata that is meant to advertise, promote, or mislead.") !== -1);
assert.ok(html.indexOf("What could not be confirmed") !== -1);
assert.ok(html.indexOf("A learning guide.") !== -1);
assert.ok(html.indexOf("Not tax advice") !== -1);
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
assert.ok(html.indexOf("mermaid") === -1, "no diagram library");
assert.strictEqual((html.match(/<script/g) || []).length, 2, "giscus and the plan checklist are the only scripts");
assert.ok(html.indexOf('src="https://giscus.app/client.js"') !== -1);
assert.ok(html.indexOf('data-key="dts:kdp-crash-course:plan:v1"') !== -1);
assert.strictEqual((html.match(/class="callout remember"/g) || []).length, 9, "Remember boxes stay on the steps that need them");
assert.strictEqual((html.match(/class="callout danger"/g) || []).length, 1, "the tax warning stays in place");
assert.strictEqual((html.match(/class="callout check"/g) || []).length, 6, "Check it boxes stay in place");
assert.strictEqual((html.match(/type="checkbox"/g) || []).length, 13, "one checkbox per plan item");

var sections = ["what-is-kdp", "book-types", "tools-and-ai", "trim-bleed-margins", "interior", "cover", "isbn", "money", "worked-example", "ebooks", "keywords-categories", "proofs", "taxes", "limits-and-pay", "example-idea", "inspiration", "plan", "not-confirmed", "sources"];
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
  "https://kdp.amazon.com/en_US/",
  "https://kdp.amazon.com/en_US/help/topic/GGE5T76TWKA85DJM",
  "https://kdp.amazon.com/en_US/help/topic/G200672390",
  "https://kdp.amazon.com/en_US/help/topic/G200952510",
  "https://kdp.amazon.com/en_US/help/topic/G200735480",
  "https://kdp.amazon.com/en_US/help/topic/G201834230",
  "https://kdp.amazon.com/en_US/help/topic/GUGQ4WDZ92F733GC",
  "https://kdp.amazon.com/en_US/help/topic/G201113520",
  "https://kdp.amazon.com/en_US/help/topic/G201834180",
  "https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6",
  "https://kdp.amazon.com/en_US/help/topic/G201834190",
  "https://kdp.amazon.com/en_US/help/topic/G201857950",
  "https://kdp.amazon.com/en_US/help/topic/G201953020",
  "https://kdp.amazon.com/cover-templates",
  "https://kdp.amazon.com/en_US/help/topic/G5HDYGP4BXLX4RUW",
  "https://kdp.amazon.com/en_US/help/topic/G201834170",
  "https://kdp.amazon.com/en_US/help/topic/G201834330",
  "https://kdp.amazon.com/en_US/help/topic/G201834340",
  "https://kdp.amazon.com/royalty-calculator",
  "https://kdp.amazon.com/en_US/help/topic/G200644210",
  "https://kdp.amazon.com/en_US/help/topic/G200634560",
  "https://kdp.amazon.com/en_US/help/topic/G200634500",
  "https://kdp.amazon.com/en_US/help/topic/G201298500",
  "https://kdp.amazon.com/en_US/help/topic/G200652170",
  "https://kdp.amazon.com/en_US/help/topic/G201097560",
  "https://kdp.amazon.com/en_US/help/topic/GVEG4YA9G2T7N6DR",
  "https://kdp.amazon.com/en_US/help/topic/G2MYNEKHT443C2H2",
  "https://kdp.amazon.com/en_US/help/topic/G201274750",
  "https://kdp.amazon.com/en_US/help/topic/G201723290",
  "https://taxcentral.amazon.com/tax-interview/help?locale=en_US&amp;nodeId=201447640",
  "https://www.irs.gov/forms-pubs/about-form-w-9",
  "https://kdp.amazon.com/en_US/help/topic/G202172740",
  "https://kdp.amazon.com/en_US/help/topic/GK2MKZUL6U3SFBPZ",
  "https://x.com/learnwith_games/status/2124488535550169490",
  "https://learnwith.games/books/year-3-maths-game-book/",
  "https://www.libreoffice.org/",
  "https://www.scribus.net/",
  "https://inkscape.org/",
  "https://www.gimp.org/"
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

var guides = home.split('id="guides"')[1].split('id="tools"')[0];
assert.ok(guides.indexOf("https://dukktapestudios.github.io/kdp-crash-course/") !== -1);
assert.ok(guides.indexOf("Make and sell your first simple book on Amazon KDP") !== -1);
assert.ok(guides.indexOf("A beginner crash course on making a simple puzzle or activity paperback and selling it on Amazon KDP, with real printing costs, royalties, AI rules and a 30-day plan.") !== -1);
assert.ok(sitemap.indexOf("https://dukktapestudios.github.io/kdp-crash-course/") !== -1);

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

console.log("Amazon KDP crash course checks passed.");
