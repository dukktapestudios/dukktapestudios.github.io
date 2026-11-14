/* Coverage and privacy checks for the Batching Crash Course.
   Run from the repo root: node batching-crash-course/page.test.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
var home = fs.readFileSync(path.join(root, "index.html"), "utf8");
var sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

assert.ok(html.indexOf("<title>Batching &amp; Batching Efficiency Crash Course | Dukktape Studios</title>") !== -1);
assert.ok(html.indexOf('name="viewport"') !== -1);
assert.ok(html.indexOf(":focus-visible") !== -1);
assert.ok(html.indexOf("prefers-reduced-motion: reduce") !== -1);
assert.ok(html.indexOf("--column: 740px") !== -1);
assert.ok(html.indexOf("overflow-x: auto") !== -1);
assert.ok(html.indexOf('class="skip"') !== -1);
assert.ok(html.indexOf('href="/#guides"') !== -1);
assert.ok(html.indexOf('href="#content">Back to top</a>') !== -1);
assert.ok(html.indexOf("does not describe one person’s accounts, projects, or hardware") !== -1);
assert.ok(html.indexOf("The 3–5 item “sweet spot” later in this guide is a rule of thumb, not a measured fact.") !== -1);
assert.ok(html.indexOf("torch.cuda.OutOfMemoryError: CUDA out of memory") !== -1);
assert.ok(html.indexOf("A single clean test item is cheaper than a large batch that all inherited the same bad prompt.") !== -1);
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
assert.ok((html.match(/In words/g) || []).length === 1);
assert.ok(html.indexOf("mermaid") === -1, "diagram is static HTML and CSS");
assert.strictEqual((html.match(/<script/g) || []).length, 1, "giscus is the only script");
assert.ok(html.indexOf('src="https://giscus.app/client.js"') !== -1);

var sections = ["what-it-is", "why-it-saves", "group-similar", "handle-failures", "when-to-batch", "glossary", "faq", "sources"];
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
  "https://huggingface.co/docs/diffusers/en/using-diffusers/batched_inference",
  "https://huggingface.co/docs/diffusers/en/optimization/memory",
  "https://docs.nvidia.com/deeplearning/tensorrt/latest/performance/optimization.html",
  "https://pytorch.org/blog/understanding-gpu-memory-1/",
  "https://pytorch.org/blog/activation-checkpointing-techniques/",
  "https://developers.openai.com/api/docs/guides/batch",
  "https://help.openai.com/en/articles/9197833-batch-api-faq",
  "https://platform.claude.com/docs/en/build-with-claude/batch-processing",
  "https://developers.openai.com/api/docs/guides/prompt-caching",
  "https://platform.claude.com/docs/en/build-with-claude/prompt-caching"
];
sources.forEach(function (url) {
  assert.ok(html.indexOf(url) !== -1, "missing source " + url);
});

var assets = {};
var assetRe = /\.\.\/assets\/[A-Za-z0-9._/-]+/g;
var assetMatch;
while ((assetMatch = assetRe.exec(html))) assets[assetMatch[0]] = true;
Object.keys(assets).forEach(function (rel) {
  assert.ok(fs.existsSync(path.join(root, rel.replace(/^\.\.\//, ""))), "missing asset " + rel);
});

var guides = home.split('id="guides"')[1].split('id="tools"')[0];
assert.ok(guides.indexOf("https://dukktapestudios.github.io/batching-crash-course/") !== -1);
assert.ok(sitemap.indexOf("https://dukktapestudios.github.io/batching-crash-course/") !== -1);

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

console.log("Batching Crash Course checks passed.");
