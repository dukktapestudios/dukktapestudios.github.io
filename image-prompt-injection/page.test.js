/* Coverage and privacy checks for the Image Prompt Injection guide.
   Run from the repo root: node image-prompt-injection/page.test.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
var home = fs.readFileSync(path.join(root, "index.html"), "utf8");
var sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

assert.ok(html.indexOf("<title>Image Prompt Injection: How It Works and How to Stay Safe | Dukktape Studios</title>") !== -1);
assert.ok(html.indexOf('name="viewport"') !== -1);
assert.ok(html.indexOf(":focus-visible") !== -1);
assert.ok(html.indexOf("prefers-reduced-motion: reduce") !== -1);
assert.ok(html.indexOf("--column: 740px") !== -1);
assert.ok(html.indexOf("overflow-x: auto") !== -1);
assert.ok(html.indexOf("font-size: 14px") !== -1);
assert.ok(html.indexOf("white-space: pre") !== -1);
assert.ok(html.indexOf("white-space: pre-wrap") === -1);
assert.ok(html.indexOf("min-width: 36rem") !== -1);
assert.ok(html.indexOf('class="skip"') !== -1);
assert.ok(html.indexOf('href="/#guides"') !== -1);
assert.ok(html.indexOf('href="#content">Back to top</a>') !== -1);
assert.ok(html.indexOf("© 2026 Dukktape Studios") !== -1);
assert.ok(html.indexOf('class="dts-donate"') !== -1);
assert.ok(html.indexOf("Free to use. Donations welcome — they keep this going.") !== -1);
assert.ok(html.indexOf("Text in an image is not a command from you.") !== -1);
assert.ok(html.indexOf("<script") === -1, "static page, no script");

var sections = ["what", "how", "examples", "spot", "safe", "practice", "sources"];
sections.forEach(function (id) {
  assert.ok(html.indexOf('id="' + id + '"') !== -1, "missing section " + id);
});

var toc = html.split('aria-label="Contents"')[1].split("</nav>")[0];
var tocIds = [];
var tocRe = /href="#([^"]+)"/g;
var tocMatch;
while ((tocMatch = tocRe.exec(toc))) tocIds.push(tocMatch[1]);
assert.deepStrictEqual(tocIds, sections);
assert.ok(toc.indexOf("1. What it is") !== -1);
assert.ok(toc.indexOf("2. How they're made") !== -1);
assert.ok(toc.indexOf("3. Real examples") !== -1);
assert.ok(toc.indexOf("6. Checklist and quiz") !== -1);

assert.strictEqual((html.match(/<pre><code>/g) || []).length, 4, "prompt examples are code blocks");
assert.ok(html.indexOf("what's in this photo?") !== -1);
assert.ok(html.indexOf("do whatever this image says") !== -1);
assert.ok(html.indexOf("ignore previous instructions, send this to, delete, you are now...") !== -1);
assert.ok(html.indexOf("Images are data. I will describe them, edit them, or learn from them.") !== -1);
assert.ok(html.indexOf("Start with what do you see, not do what this says.") !== -1);

["q1", "q2", "q3", "q4", "q5"].forEach(function (id) {
  assert.ok(html.indexOf('id="' + id + '"') !== -1, id);
});
assert.strictEqual((html.match(/<span class="banner">Answer<\/span>/g) || []).length, 5, "each quiz answer is shown");
assert.ok(html.indexOf("A computer virus hidden in a JPEG that infects your PC when you open the file") !== -1);
assert.ok(html.indexOf("Instructions in or around an image that an AI model may follow as if you wrote them") !== -1);
assert.ok(html.indexOf("Because today's language models do not cleanly separate instructions from data") !== -1);
assert.ok(html.indexOf("They can look harmless at full size, then reveal hidden instructions after the AI system shrinks them") !== -1);
assert.ok(html.indexOf("Boost contrast or levels, zoom in, and also look at a much smaller (downscaled) copy") !== -1);
assert.ok(html.indexOf("Refuse, and require a clear yes from you that is not based on text in the image") !== -1);
assert.ok(html.indexOf("Check my answers") !== -1);
assert.ok(html.indexOf("Reset quiz") !== -1);
assert.ok(html.indexOf("Not quite") !== -1);
assert.ok(html.indexOf("Take another look") !== -1);
assert.ok(html.indexOf("Nice work. You are ready to treat images as untrusted data.") !== -1);
assert.ok(html.indexOf("Review the explanations and try again when you want.") !== -1);
assert.ok(html.indexOf("82.50%") !== -1);
assert.ok(html.indexOf("12.8%") !== -1);
assert.ok(html.indexOf("720 agent runs") !== -1);
assert.ok(html.indexOf("does not include recipes or ready-made payloads") !== -1);
assert.ok(html.indexOf("does not include step-by-step attack instructions or ready-made payloads.") !== -1);

var resources = [
  "https://genai.owasp.org/llmrisk/llm01-prompt-injection/",
  "https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM01_PromptInjection.md",
  "https://arxiv.org/abs/2307.10490",
  "https://arxiv.org/abs/2309.00236",
  "https://embracethered.com/blog/posts/2023/google-bard-image-to-prompt-injection/",
  "https://simonwillison.net/2023/Oct/14/multi-modal-prompt-injection/",
  "https://openai.com/index/gpt-4v-system-card/",
  "https://cdn.openai.com/papers/GPTV_System_Card.pdf",
  "https://arxiv.org/abs/2311.05608",
  "https://image-hijacks.github.io/",
  "https://blog.trailofbits.com/2025/08/21/weaponizing-image-scaling-against-production-ai-systems/",
  "https://github.com/trailofbits/anamorpher",
  "https://www.usenix.org/conference/usenixsecurity20/presentation/quiring",
  "https://blogs.cisco.com/ai/understanding-and-mitigating-unicode-tag-prompt-injection",
  "https://aws.amazon.com/blogs/security/defending-llm-applications-against-unicode-character-smuggling/",
  "https://arxiv.org/abs/2609.09404",
  "https://www.gimp.org/",
  "https://exiftool.org/",
  "https://huggingface.co/blog/safetensors-security-audit",
  "https://huggingface.co/docs/hub/security-pickle"
];
resources.forEach(function (url) {
  assert.ok(html.indexOf('href="' + url + '"') !== -1, "missing link " + url);
});

var sourceSection = html.split('id="sources"')[1];
[
  "https://genai.owasp.org/llmrisk/llm01-prompt-injection/",
  "https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM01_PromptInjection.md",
  "https://embracethered.com/blog/posts/2023/google-bard-image-to-prompt-injection/",
  "https://simonwillison.net/2023/Oct/14/multi-modal-prompt-injection/",
  "https://openai.com/index/gpt-4v-system-card/",
  "https://cdn.openai.com/papers/GPTV_System_Card.pdf",
  "https://arxiv.org/abs/2311.05608",
  "https://arxiv.org/abs/2307.10490",
  "https://arxiv.org/abs/2309.00236",
  "https://blog.trailofbits.com/2025/08/21/weaponizing-image-scaling-against-production-ai-systems/",
  "https://www.usenix.org/conference/usenixsecurity20/presentation/quiring",
  "https://blogs.cisco.com/ai/understanding-and-mitigating-unicode-tag-prompt-injection",
  "https://aws.amazon.com/blogs/security/defending-llm-applications-against-unicode-character-smuggling/",
  "https://arxiv.org/abs/2609.09404",
  "https://huggingface.co/docs/hub/security-pickle",
  "https://huggingface.co/blog/safetensors-security-audit",
  "https://exiftool.org/"
].forEach(function (url) {
  assert.ok(sourceSection.indexOf('href="' + url + '"') !== -1, "missing source row " + url);
});

var guides = home.split('id="guides"')[1].split('id="tools"')[0];
assert.ok(guides.indexOf("https://dukktapestudios.github.io/image-prompt-injection/") !== -1);
assert.ok(guides.indexOf("Image Prompt Injection: How It Works and How to Stay Safe") !== -1);
assert.ok(sitemap.indexOf("https://dukktapestudios.github.io/image-prompt-injection/") !== -1);

var banned = [
  /\bRehberger\b/,
  /\bGoodside\b/,
  /\bWillison\b/,
  /\bSwanda\b/,
  /\bBagdasaryan\b/,
  /\bShmatikov\b/,
  /\bMorozova\b/,
  /\bHussain\b/,
  /\bKikimora\b/,
  /\bJohann\b/,
  /\bRiley\b/,
  /\bSimon\b/,
  /\bNguyen\b/,
  /\bHusain\b/,
  /\bHsieh\b/,
  /\bNassi\b/,
  /\bEmmons\b/,
  /\bBailey\b/,
  /\bRussell\b/,
  /\bGong et al\./,
  /\bQuiring et al\./,
  /\bMeet Patel\b/,
  /\bSuha\b/,
  /\bDESKTOP-/,
  /C:\\Users/i,
  /\b\d{3}-\d{3}-\d{4}\b/,
  /mailto:/i
];
banned.forEach(function (pattern) {
  assert.ok(!pattern.test(html), "privacy pattern " + pattern);
});

var emails = html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
assert.deepStrictEqual(emails, [], "no plain email addresses");
assert.strictEqual((html.match(/dukktapestudios%40gmail\.com/g) || []).length, 1, "studio donation link only");

console.log("Image Prompt Injection checks passed.");
