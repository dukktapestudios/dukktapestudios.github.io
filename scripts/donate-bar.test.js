/* Donation bar coverage.
   Run from the repo root: node scripts/donate-bar.test.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var skip = { "google55c4ad63a2c821ad.html": true };
var line = "Free to use. Donations welcome — they keep this going.";
var href = "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&amp;business=dukktapestudios%40gmail.com&amp;item_name=Dukktape%20Studios&amp;currency_code=USD";
var pages = [];

function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
    if (entry.name === ".git" || entry.name === "node_modules") return;
    var full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) {
      var rel = path.relative(root, full).split(path.sep).join("/");
      if (!skip[rel]) pages.push(rel);
    }
  });
}
walk(root);
assert.ok(pages.length >= 48, "expected the public HTML inventory");
assert.ok(pages.indexOf("index.html") !== -1);
assert.ok(pages.indexOf("connected-systems/index.html") !== -1);
assert.ok(pages.indexOf("roundpen/index.html") !== -1);
assert.ok(pages.indexOf("space/index.html") !== -1);
assert.ok(pages.indexOf("digialex/fleet/index.html") !== -1);
assert.strictEqual(pages.indexOf("google55c4ad63a2c821ad.html"), -1);

var css = fs.readFileSync(path.join(root, "assets/donate-bar.css"), "utf8");
assert.ok(css.indexOf("flex-wrap: wrap") !== -1, "bar wraps");
assert.ok(css.indexOf("justify-content: flex-start") !== -1, "bar content starts at the left");
assert.ok(css.indexOf("min-height: 44px") !== -1, "donate control is a touch target");
assert.ok(css.indexOf(":focus-visible") !== -1);
assert.ok(css.indexOf("#171b1e") !== -1);
assert.ok(css.indexOf("#efb671") !== -1);
assert.ok(css.indexOf("position: fixed") === -1, "bar stays in flow");
assert.ok(css.indexOf("prefers-reduced-motion") !== -1);

pages.forEach(function (rel) {
  var html = fs.readFileSync(path.join(root, rel), "utf8");
  var depth = rel.split("/").length - 1;
  var prefix = depth === 0 ? "" : new Array(depth + 1).join("../");
  assert.ok(html.indexOf('href="' + prefix + 'assets/donate-bar.css"') !== -1, "css path " + rel);
  assert.strictEqual((html.split(line).length - 1), 1, "exact line once " + rel);
  assert.strictEqual((html.split('class="dts-donate-link"').length - 1), 1, "one donate link " + rel);
  assert.ok(html.indexOf('href="' + href + '">Donate</a>') !== -1, "destination " + rel);
  var asideStart = html.indexOf('<aside class="dts-donate"');
  var aside = html.slice(asideStart, html.indexOf("</aside>", asideStart));
  assert.ok(aside.indexOf(">Donate</a>") !== -1 && aside.indexOf(">Donate</a>") < aside.indexOf(line), "Donate is leftmost, before the support line " + rel);
  assert.ok(html.indexOf("ducttapestudios") === -1, "wrong recipient address is absent " + rel);
  assert.ok(html.indexOf("paypal.me") === -1, "no assumed PayPal.Me " + rel);
  assert.ok(!/paypalobjects|paypal\.com\/sdk|paypal\.com\/sdk\/js/i.test(html), "no PayPal script " + rel);
  assert.ok(!/tax-deductible|nonprofit|501\(c\)/i.test(html.slice(html.indexOf("dts-donate"), html.indexOf("dts-donate") + 800)), "no nonprofit claim " + rel);
  assert.ok(!/paywall|premium only|subscribe to continue/i.test(html), "no paywall " + rel);
  var bodyAt = html.search(/<body\b/i);
  var barAt = html.indexOf('class="dts-donate"');
  assert.ok(bodyAt !== -1 && barAt > bodyAt, "bar is in the body " + rel);
  var afterBody = html.slice(bodyAt, barAt).replace(/<body\b[^>]*>/i, "").replace(/<aside\b[^>]*$/i, "");
  assert.ok(!/<[a-z]/i.test(afterBody), "bar is the first element " + rel);
});

var verify = fs.readFileSync(path.join(root, "google55c4ad63a2c821ad.html"), "utf8");
assert.ok(verify.indexOf("dts-donate") === -1, "verification file stays untouched");

console.log("Donation bar checks passed for " + pages.length + " pages.");
