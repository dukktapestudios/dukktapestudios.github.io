/* Course page checks. Run from the repo root:
   node app-store-course/page.test.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var wins = require("./wins.js");

var root = path.join(__dirname);
var html = fs.readFileSync(path.join(root, "index.html"), "utf8");
var js = fs.readFileSync(path.join(root, "course.js"), "utf8");
var css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

function ids(markup) {
  var found = {};
  var re = /id="([^"]+)"/g;
  var match;
  while ((match = re.exec(markup))) found[match[1]] = true;
  return found;
}

var present = ids(html);
var toc = html.split('aria-label="Contents"')[1].split("</nav>")[0];
var hrefs = [];
var hrefRe = /href="#([^"]+)"/g;
var hrefMatch;
while ((hrefMatch = hrefRe.exec(toc))) hrefs.push(hrefMatch[1]);
assert.ok(hrefs.length >= 30, "toc has a full course");
hrefs.forEach(function (id) {
  assert.ok(present[id], "missing section " + id);
});

[
  "The first hour, on this page",
  "Put the mug in the sink",
  "Expo Go",
  "development build",
  "production build",
  "Windows",
  "Xcode",
  "99 USD",
  "1179",
  "1206",
  "90 days",
  "10,000",
  "4.2",
  "not legal advice",
  "app.example.onesmallwin",
  "were not compiled",
  "does not mean Apple will approve",
  "checked 8 November 2026",
  "prefers-reduced-motion",
  "localStorage"
].forEach(function (needle) {
  assert.ok(html.indexOf(needle) !== -1 || css.indexOf(needle) !== -1 || js.indexOf(needle) !== -1, "missing " + needle);
});

assert.ok(html.indexOf('class="skip"') !== -1, "skip link");
assert.ok(css.indexOf(":focus-visible") !== -1, "focus");
assert.ok(css.indexOf("prefers-reduced-motion: reduce") !== -1, "reduced motion");
assert.ok(html.indexOf("dukktape-app-store-course-v1") === -1, "storage keys stay in the script");
assert.ok(js.indexOf("dukktape-app-store-course-v1-wins") !== -1, "wins key");
assert.ok(js.indexOf("dukktape-app-store-course-v1-checks") !== -1, "check key");
assert.ok(!/google-analytics|googletagmanager|gtag\(|plausible|umami|hotjar|goatcounter|giscus|facebook\.com\/tr/i.test(html + js), "no trackers");
assert.ok(html.indexOf("<form") === -1, "no form posting personal data");

var external = [];
var extRe = /href="(https?:\/\/[^"]+)"/g;
var extMatch;
while ((extMatch = extRe.exec(html))) external.push(extMatch[1]);
assert.ok(external.length >= 40, "sources linked");
external.forEach(function (url) {
  assert.ok(url.indexOf(" ") === -1, "space in url " + url);
});

["starter/src/app/index.tsx", "starter/src/app/list.tsx", "starter/src/app/about.tsx", "starter/src/app/_layout.tsx", "starter/src/lib/wins.ts", "starter/mac/ContentView.swift", "starter/app-json-snippet.json"].forEach(function (rel) {
  assert.ok(fs.existsSync(path.join(root, rel)), rel);
  assert.ok(html.indexOf(rel) !== -1, "course links " + rel);
});

var starter = fs.readFileSync(path.join(root, "starter/src/lib/wins.ts"), "utf8");
assert.ok(starter.indexOf("MAX_WIN_LENGTH = 120") !== -1, "starter limit");
assert.strictEqual(wins.MAX, 120);

var added = wins.addWin([], "  Put the mug in the sink  ", 10);
assert.strictEqual(added.ok, true);
assert.strictEqual(added.list[0].text, "Put the mug in the sink");
assert.strictEqual(wins.addWin(added.list, "   ", 11).ok, false);
assert.strictEqual(wins.addWin([], "x".repeat(121), 12).error, "long");
var toggled = wins.toggleWin(added.list, added.list[0].id);
assert.strictEqual(toggled[0].done, true);
assert.strictEqual(wins.openWins(toggled).length, 0);
var removed = wins.removeWin(toggled, toggled[0].id);
assert.strictEqual(removed.length, 0);
var raw = wins.serialize(added.list);
assert.strictEqual(wins.parseWins(raw)[0].text, "Put the mug in the sink");
assert.deepStrictEqual(wins.parseWins("{"), []);
assert.deepStrictEqual(wins.parseWins("{\"text\":\"nope\"}"), []);

var many = [];
for (var i = 0; i < 200; i += 1) many = wins.addWin(many, "win " + i, i).list;
assert.strictEqual(wins.addWin(many, "one more", 999).error, "full");

console.log("App Store course checks passed.");
