/* Coverage and privacy checks for the AI Crash Course.
   Run from the repo root: node ai-crash-course/page.test.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
var home = fs.readFileSync(path.join(root, "index.html"), "utf8");
var sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

assert.ok(html.indexOf("<title>AI Crash Course | Dukktape Studios</title>") !== -1);
assert.ok(html.indexOf('name="viewport"') !== -1);
assert.ok(html.indexOf(":focus-visible") !== -1);
assert.ok(html.indexOf("prefers-reduced-motion: reduce") !== -1);
assert.ok(html.indexOf("--column: 740px") !== -1);
assert.ok(html.indexOf("overflow-x: auto") !== -1);
assert.ok(html.indexOf('class="skip"') !== -1);
assert.ok(html.indexOf('href="/#guides"') !== -1);
assert.ok(html.indexOf("does not describe one person's computer") !== -1);
assert.ok(html.indexOf("a typical gaming PC (for example, an 8 GB GPU)") !== -1);
assert.ok(html.indexOf("Feedback &amp; Suggestions") !== -1);
assert.ok(html.indexOf("© 2026 Dukktape Studios") !== -1);
assert.ok(html.indexOf('data-repo="dukktapestudios/dukktapestudios.github.io"') !== -1);
assert.ok(html.indexOf('data-repo-id="R_kgDOVcgvLw"') !== -1);
assert.ok(html.indexOf('data-category="General"') !== -1);
assert.ok(html.indexOf('data-category-id="DIC_kwDOVcgvL84DKFnn"') !== -1);
assert.ok(html.indexOf('data-mapping="pathname"') !== -1);
assert.ok(html.indexOf('class="dts-donate"') !== -1);
assert.ok(html.indexOf("Free to use. Donations welcome — they keep this going.") !== -1);
assert.ok(html.indexOf("data-diagram=\"training\"") !== -1);
assert.ok(html.indexOf("data-diagram=\"cody-loop\"") !== -1);
assert.ok(html.indexOf("Cody speaks, and the screen updates") !== -1);
assert.ok((html.match(/In words/g) || []).length === 2);
assert.ok(html.indexOf("mermaid") === -1, "diagrams are static HTML and CSS");

var sections = ["welcome", "what-is-ai", "chat-assistants", "types", "local-vs-cloud", "hardware", "costs", "prompting", "connect", "safety", "limits", "copyright", "ethics", "earning", "key-terms", "mistakes", "habits", "learning-path", "glossary", "feedback"];
sections.forEach(function (id) {
  assert.ok(html.indexOf('id="' + id + '"') !== -1, "missing section " + id);
});

var toc = html.split('aria-label="Contents"')[1].split("</nav>")[0];
var tocIds = [];
var tocRe = /href="#([^"]+)"/g;
var tocMatch;
while ((tocMatch = tocRe.exec(toc))) tocIds.push(tocMatch[1]);
assert.deepStrictEqual(tocIds, sections.slice(0, 19));

var sources = [
  "https://www.elementsofai.com/",
  "https://developers.google.com/machine-learning/crash-course",
  "https://course.fast.ai/",
  "https://huggingface.co/learn/llm-course/chapter1/1",
  "https://docs.ollama.com/",
  "https://docs.ollama.com/quickstart",
  "https://docs.ollama.com/api/introduction",
  "https://docs.python.org/3/tutorial/",
  "https://docs.arduino.cc/learn/",
  "https://docs.espressif.com/projects/arduino-esp32/en/latest/getting_started.html",
  "https://github.com/openai/whisper",
  "https://github.com/rhasspy/piper",
  "https://www.copyright.gov/ai/",
  "https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf",
  "https://reportfraud.ftc.gov/"
];
sources.forEach(function (url) {
  assert.ok(html.indexOf(url) !== -1, "missing source " + url);
});

var guides = home.split('id="guides"')[1].split('id="tools"')[0];
assert.ok(guides.indexOf("https://dukktapestudios.github.io/ai-crash-course/") !== -1);
assert.ok(sitemap.indexOf("https://dukktapestudios.github.io/ai-crash-course/") !== -1);

var banned = [
  /your pc/i,
  /your gpu/i,
  /your machine/i,
  /your card/i,
  /your hardware/i,
  /your windows/i,
  /\bRTX\b/i,
  /\b4060\b/,
  /C:\\Users/i,
  /C:\\/,
  /\bAlexander\b/,
  /\bDESKTOP-/,
  /\b\d{3}-\d{3}-\d{4}\b/,
  /mailto:/i
];
banned.forEach(function (pattern) {
  assert.ok(!pattern.test(html), "privacy pattern " + pattern);
});

var emails = html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
assert.deepStrictEqual(emails, [], "no plain email addresses");
assert.strictEqual((html.match(/dukktapestudios%40gmail\.com/g) || []).length, 1, "studio donation link only");
assert.ok(html.indexOf("Cody") !== -1, "example character name stays");

console.log("AI Crash Course checks passed.");
