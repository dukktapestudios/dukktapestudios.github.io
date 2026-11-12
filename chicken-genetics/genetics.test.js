/* Chicken genetics checks.
   Run from the repo root: node chicken-genetics/genetics.test.js */
var fs = require("fs");
var path = require("path");
var genetics = require("./genetics.js");

var failed = 0;

function assert(cond, message) {
  if (!cond) {
    failed += 1;
    console.error("FAIL: " + message);
  }
}

var checks = genetics.selfCheck();
checks.forEach(function (check) {
  if (check.ok) {
    console.log("PASS " + check.name + (check.detail ? " — " + check.detail : ""));
  } else {
    failed += 1;
    console.error("FAIL " + check.name + (check.detail ? " — " + check.detail : ""));
  }
});

var required = [
  "rose x pea (RRpp x rrPP) = 100% walnut",
  "walnut het x walnut het = 9:3:3:1",
  "silver rooster (S/S) x gold hen (s+/W) = all chicks silver",
  "gold rooster x silver hen = sex-link (males silver, females gold)",
  "blue x blue = 25% black / 50% blue / 25% splash"
];
required.forEach(function (name) {
  var found = checks.filter(function (check) { return check.name === name && check.ok; });
  assert(found.length === 1, "missing passing check: " + name);
});

var htmlPath = path.join(__dirname, "index.html");
var html = fs.readFileSync(htmlPath, "utf8");
assert(html.indexOf("<title>Chicken Breeding Genetics Calculator</title>") !== -1, "title");
assert(html.indexOf('name="viewport" content="width=device-width,initial-scale=1"') !== -1, "viewport");
assert(html.indexOf('href="../assets/donate-bar.css"') !== -1, "donate css");
assert(html.indexOf("Free to use. Donations welcome — they keep this going.") !== -1, "donate line");
assert(html.indexOf('class="dts-donate"') !== -1, "donate bar");
assert(html.indexOf("&copy; 2026 Dukktape Studios") !== -1, "footer credit");
assert(html.indexOf('src="genetics.js"') !== -1, "local script");
assert(html.indexOf("How this works / assumptions") !== -1, "assumptions");
assert(html.indexOf("polygenic") !== -1, "brown eggs called polygenic");
assert(html.indexOf("ZZ") !== -1 && html.indexOf("ZW") !== -1, "sex chromosomes");
assert(html.indexOf("frazzle") !== -1, "frazzle warning");
assert(html.indexOf("oocyan") !== -1, "blue egg gene named");
assert(/goatcounter|gc\.zgo\.at|google-analytics|googletagmanager|gtag\(|plausible|umami|hotjar|facebook\.com\/tr/i.test(html) === false, "no trackers");
assert(/localStorage|indexedDB|fetch\s*\(/.test(html) === false, "no storage or network calls");
assert((html.match(/<script[^>]+src=/g) || []).length === 1, "one external script");
assert(html.indexOf('src="genetics.js"') !== -1, "that script is genetics.js");

var srcs = html.match(/src="([^"]+)"/g) || [];
srcs.forEach(function (src) {
  assert(src.indexOf("http") === -1, "script stays local " + src);
});

[
  "Rose comb",
  "Pea comb",
  "walnut",
  "extended black",
  "wheaten",
  "duckwing",
  "Columbian",
  "Silver",
  "Barring",
  "Blue",
  "splash",
  "Dominant white",
  "Recessive white",
  "olive/green",
  "Crest",
  "Muffs and beard",
  "Feathered legs",
  "Frizzle",
  "Dwarf"
].forEach(function (phrase) {
  assert(html.toLowerCase().indexOf(phrase.toLowerCase()) !== -1, "page mentions " + phrase);
});

var engine = fs.readFileSync(path.join(__dirname, "genetics.js"), "utf8");
assert(/goatcounter|fetch\s*\(|localStorage|XMLHttpRequest/.test(engine) === false, "engine stays offline");

if (failed) {
  console.error(failed + " failed");
  process.exit(1);
}
console.log("All chicken genetics checks passed (" + checks.length + " model checks).");
