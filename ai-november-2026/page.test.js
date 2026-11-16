/* Coverage and privacy checks for the November 2026 AI beginner's guide.
   Run from the repo root: node ai-november-2026/page.test.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
var home = fs.readFileSync(path.join(root, "index.html"), "utf8");
var sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

assert.ok(html.indexOf("<title>AI in November 2026: a beginner's guide to what it can do | Dukktape Studios</title>") !== -1);
assert.ok(html.indexOf('name="viewport"') !== -1);
assert.ok(html.indexOf(":focus-visible") !== -1);
assert.ok(html.indexOf("prefers-reduced-motion: reduce") !== -1);
assert.ok(html.indexOf("--column: 740px") !== -1);
assert.ok(html.indexOf("overflow-x: auto") !== -1);
assert.ok(html.indexOf('class="skip"') !== -1);
assert.ok(html.indexOf('href="/#guides"') !== -1);
assert.ok(html.indexOf('href="#content">Back to top</a>') !== -1);
assert.ok(html.indexOf("Guide · Checked on November 15, 2026") !== -1);
assert.ok(html.indexOf("A plain-English look at what AI can and can't do, what people use it for, who makes the main tools, and how to start learning safely.") !== -1);
assert.ok(html.indexOf("20 questions to keep learning") !== -1);
assert.ok(html.indexOf("A simple 7-day learning path") !== -1);
assert.ok(html.indexOf("Claude Fable 5.2, a model from Anthropic, released November 9, 2026.") !== -1);
assert.ok(html.indexOf("Nothing here is legal, medical, tax or financial advice.") !== -1);
assert.ok(html.indexOf("Prices are what I found on official pages on November 15, 2026.") !== -1);
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

var sections = ["can-and-cant", "uses", "words", "companies", "tools", "fable", "staying-safe", "questions", "hype", "learning-path", "could-not-confirm", "sources"];
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
  "https://www.anthropic.com/claude-fable-and-mythos-5-2",
  "https://platform.claude.com/docs/en/models/fable-5-2/overview",
  "https://claude.com/pricing",
  "https://claude.com/resources/articles/using-claude-opus-5-5-as-your-daily-driver-for-knowledge-work",
  "https://x.ai/pricing",
  "https://docs.x.ai/developers/release-notes",
  "https://x.ai/news/introducing-grok-bot",
  "https://chatgpt.com/pricing/",
  "https://help.openai.com/en/articles/9624314-model-release-notes",
  "https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation",
  "https://gemini.google/subscriptions/",
  "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/",
  "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/",
  "https://research.meta.ai/blog/muse-ember",
  "https://research.meta.ai/blog/muse-spark-open",
  "https://www.microsoft.com/en-us/copilot/pricing/individuals",
  "https://www.microsoft.com/en-us/copilot/pricing/business",
  "https://mistral.ai/pricing/",
  "https://api-docs.deepseek.com/quick_start/pricing/",
  "https://support.apple.com/en-us/127893",
  "https://www.amazon.com/Meet-the-new-Alexa/dp/B0DCCNHWV5",
  "https://www.perplexity.ai/help-center/en/articles/11680686-perplexity-max",
  "https://frontierlog.ai/x-vibe/claude-fable-5-2",
  "https://www.ridgebench.com/news/halfweek-opinion-1112",
  "https://imagebattle.ai/leaderboard/",
  "https://www.creativebloq.com/features/so-what-are-the-best-ai-video-generators-and-how-do-they-compare-on-price",
  "https://paradev.com/compare/best-coding-agents",
  "https://refusalrate.com/best-local-llm"
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
assert.ok(guides.indexOf("https://dukktapestudios.github.io/ai-november-2026/") !== -1);
assert.ok(guides.indexOf("AI in November 2026: a beginner's guide") !== -1);
assert.ok(guides.indexOf("A plain-English look at what AI can and can't do, the main companies and tools, 20 starter prompts, and a 7-day learning path. Checked on November 15, 2026.") !== -1);
assert.ok(sitemap.indexOf("https://dukktapestudios.github.io/ai-november-2026/") !== -1);

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

console.log("November 2026 AI guide checks passed.");
