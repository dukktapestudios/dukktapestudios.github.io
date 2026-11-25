/* Coverage and privacy checks for the library-style private home computer guide.
   Run from the repo root: node library-style-private-computer/page.test.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
var home = fs.readFileSync(path.join(root, "index.html"), "utf8");
var sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

assert.ok(html.indexOf("<title>Library-Style Private Home Computer | Dukktape Studios</title>") !== -1);
assert.ok(html.indexOf('name="viewport"') !== -1);
assert.ok(html.indexOf(":focus-visible") !== -1);
assert.ok(html.indexOf("prefers-reduced-motion: reduce") !== -1);
assert.ok(html.indexOf("--column: 740px") !== -1);
assert.ok(html.indexOf("overflow-x: auto") !== -1);
assert.ok(html.indexOf('class="skip"') !== -1);
assert.ok(html.indexOf('href="/#guides"') !== -1);
assert.ok(html.indexOf('href="#content">Back to top</a>') !== -1);
assert.ok(html.indexOf("Official material checked November 25, 2026.") !== -1);
assert.ok(html.indexOf("A gentle, step-by-step guide to reboot-to-restore, privacy-focused browsers, and the limits that still matter.") !== -1);
assert.ok(html.indexOf("A fresh start is useful. It is not invisibility.") !== -1);
assert.ok(html.indexOf("Reboot Restore Rx Freeware has been retired.") !== -1);
assert.ok(html.indexOf("You do not need all three.") !== -1);
assert.ok(html.indexOf("Choose Tor or a VPN for the IP-address job") !== -1);
assert.ok(html.indexOf("No perfect anonymity") !== -1);
assert.ok(html.indexOf("A learning guide.") !== -1);
assert.ok(html.indexOf("© 2026 Dukktape Studios") !== -1);
assert.ok(html.indexOf('class="dts-donate"') !== -1);
assert.ok(html.indexOf("Free to use. Donations welcome — they keep this going.") !== -1);
assert.ok(html.indexOf("mermaid") === -1, "no diagram library");
assert.strictEqual((html.match(/<script/g) || []).length, 1, "the checklist is the only script");
assert.ok(html.indexOf("giscus.app") === -1, "no comment widget");
assert.ok(html.indexOf('data-key="dts:library-private-pc:checklist:v1"') !== -1);
assert.strictEqual((html.match(/class="callout remember"/g) || []).length, 6, "Remember boxes stay on the steps that need them");
assert.strictEqual((html.match(/class="callout danger"/g) || []).length, 5, "warning callouts stay in place");
assert.strictEqual((html.match(/type="checkbox"/g) || []).length, 14, "one checkbox per checklist item");

var sections = ["why", "local-user", "restore", "browsers", "network", "windows-privacy", "habits", "limits", "checklist", "sources"];
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
  "https://support.microsoft.com/en-us/windows/security/identity-signin/manage-user-accounts-in-windows",
  "https://support.microsoft.com/en-us/windows/install-windows-updates-3c5ae7fc-9fb6-9af1-1984-b5e0412c556a",
  "https://support.microsoft.com/en-us/windows/privacy/diagnostics-feedback-and-privacy-in-windows",
  "https://support.microsoft.com/en-us/windows/privacy/general-privacy-settings-in-windows",
  "https://support.microsoft.com/en-us/windows/privacy/windows-location-service-and-privacy",
  "https://support.microsoft.com/en-us/windows/privacy/windows-activity-history-and-your-privacy",
  "https://horizondatasys.com/reboot-restore-rx-freeware/",
  "https://horizondatasys.com/reboot-restore-standard/",
  "https://horizondatasys.com/create-a-quote/",
  "https://support.horizondatasys.com/knowledge-base/how-to-install-new-software-perform-patch-management",
  "https://support.horizondatasys.com/knowledge-base/how-to-manually-set-a-new-baseline",
  "https://support.horizondatasys.com/knowledge-base/hard-disk-is-encrypted.-setup-cannot-continue-message",
  "https://www.faronics.com/products/deep-freeze/standard",
  "https://www.faronics.com/assets/DFS_Manual.pdf",
  "https://support.faronics.com/help/en-ca/29-deep-freeze-windows/103-how-do-i-enable-or-disable-deep-freeze",
  "https://mullvad.net/en/browser",
  "https://mullvad.net/en/help/install-mullvad-browser",
  "https://mullvad.net/en/browser/hard-facts",
  "https://mullvad.net/en/vpn/what-is-vpn",
  "https://support.torproject.org/tor-browser/getting-started/installing/",
  "https://support.torproject.org/tor-browser/getting-started/downloading/",
  "https://support.torproject.org/tor-browser/getting-started/first-launch/",
  "https://support.torproject.org/tor-browser/getting-started/updating/",
  "https://support.torproject.org/tor-browser/features/fingerprinting-protections/",
  "https://support.torproject.org/tor-browser/features/security-levels/",
  "https://support.torproject.org/tor-browser/features/plugins/",
  "https://support.torproject.org/tor-browser/features/managing-identities/",
  "https://support.torproject.org/tor-browser/security/using-tb-safely/",
  "https://support.torproject.org/tor-browser/general/vpn-with-tor/",
  "https://support.torproject.org/tor-browser/general/tor-browser-speed/",
  "https://support.torproject.org/tor-browser/general/website-blocking-tor-exits/",
  "https://brave.com/download/",
  "https://brave.com/shields/",
  "https://support.brave.app/hc/en-us/articles/360023646212-How-do-I-configure-global-and-site-specific-Shields-settings",
  "https://brave.com/privacy-updates/28-sunsetting-strict-fingerprinting-mode/",
  "https://support.brave.app/hc/en-us/articles/38305898674957-How-do-I-hide-or-disable-features-in-Brave",
  "https://support.brave.app/hc/en-us/articles/360018121491-What-is-a-Private-Window-with-Tor-Connectivity",
  "https://coveryourtracks.eff.org/learn"
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
assert.ok(guides.indexOf("https://dukktapestudios.github.io/library-style-private-computer/") !== -1);
assert.ok(guides.indexOf("Library-Style Private Home Computer") !== -1);
assert.ok(guides.indexOf("A gentle Windows 11 crash course for a clean-on-restart browsing PC: a separate local user, reboot-to-restore, privacy browsers, Tor or a VPN, Windows privacy settings and an honest list of limits.") !== -1);
assert.ok(sitemap.indexOf("https://dukktapestudios.github.io/library-style-private-computer/") !== -1);

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

console.log("Library-style private home computer guide checks passed.");
