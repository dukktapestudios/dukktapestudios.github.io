/* Coverage and privacy checks for the Home Lab Crash Course.
   Run from the repo root: node home-lab-crash-course/page.test.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var root = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
var home = fs.readFileSync(path.join(root, "index.html"), "utf8");
var sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

assert.ok(html.indexOf("<title>Home Lab Crash Course | Dukktape Studios</title>") !== -1);
assert.ok(html.indexOf('name="viewport"') !== -1);
assert.ok(html.indexOf(":focus-visible") !== -1);
assert.ok(html.indexOf("prefers-reduced-motion: reduce") !== -1);
assert.ok(html.indexOf("--column: 740px") !== -1);
assert.ok(html.indexOf("overflow-x: auto") !== -1);
assert.ok(html.indexOf('class="skip"') !== -1);
assert.ok(html.indexOf('href="/#guides"') !== -1);
assert.ok(html.indexOf("does not describe one person's computer") !== -1);
assert.ok(html.indexOf("a typical gaming desktop (for example, a 6-core CPU with 16 GB of RAM)") !== -1);
assert.ok(html.indexOf("a gaming laptop with an 8 GB NVIDIA GPU") !== -1);
assert.ok(html.indexOf("Check your own internet connection") !== -1);
assert.ok(html.indexOf("your home or homestead") !== -1);
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
assert.ok(html.indexOf('data-diagram="homelab"') !== -1);
assert.ok((html.match(/In words/g) || []).length === 1);
assert.ok(html.indexOf("mermaid") === -1, "diagram is static HTML and CSS");
assert.ok(html.indexOf("Core i5-14500") !== -1, "example lab server stays a public example");
assert.ok(html.indexOf("RTX 3050") !== -1, "example lab GPU stays a public example");

var sections = ["what-it-is", "why-learning", "why-self-hosting", "why-automation", "why-ai", "what-you-have", "decode", "build-path", "choosing-software", "projects", "safety", "glossary", "learn-more", "feedback"];
sections.forEach(function (id) {
  assert.ok(html.indexOf('id="' + id + '"') !== -1, "missing section " + id);
});

var toc = html.split('aria-label="Contents"')[1].split("</nav>")[0];
var tocIds = [];
var tocRe = /href="#([^"]+)"/g;
var tocMatch;
while ((tocMatch = tocRe.exec(toc))) tocIds.push(tocMatch[1]);
assert.deepStrictEqual(tocIds, sections.slice(0, 13));

["panel-stage-0", "panel-stage-1", "panel-stage-2", "panel-stage-3", "panel-stage-4"].forEach(function (id) {
  assert.ok(html.indexOf('id="' + id + '"') !== -1, id);
});
assert.ok(html.indexOf('id="tab-stage-0" aria-controls="panel-stage-0" aria-selected="true"') !== -1);

var sources = [
  "https://www.proxmox.com/en/products/proxmox-virtual-environment/overview",
  "https://unraid.net/",
  "https://www.truenas.com/truenas-community-edition/",
  "https://docs.docker.com/get-started/",
  "https://www.home-assistant.io/installation/",
  "https://esphome.io/",
  "https://tailscale.com/",
  "https://pi-hole.net/",
  "https://docs.frigate.video/",
  "https://ollama.com/",
  "https://github.com/louislam/uptime-kuma",
  "https://www.reddit.com/r/homelab/",
  "https://store.ui.com/us/en/category/cloud-gateways-compact/products/ucg-ultra",
  "https://store.ui.com/us/en/products/usw-48-poe",
  "https://store.ui.com/us/en/products/u6-plus",
  "https://account.unraid.net/buy",
  "https://docs.unraid.net/unraid-os/faq/licensing-faq/",
  "https://www.home-assistant.io/green/",
  "https://www.nabucasa.com/news/2026-01-08-green-pricing-change/",
  "https://www.docker.com/pricing/",
  "https://docs.docker.com/desktop/setup/install/windows-install/",
  "https://tailscale.com/pricing",
  "https://blueirissoftware.com/",
  "https://www.cloudflare.com/plans/zero-trust-services/"
];
sources.forEach(function (url) {
  assert.ok(html.indexOf(url) !== -1, "missing source " + url);
});

var guides = home.split('id="guides"')[1].split('id="tools"')[0];
assert.ok(guides.indexOf("https://dukktapestudios.github.io/home-lab-crash-course/") !== -1);
assert.ok(sitemap.indexOf("https://dukktapestudios.github.io/home-lab-crash-course/") !== -1);

var banned = [
  /Lenovo/i,
  /\bLOQ\b/,
  /12400/,
  /13450/,
  /5050/,
  /DDR5/i,
  /this homestead/i,
  /open memory slots/i,
  /C:\\Users/i,
  /C:\\/,
  /\bAlexander\b/,
  /\bDESKTOP-/,
  /mailto:/i,
  /\b\d{3}-\d{3}-\d{4}\b/
];
banned.forEach(function (pattern) {
  assert.ok(!pattern.test(html), "privacy pattern " + pattern);
});

var emails = html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
assert.deepStrictEqual(emails, [], "no plain email addresses");
assert.strictEqual((html.match(/dukktapestudios%40gmail\.com/g) || []).length, 1, "studio donation link only");
assert.ok(!/\b\d{2,6}\s+[A-Za-z0-9.'’-]{2,}(?:\s+[A-Za-z0-9.'’-]{2,}){0,4}\s+(?:Rd|Road|St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Ln|Lane|Ct|Court|Way|Trail)\b/.test(html));
assert.ok(!/google-analytics|googletagmanager|gtag\(|plausible|umami|hotjar/i.test(html));

var script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
var tabs = ["0", "1", "2", "3", "4"].map(function (name) {
  var listeners = {};
  return {
    name: name,
    tabIndex: name === "0" ? 0 : -1,
    focused: false,
    attrs: {
      "aria-controls": "panel-stage-" + name,
      "aria-selected": name === "0" ? "true" : "false"
    },
    getAttribute: function (key) { return this.attrs[key]; },
    setAttribute: function (key, value) { this.attrs[key] = value; },
    addEventListener: function (type, fn) { listeners[type] = fn; },
    focus: function () { this.focused = true; },
    listeners: listeners
  };
});
var panels = {};
tabs.forEach(function (tab) {
  panels[tab.attrs["aria-controls"]] = { hidden: false };
});
var stageRoot = {
  className: "",
  classList: { add: function (name) { stageRoot.className += " " + name; } },
  querySelectorAll: function () { return tabs; },
  querySelector: function () {
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].attrs["aria-selected"] === "true") return tabs[i];
    }
    return null;
  }
};
var sandbox = {
  document: {
    querySelector: function () { return stageRoot; },
    getElementById: function (id) { return panels[id] || null; }
  }
};
vm.createContext(sandbox);
vm.runInContext(script, sandbox, { filename: "home-lab-stages.js" });
assert.ok(stageRoot.className.indexOf("is-ready") !== -1);
assert.strictEqual(panels["panel-stage-0"].hidden, false);
assert.strictEqual(panels["panel-stage-2"].hidden, true);
tabs[3].listeners.click();
assert.strictEqual(panels["panel-stage-3"].hidden, false);
assert.strictEqual(panels["panel-stage-0"].hidden, true);
assert.strictEqual(tabs[3].attrs["aria-selected"], "true");

console.log("Home Lab Crash Course checks passed.");
