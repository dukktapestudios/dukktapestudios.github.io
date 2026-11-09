/* Homepage checks for the charcoal redesign.
   Run from the repo root: node scripts/home.test.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var root = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(root, "index.html"), "utf8");

function fail(message) {
  throw new Error(message);
}

assert.ok(html.indexOf("<title>Dukktape Studios</title>") !== -1, "title");
assert.ok(html.indexOf('name="viewport"') !== -1, "viewport");
assert.ok(html.indexOf('id="projects"') !== -1, "projects section");
assert.ok(html.indexOf('id="guides"') !== -1, "guides section");
assert.ok(html.indexOf('id="tools"') !== -1, "tools section");
assert.ok(html.indexOf('id="junk-drawer"') !== -1, "junk drawer kept");
assert.ok(html.indexOf("assets/studio-duck.png") !== -1, "white duck asset");
assert.ok(html.indexOf("White cartoon duck with a silver duct-tape bow tie") !== -1, "duck alt");
assert.ok(html.indexOf("prefers-reduced-motion: reduce") !== -1, "reduced motion");
assert.ok(html.indexOf(":focus-visible") !== -1, "keyboard focus");
assert.ok(html.indexOf('class="skip"') !== -1, "skip link");
assert.ok(html.indexOf("A place for useful ideas.") !== -1, "hero lede");
assert.ok(html.indexOf("Simple ideas. Useful things.") !== -1, "footer line");

assert.strictEqual(html.indexOf("documents-checklist"), -1, "checklist stays off the homepage");
assert.strictEqual(html.indexOf("dukktape-duck.png"), -1, "old green duck file not used here");
assert.strictEqual(html.indexOf("dukktape-duck.webp"), -1, "old green duck webp not used here");
assert.strictEqual(html.indexOf("banner.jpg"), -1, "old banner not on this design");
assert.ok(!/green duck/i.test(html), "no green duck copy");
assert.ok(!/\bAlexander\b/.test(html), "no personal name");
assert.ok(!/\bbiodome\b/i.test(html), "no biodome scenery");
assert.ok(!/google-analytics|googletagmanager|gtag\(|plausible|umami|hotjar|facebook\.com\/tr/i.test(html), "no new trackers");
assert.ok(html.indexOf("dukktape.goatcounter.com/count") !== -1, "existing page counter kept");
assert.ok(html.indexOf("abacus.jasoncameron.dev/hit/dukktapestudios.github.io/homepage-uniques") !== -1, "existing visitor counter kept");

var required = [
  "https://dukktape-studios-shop.fourthwall.com/",
  "https://dukktapestudios.github.io/b2b-sales-course/",
  "https://dukktapestudios.github.io/digialex/local-ai/",
  "https://dukktapestudios.github.io/digialex/lora/",
  "https://dukktapestudios.github.io/digialex/cluster/",
  "https://dukktapestudios.github.io/landlord-guide/",
  "https://dukktapestudios.github.io/raspberry-pi/",
  "https://dukktapestudios.github.io/white-hat-crash-course/",
  "https://dukktapestudios.github.io/cyber-crash-course/",
  "https://dukktapestudios.github.io/common-ground/",
  "https://dukktapestudios.github.io/veterans-day/",
  "https://dukktapestudios.github.io/stories/",
  "https://dukktapestudios.github.io/irl-armory/",
  "https://dukktapestudios.github.io/rooster-rumble/",
  "https://dukktapestudios.github.io/horse-genetics/",
  "https://dukktapestudios.github.io/horse-cards/",
  "https://dukktapestudios.github.io/roundpen/",
  "https://dukktapestudios.github.io/usda-504/",
  "https://dukktapestudios.github.io/foia/",
  "https://dukktapestudios.github.io/affect-me/",
  "https://dukktapestudios.github.io/hypocrisy-tracker/",
  "https://dukktapestudios.github.io/self-reliance/",
  "https://dukktapestudios.github.io/money/",
  "https://dukktapestudios.github.io/digialex/",
  "https://dukktapestudios.github.io/digialex/fleet/",
  "https://dukktapestudios.github.io/group-lot/",
  "https://dukktapestudios.github.io/smv-calculator/",
  "https://dukktapestudios.github.io/theory/",
  "https://dukktapestudios.github.io/space/",
  "https://dukktapestudios.github.io/animal-tactics/",
  "https://dukktapestudios.github.io/coop-quest/",
  "https://dukktapestudios.github.io/chicken-tender/",
  "https://dukktapestudios.github.io/mech-vr/",
  "https://dukktapestudios.github.io/dnd/",
  "https://dukktapestudios.github.io/spurs/",
  "https://dukktapestudios.github.io/woodworking/",
  "https://dukktapestudios.github.io/ai-create/",
  "https://dukktapestudios.github.io/connected-systems/",
  "https://dukktapestudios.github.io/app-store-course/",
  "https://twitch.tv/dukktapetv",
  "https://www.youtube.com/@dukktapestudios",
  "https://x.com/dukktapeStudios",
  "https://github.com/dukktapestudios",
  "mailto:dukktapestudios@gmail.com"
];
required.forEach(function (url) {
  assert.ok(html.indexOf(url) !== -1, "missing " + url);
});

var guides = html.split('id="guides"')[1].split('id="tools"')[0];
var guideHrefs = [];
var guideRe = /href="([^"]+)"/g;
var guideMatch;
while ((guideMatch = guideRe.exec(guides))) guideHrefs.push(guideMatch[1]);
assert.deepStrictEqual(guideHrefs, [
  "https://dukktapestudios.github.io/woodworking/",
  "https://dukktapestudios.github.io/b2b-sales-course/",
  "https://dukktapestudios.github.io/digialex/local-ai/",
  "https://dukktapestudios.github.io/digialex/lora/",
  "https://dukktapestudios.github.io/digialex/cluster/",
  "https://dukktapestudios.github.io/landlord-guide/",
  "https://dukktapestudios.github.io/raspberry-pi/",
  "https://dukktapestudios.github.io/white-hat-crash-course/",
  "https://dukktapestudios.github.io/cyber-crash-course/",
  "https://dukktapestudios.github.io/money/",
  "https://dukktapestudios.github.io/digialex/",
  "https://dukktapestudios.github.io/usda-504/",
  "https://dukktapestudios.github.io/theory/",
  "https://dukktapestudios.github.io/connected-systems/",
  "https://dukktapestudios.github.io/app-store-course/"
], "guides keep their order and the new course is last");

assert.ok(html.indexOf('data-paths="/digialex/local-ai/ /local-ai/"') !== -1, "offline AI paths");
assert.ok(html.indexOf('data-paths="/stories/ /stories/books/rivers-run-wolf-cry/ /stories/books/random-ideas/"') !== -1, "bookshelf paths");
assert.ok(html.indexOf('data-paths="/rooster-rumble/ /rooster-rumble/cards/"') !== -1, "rooster paths");
assert.ok(html.indexOf('data-paths="/horse-cards/ /horse-cards/shop.html"') !== -1, "card shop path");

var duck = fs.readFileSync(path.join(root, "assets/studio-duck.png"));
assert.strictEqual(duck.readUInt32BE(0), 0x89504e47, "duck is a png");
assert.ok(duck.length > 1000, "duck file has pixels");

/* irl-armory is linked from the previous homepage but is not in this checkout. */
var absentOk = { "/irl-armory/": true };
required.forEach(function (url) {
  if (url.indexOf("https://dukktapestudios.github.io/") !== 0) return;
  var rel = url.slice("https://dukktapestudios.github.io".length);
  if (absentOk[rel]) return;
  var local = path.join(root, rel);
  var indexFile = path.join(local, "index.html");
  if (!fs.existsSync(indexFile) && !fs.existsSync(local)) fail("destination missing on disk: " + rel);
});

["/local-ai/", "/horse-cards/shop.html", "/rooster-rumble/cards/", "/stories/books/rivers-run-wolf-cry/", "/stories/books/random-ideas/"].forEach(function (rel) {
  var local = path.join(root, rel);
  var indexFile = rel.endsWith(".html") ? local : path.join(local, "index.html");
  assert.ok(fs.existsSync(indexFile), "counted path exists " + rel);
});

var scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
assert.ok(scripts.length >= 3, "homepage scripts");

function stubElement(id) {
  var classes = {};
  return {
    id: id,
    hidden: id === "quip",
    textContent: "",
    offsetWidth: 4,
    attrs: {},
    listeners: {},
    classList: {
      add: function (name) { classes[name] = true; },
      remove: function (name) { delete classes[name]; },
      contains: function (name) { return !!classes[name]; }
    },
    setAttribute: function (key, value) { this.attrs[key] = value; },
    getAttribute: function (key) { return this.attrs[key]; },
    addEventListener: function (type, fn) {
      this.listeners[type] = this.listeners[type] || [];
      this.listeners[type].push(fn);
    }
  };
}

function runQuips(reduce) {
  var ids = {
    "duck-btn": stubElement("duck-btn"),
    "quip": stubElement("quip"),
    "duck-hint": stubElement("duck-hint")
  };
  var sandbox = {
    document: {
      getElementById: function (id) { return ids[id] || null; }
    },
    window: {
      matchMedia: function () { return { matches: reduce }; }
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(scripts[0].replace(/^<script>/, "").replace(/<\/script>$/, ""), sandbox, { filename: "index-quips.js" });
  var btn = ids["duck-btn"];
  btn.listeners.click[0]();
  assert.strictEqual(ids.quip.hidden, false);
  assert.strictEqual(ids.quip.textContent, "You can just start.");
  assert.strictEqual(btn.attrs["aria-expanded"], "true");
  assert.strictEqual(btn.classList.contains("is-wiggling"), !reduce);
  btn.listeners.click[0]();
  assert.strictEqual(ids.quip.textContent, "It doesn't have to be pretty or perfect.");
  if (btn.listeners.animationend) btn.listeners.animationend[0]();
  assert.strictEqual(btn.classList.contains("is-wiggling"), false);
}

runQuips(false);
runQuips(true);

var store = {};
var badgeChildren = null;
var fetches = 0;
var ids = { "visitor-badge": stubElement("visitor-badge") };
ids["visitor-badge"].replaceChildren = function () {
  badgeChildren = Array.prototype.slice.call(arguments);
  this.hidden = false;
};
var sandbox = {
  document: {
    getElementById: function (id) { return ids[id] || null; },
    createElement: function () {
      return { className: "", textContent: "" };
    },
    createTextNode: function (text) { return { text: text }; }
  },
  localStorage: {
    getItem: function (key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem: function (key, value) { store[key] = String(value); },
    removeItem: function (key) { delete store[key]; }
  },
  fetch: function () { fetches += 1; return Promise.reject(new Error("offline")); },
  AbortController: function () { this.abort = function () {}; this.signal = {}; },
  setTimeout: function () { return 0; },
  clearTimeout: function () {}
};
store["dukktape-studios-visitor-number"] = "12";
vm.createContext(sandbox);
vm.runInContext(scripts[1].replace(/^<script>/, "").replace(/<\/script>$/, ""), sandbox, { filename: "index-visitors.js" });
assert.strictEqual(fetches, 0, "saved visitor does not hit the counter again");
assert.strictEqual(ids["visitor-badge"].hidden, false);
assert.strictEqual(badgeChildren[1].textContent, "12");

console.log("Homepage checks passed.");
