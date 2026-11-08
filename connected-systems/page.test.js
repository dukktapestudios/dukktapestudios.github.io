/* Coverage checks for the Connected Systems Crash Course.
   Run from the repo root: node connected-systems/page.test.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

assert.ok(html.indexOf("<title>Connected Systems Crash Course | Dukktape Studios</title>") !== -1);
assert.ok(html.indexOf('name="viewport"') !== -1);
assert.ok(html.indexOf(":focus-visible") !== -1);
assert.ok(html.indexOf("prefers-reduced-motion: reduce") !== -1);
assert.ok(html.indexOf("--column: 740px") !== -1);
assert.ok(html.indexOf("overflow-x: auto") !== -1);
assert.ok(html.indexOf('class="skip"') !== -1);
assert.ok(html.indexOf("Concept designs — not live systems.") !== -1);
assert.ok(html.indexOf("hypothetical") !== -1);
assert.ok(html.indexOf("Hypothetical design only.") !== -1);
assert.ok(html.indexOf("nothing here is installed or connected") !== -1);
assert.ok(html.indexOf('{"id":7,"filename":"duck.png","status":"done","attempts":1,"thumb_path":"thumbs/7.png","error":null}') !== -1);
assert.ok(html.indexOf("GET /health") !== -1);
assert.ok(html.indexOf("POST /assets/{id}/retry") !== -1);
assert.ok(html.indexOf("Milestone 1") !== -1);
assert.ok(html.indexOf("Milestone 6") !== -1);
assert.ok(html.indexOf("MCP is a plug, not a brain.") !== -1);
assert.ok(html.indexOf("Status: Concept") !== -1);
assert.ok(html.indexOf("Links were checked and loaded on 2026-11-08.") !== -1);

var sections = ["start", "minimum", "blocks", "talk", "reliability", "ai", "where", "security", "examples", "starter", "curriculum", "monolith", "debugging", "prompts", "advanced", "references"];
assert.strictEqual(sections.length, 16);
sections.forEach(function (id) {
  assert.ok(html.indexOf('id="' + id + '"') !== -1, "missing section " + id);
});

assert.ok(!/<details[^>]*open/.test(html), "advanced reference starts collapsed");
assert.ok(html.indexOf('class="advanced"') !== -1);

var diagrams = ["shape", "webhook", "states", "content", "cards", "pngtuber", "game", "home", "starter", "quadrant"];
assert.strictEqual(diagrams.length, 10);
diagrams.forEach(function (name) {
  assert.ok(html.indexOf('data-diagram="' + name + '"') !== -1, name);
});
assert.strictEqual((html.match(/<svg /g) || []).length, 10);
assert.strictEqual((html.match(/In words/g) || []).length, 10);
assert.ok(html.indexOf("0.15, 0.2") !== -1);
assert.ok(html.indexOf("0.3, 0.35") !== -1);
assert.ok(html.indexOf("0.4, 0.6") !== -1);

["panel-content", "panel-cards", "panel-pngtuber", "panel-game", "panel-home"].forEach(function (id) {
  assert.ok(html.indexOf('id="' + id + '"') !== -1);
});
assert.ok(html.indexOf('id="tab-cards" aria-controls="panel-cards" aria-selected="true"') !== -1);

for (var session = 1; session <= 7; session++) {
  assert.ok(html.indexOf("<th scope=\"row\">" + session + "</th>") !== -1, "session " + session);
}

var sources = [
  "https://fastapi.tiangolo.com/tutorial/first-steps/",
  "https://docs.python.org/3/library/sqlite3.html",
  "https://www.sqlite.org/whentouse.html",
  "https://www.postgresql.org/docs/current/tutorial.html",
  "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
  "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events",
  "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API",
  "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps",
  "https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API",
  "https://docs.stripe.com/webhooks",
  "https://python-rq.org/",
  "https://docs.celeryq.dev/en/stable/",
  "https://platform.openai.com/docs/guides/structured-outputs",
  "https://docs.x.ai/docs/guides/function-calling",
  "https://ollama.com/",
  "https://modelcontextprotocol.io/docs/getting-started/intro",
  "https://modelcontextprotocol.io/docs/learn/architecture",
  "https://docs.n8n.io/hosting/",
  "https://help.zapier.com/hc/en-us",
  "https://help.make.com/",
  "https://supabase.com/docs/guides/database/postgres/row-level-security",
  "https://supabase.com/docs/guides/storage",
  "https://postgis.net/documentation/getting_started/",
  "https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages",
  "https://docs.github.com/en/actions",
  "https://developers.cloudflare.com/workers/",
  "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html",
  "https://docs.docker.com/get-started/",
  "https://git-scm.com/book/en/v2",
  "https://sre.google/sre-book/monitoring-distributed-systems/",
  "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html",
  "https://oauth.net/2/",
  "https://www.home-assistant.io/integrations/mqtt/",
  "https://www.home-assistant.io/docs/automation/",
  "https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/protocols/mqtt.html",
  "https://esphome.io/",
  "https://ffmpeg.org/documentation.html",
  "https://reactnative.dev/",
  "https://tauri.app/"
];
assert.strictEqual(sources.length, 39);
var refBlock = html.split('class="refs"')[1].split("</ol>")[0];
sources.forEach(function (url) {
  assert.ok(refBlock.indexOf('href="' + url + '"') !== -1, "missing source " + url);
});
assert.strictEqual((refBlock.match(/<li>/g) || []).length, 39);

assert.ok(!/<form\b/i.test(html), "no submitting form");
assert.ok(!/\bfetch\s*\(/.test(html), "no network calls");
assert.ok(html.indexOf("goatcounter") === -1);
assert.ok(html.indexOf("mermaid.min") === -1);
assert.ok(!/google-analytics|googletagmanager|gtag\(|plausible|umami|hotjar/i.test(html));
assert.ok(!/\bAlexander\b/.test(html));
assert.ok(!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(html));
assert.ok(!/\b\d{2,6}\s+[A-Za-z0-9.'’-]{2,}(?:\s+[A-Za-z0-9.'’-]{2,}){0,4}\s+(?:Rd|Road|St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Ln|Lane|Ct|Court|Way|Trail)\b/.test(html));
assert.ok(html.indexOf("<script src=") === -1, "no runtime third-party script");

var script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
var tabs = ["content", "cards", "pngtuber", "game", "home"].map(function (name) {
  var listeners = {};
  return {
    name: name,
    tabIndex: name === "cards" ? 0 : -1,
    focused: false,
    attrs: {
      "aria-controls": "panel-" + name,
      "aria-selected": name === "cards" ? "true" : "false"
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
var root = {
  className: "",
  classList: { add: function (name) { root.className += " " + name; } },
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
    querySelector: function () { return root; },
    getElementById: function (id) { return panels[id] || null; }
  }
};
vm.createContext(sandbox);
vm.runInContext(script, sandbox, { filename: "connected-systems.js" });
assert.ok(root.className.indexOf("is-ready") !== -1);
assert.strictEqual(panels["panel-cards"].hidden, false);
assert.strictEqual(panels["panel-content"].hidden, true);
assert.strictEqual(panels["panel-home"].hidden, true);
tabs[0].listeners.click();
assert.strictEqual(panels["panel-content"].hidden, false);
assert.strictEqual(panels["panel-cards"].hidden, true);
assert.strictEqual(tabs[0].attrs["aria-selected"], "true");
tabs[0].listeners.keydown({ key: "ArrowRight", preventDefault: function () {} });
assert.strictEqual(tabs[1].focused, true);
assert.strictEqual(panels["panel-cards"].hidden, false);
tabs[4].listeners.keydown({ key: "Home", preventDefault: function () {} });
assert.strictEqual(panels["panel-content"].hidden, false);

console.log("Connected Systems course checks passed.");
