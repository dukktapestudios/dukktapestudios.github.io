/* Static checks for the open documents checklist.
   Run from the repo root: node documents-checklist/checklist.test.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var store = require("./store.js");

var root = path.join(__dirname, "..");
var dir = __dirname;
var html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
var app = fs.readFileSync(path.join(dir, "app.js"), "utf8");
var css = fs.readFileSync(path.join(dir, "styles.css"), "utf8");
var storeSrc = fs.readFileSync(path.join(dir, "store.js"), "utf8");
var product = html + "\n" + app + "\n" + css + "\n" + storeSrc;

var expected = [
  ["va", "VA"],
  ["housing", "Housing"],
  ["tax", "Tax"],
  ["banking", "Banking"],
  ["school", "School"],
  ["vehicles", "Vehicles"],
  ["identity", "Identity"],
  ["medical", "Medical"],
  ["benefits", "Benefits"],
  ["security", "Crypto / security notes"]
];

function fail(message) {
  throw new Error(message);
}

var categories = [];
var sectionRe = /<section class="packet" id="cat-([a-z]+)" data-category="([a-z]+)"[\s\S]*?(?=<section |<p class="page-footer")/g;
var match;
while ((match = sectionRe.exec(html))) {
  var block = match[0];
  var id = match[2];
  if (match[1] !== id) fail("section id does not match category " + id);
  var title = (block.match(/<h2><span>\d{2}<\/span> ([^<]+)<\/h2>/) || [])[1];
  var checks = [];
  var itemRe = /data-check="([^"]+)"/g;
  var item;
  while ((item = itemRe.exec(block))) checks.push(item[1]);
  var guides = block.match(/<p class="guide"/g) || [];
  var labels = block.match(/I have that:/g) || [];
  var options = block.match(/<option value="(blank|partial|filed)">/g) || [];
  categories.push({ id: id, title: title, checks: checks, guides: guides.length, labels: labels.length, options: options.length });
}

assert.strictEqual(categories.length, 10, "ten categories");
categories.forEach(function (category, index) {
  assert.strictEqual(category.id, expected[index][0]);
  assert.strictEqual(category.title, expected[index][1]);
  assert.ok(category.checks.length >= 5, category.id + " needs document types");
  assert.strictEqual(category.guides, category.checks.length, category.id + " guides");
  assert.strictEqual(category.labels, category.checks.length, category.id + " labels");
  assert.strictEqual(category.options, 3, category.id + " living onboarding options");
});

var allChecks = [];
categories.forEach(function (category) {
  category.checks.forEach(function (id) {
    if (allChecks.indexOf(id) !== -1) fail("duplicate id " + id);
    allChecks.push(id);
  });
});
assert.strictEqual(allChecks.length, 56);

var known = {
  checks: allChecks,
  categories: categories.map(function (category) { return category.id; })
};

assert.deepStrictEqual(
  store.sanitize({
    v: 1,
    checks: { "va-dd214": true, "not-a-document": true, "tax-return": "no" },
    status: { va: "partial", housing: "blank", tax: "filed", school: "other" },
    notes: "extra"
  }, known),
  { v: 1, checks: { "va-dd214": true }, status: { va: "partial", tax: "filed" } }
);

var rejected = store.acceptedImport({ v: 1, checks: { "not-a-document": true }, status: {} }, known);
assert.strictEqual(rejected.ok, false);
var emptyMarks = store.acceptedImport({ v: 1, checks: {}, status: {} }, known);
assert.strictEqual(emptyMarks.ok, true);
assert.deepStrictEqual(emptyMarks.state, { v: 1, checks: {}, status: {} });

var saved = JSON.stringify(store.sanitize({
  v: 1,
  checks: { "id-birth": true },
  status: { identity: "filed" }
}, known));
assert.strictEqual(saved.indexOf("true"), saved.lastIndexOf("true"));
["notes", "name", "secret", "@", "http"].forEach(function (token) {
  if (saved.indexOf(token) !== -1) fail("saved marks include " + token);
});

assert.ok(html.indexOf("<h1>Documents Checklist</h1>") !== -1);
assert.ok(html.indexOf('type="password"') === -1);
assert.ok(html.indexOf("<textarea") === -1);
assert.ok(html.indexOf('type="text"') === -1);
assert.ok(html.indexOf('type="email"') === -1);
assert.ok(product.toLowerCase().indexOf("sign in") === -1);
assert.ok(product.toLowerCase().indexOf("log in") === -1);
assert.ok(product.indexOf("oauth") === -1);
assert.ok(product.indexOf("sessionStorage") === -1);
assert.ok(product.indexOf("document.cookie") === -1);
assert.ok(app.indexOf("fetch(") === -1);
assert.ok(store.KEY === "dukktape-documents-checklist-v1");

["se" + "ed phrase", "mnemonic", "private key", "BEGIN OPENSSH", "apiKey", "bearer "].forEach(function (token) {
  if (product.toLowerCase().indexOf(token.toLowerCase()) !== -1) fail("banned token present");
});
if (/\b\d{3}-\d{2}-\d{4}\b/.test(product)) fail("id-number pattern present");
if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(product)) fail("mail address present");
if (/\b\d{3}[-.)]\s*\d{3}[-.]\d{4}\b/.test(product)) fail("phone pattern present");
if (/\bDESKTOP-[A-Z0-9]+\b/.test(product)) fail("hostname present");
if (/\b\d{2,6}\s+[A-Za-z0-9.'’-]{2,}(?:\s+[A-Za-z0-9.'’-]{2,}){0,4}\s+(?:Rd|Road|St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Ln|Lane|Ct|Court|Way|Trail)\b/i.test(product)) {
  fail("street-like line present");
}

var scheduleGroups = [
  ["day", "Daily", ["Medications", "Five-minute money glance", "One real task from a list"]],
  ["month", "Monthly", ["Pay bills", "Review bank and credit card statements", "Quick budget glance"]],
  ["quarter", "Quarterly", ["Review investments or retirement contributions", "Check insurance coverage"]],
  ["half", "Twice a year", ["Change smoke detector batteries", "Clean dryer vent"]],
  ["year", "Annually", ["File taxes", "Review or update will or beneficiaries", "Get a physical", "Review critical-account passwords", "Inventory important documents"]]
];
assert.ok(html.indexOf("Yearly adult responsibilities schedule") !== -1);
assert.ok(html.indexOf("does not send reminders") !== -1);
assert.ok(html.indexOf("as prescribed") !== -1);
assert.ok(html.indexOf("Sealed-life") !== -1);
assert.ok(html.indexOf("clinician") !== -1);
assert.ok(html.indexOf("weak, reused, or exposed") !== -1);
assert.ok(html.indexOf("does not need a yearly swap") !== -1);
var scheduleCount = 0;
scheduleGroups.forEach(function (group) {
  assert.ok(html.indexOf('data-period="' + group[0] + '"') !== -1, group[1]);
  assert.ok(html.indexOf(">" + group[1] + "<") !== -1, group[1]);
  group[2].forEach(function (label) {
    assert.ok(html.indexOf(label) !== -1, label);
    scheduleCount += 1;
  });
});
assert.strictEqual(scheduleCount, 15);
assert.strictEqual((html.match(/data-schedule="/g) || []).length, 15);
assert.ok(app.indexOf("new Notification") === -1);
assert.ok(app.indexOf("serviceWorker") === -1);
assert.ok(app.indexOf("setInterval") === -1);

var when = new Date(2026, 10, 7);
assert.strictEqual(store.periodToken("day", when), "2026-11-07");
assert.strictEqual(store.periodToken("month", when), "2026-11");
assert.strictEqual(store.periodToken("quarter", when), "2026-Q4");
assert.strictEqual(store.periodToken("half", when), "2026-H2");
assert.strictEqual(store.periodToken("year", when), "2026");
var january = new Date(2026, 0, 1);
assert.strictEqual(store.periodToken("quarter", january), "2026-Q1");
assert.strictEqual(store.periodToken("half", january), "2026-H1");
var kinds = { "day-meds": "day", "year-taxes": "year" };
assert.deepStrictEqual(store.activeSchedule({
  "day-meds": "2020-01-01",
  "year-taxes": "2026",
  "day-money": "extra words",
  notes: "nope"
}, kinds, when), { "year-taxes": "2026" });
assert.deepStrictEqual(store.activeSchedule({ "day-meds": "2026-11-07" }, kinds, when), { "day-meds": "2026-11-07" });

var home = fs.readFileSync(path.join(root, "index.html"), "utf8");
var sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
assert.strictEqual(home.indexOf("documents-checklist"), -1);
assert.strictEqual(sitemap.indexOf("documents-checklist"), -1);

console.log("Documents checklist checks passed.");
