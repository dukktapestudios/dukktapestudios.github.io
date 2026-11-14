/* Coverage and privacy checks for the Raspberry Pi Home Server Crash Course.
   Run from the repo root: node raspberry-pi-home-server-crash-course/page.test.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
var home = fs.readFileSync(path.join(root, "index.html"), "utf8");
var sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

assert.ok(html.indexOf("<title>Raspberry Pi Home Server Crash Course | Dukktape Studios</title>") !== -1);
assert.ok(html.indexOf('name="viewport"') !== -1);
assert.ok(html.indexOf(":focus-visible") !== -1);
assert.ok(html.indexOf("prefers-reduced-motion: reduce") !== -1);
assert.ok(html.indexOf("--column: 740px") !== -1);
assert.ok(html.indexOf("overflow-x: auto") !== -1);
assert.ok(html.indexOf("white-space: pre") !== -1);
assert.ok(html.indexOf('class="skip"') !== -1);
assert.ok(html.indexOf('href="/#guides"') !== -1);
assert.ok(html.indexOf('href="#content">Back to top</a>') !== -1);
assert.ok(html.indexOf("Every name, address, and password here is a placeholder") !== -1);
assert.ok(html.indexOf("All names, addresses, and tokens are placeholders.") !== -1);
assert.ok(html.indexOf("Do not put your real name or email in it.") !== -1);
assert.ok(html.indexOf("ssh youruser@homeserver.local") !== -1);
assert.ok(html.indexOf("ssh youruser@newname.local") !== -1);
assert.ok(html.indexOf("192.168.1.50") !== -1);
assert.ok(html.indexOf("example.com") !== -1);
assert.ok(html.indexOf("YOURSUBDOMAIN") !== -1);
assert.ok(html.indexOf("YOUR-TOKEN") !== -1);
assert.ok(html.indexOf("&lt;h1&gt;Hello from my Pi&lt;/h1&gt;") !== -1);
assert.ok(html.indexOf("<h1>Hello from my Pi") === -1);
assert.ok(html.indexOf("Do not forward port 22.") !== -1);
assert.ok(html.indexOf("Host only content you own or have the rights to share.") !== -1);
assert.ok(html.indexOf("Never run these commands on <code>mmcblk0</code>.") !== -1);
assert.ok(html.indexOf("The HAT+ takes a 2230 or 2242 NVMe SSD.") !== -1);
assert.ok(html.indexOf("$158.85") !== -1);
assert.ok(html.indexOf('href="/home-lab-crash-course/"') !== -1);
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
assert.strictEqual((html.match(/<script/g) || []).length, 1, "giscus is the only script");
assert.ok(html.indexOf('src="https://giscus.app/client.js"') !== -1);
assert.ok((html.match(/<pre><code>/g) || []).length >= 30, "command blocks are present");

var sections = ["what-it-can-do", "the-kit", "stage-1", "stage-2", "stage-3", "stage-4", "stage-5", "rights", "troubleshooting", "sources"];
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
  "https://www.raspberrypi.com/documentation/computers/getting-started.html#install",
  "https://www.raspberrypi.com/documentation/computers/getting-started.html#power-supply",
  "https://www.raspberrypi.com/documentation/computers/remote-access.html#ssh",
  "https://www.raspberrypi.com/documentation/computers/configuration.html",
  "https://www.raspberrypi.com/documentation/security/operational-security.html",
  "https://www.raspberrypi.com/documentation/security/ufw.html",
  "https://www.raspberrypi.com/documentation/accessories/m2-hat-plus.html",
  "https://www.raspberrypi.com/products/raspberry-pi-5-case/",
  "https://www.raspberrypi.com/software/",
  "https://www.canakit.com/",
  "https://caddyserver.com/docs/install",
  "https://caddyserver.com/docs/running",
  "https://caddyserver.com/docs/automatic-https",
  "https://caddyserver.com/docs/caddyfile/directives/file_server",
  "https://www.duckdns.org/install.jsp",
  "https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-remote-tunnel/",
  "https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/",
  "https://developers.cloudflare.com/fundamentals/reference/policies-compliances/delivering-videos-with-cloudflare/",
  "https://developers.cloudflare.com/fundamentals/manage-domains/add-site/",
  "https://www.rfc-editor.org/rfc/rfc6598",
  "https://manpages.debian.org/trixie/openssh-server/sshd_config.5.en.html",
  "https://wiki.debian.org/UnattendedUpgrades",
  "https://manpages.debian.org/trixie/ufw/ufw.8.en.html",
  "https://docs.github.com/en/pages"
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
assert.ok(fs.existsSync(path.join(root, "home-lab-crash-course/index.html")), "home lab link target");

var guides = home.split('id="guides"')[1].split('id="tools"')[0];
assert.ok(guides.indexOf("https://dukktapestudios.github.io/raspberry-pi-home-server-crash-course/") !== -1);
assert.ok(sitemap.indexOf("https://dukktapestudios.github.io/raspberry-pi-home-server-crash-course/") !== -1);

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
var unique = emails.filter(function (email, index) { return emails.indexOf(email) === index; }).sort();
assert.deepStrictEqual(unique, ["youruser@homeserver.local", "youruser@newname.local"]);
assert.strictEqual((html.match(/dukktapestudios%40gmail\.com/g) || []).length, 1, "studio donation link only");
assert.ok(!/google-analytics|googletagmanager|gtag\(|plausible|umami|hotjar/i.test(html));

console.log("Raspberry Pi Home Server Crash Course checks passed.");
