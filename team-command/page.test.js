/* Behavior checks for the standalone Team Command page.
   Run from the repo root: node team-command/page.test.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var htmlPath = path.join(__dirname, "index.html");
var html = fs.readFileSync(htmlPath, "utf8");

function fail(message) {
  throw new Error(message);
}

assert.ok(html.indexOf("<title>Team Command</title>") !== -1, "title");
assert.ok(html.indexOf('name="viewport"') !== -1, "viewport");
assert.ok(html.indexOf("It is not AI reasoning.") !== -1, "honest template disclaimer");
assert.ok(html.indexOf("Works offline; no network, no tracking.") !== -1, "offline notice");
assert.ok(html.indexOf("flex-wrap:wrap") !== -1, "wraps on narrow screens");
assert.ok(html.indexOf("minmax(250px,1fr)") !== -1, "role grid reflows");
assert.ok(!/innerHTML|insertAdjacentHTML|document\.write|eval\(|fetch\(|XMLHttpRequest|WebSocket|new\s+Worker/.test(html), "no html injection or network APIs");
assert.ok(!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(html), "no email address");
assert.ok(!/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(html), "no phone number");
assert.ok(!/\b\d{2,6}\s+[A-Za-z0-9.'’-]{2,}(?:\s+[A-Za-z0-9.'’-]{2,}){0,4}\s+(?:Rd|Road|St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Ln|Lane|Ct|Court|Way|Trail)\b/.test(html), "no street address");

var scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);
if (!scriptMatch) fail("page script missing");

function Element(tag) {
  this.tag = tag;
  this.attrs = {};
  this.children = [];
  this.value = "";
  this.checked = false;
  this.disabled = false;
  this.hidden = false;
  this.id = "";
  this.listeners = {};
  this.parent = null;
  this._text = null;
}
Element.prototype.setAttribute = function (key, value) {
  this.attrs[key] = String(value);
  if (key === "id") {
    this.id = String(value);
    ids[this.id] = this;
  }
};
Element.prototype.append = function () {
  for (var i = 0; i < arguments.length; i++) {
    var node = arguments[i];
    node.parent = this;
    this.children.push(node);
  }
};
Element.prototype.replaceChildren = function () {
  this.children = [];
  this.append.apply(this, arguments);
};
Element.prototype.addEventListener = function (type, fn) {
  this.listeners[type] = fn;
};
Element.prototype.click = function () {
  if (this.onclick) this.onclick();
};
Element.prototype.remove = function () {
  if (!this.parent) return;
  var index = this.parent.children.indexOf(this);
  if (index >= 0) this.parent.children.splice(index, 1);
  this.parent = null;
};
Object.defineProperty(Element.prototype, "textContent", {
  get: function () {
    if (this._text != null) return this._text;
    return this.children.map(function (child) {
      return child.textContent != null ? child.textContent : "";
    }).join("");
  },
  set: function (value) {
    this._text = String(value);
    this.children = [];
  }
});

function TextNode(text) {
  this.textContent = String(text);
  this.children = [];
  this.parent = null;
}

var ids = {};
function seed(tag, id) {
  var el = new Element(tag);
  el.id = id;
  el.attrs.id = id;
  ids[id] = el;
  return el;
}

var body = new Element("body");
["store", "goal", "gen", "copyP", "org", "warns", "plan", "noplan", "roles", "add", "exp", "imp", "reset"].forEach(function (id) {
  body.append(seed(id === "plan" ? "tbody" : "div", id));
});

var storage = {};
var alerts = [];
var confirms = [];
var copied = "";
var downloads = [];
var confirmAnswer = true;

var sandbox = {
  document: {
    body: body,
    getElementById: function (id) { return ids[id] || null; },
    createElement: function (tag) { return new Element(tag); },
    createTextNode: function (text) { return new TextNode(text); }
  },
  localStorage: {
    getItem: function (key) { return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null; },
    setItem: function (key, value) { storage[key] = String(value); }
  },
  alert: function (message) { alerts.push(String(message)); },
  confirm: function (message) { confirms.push(String(message)); return confirmAnswer; },
  navigator: {
    clipboard: {
      writeText: function (text) {
        copied = String(text);
        return Promise.resolve();
      }
    }
  },
  FileReader: function FileReader() {},
  Blob: Blob,
  URL: {
    createObjectURL: function (blob) {
      downloads.push(blob);
      return "blob:team-command-test";
    }
  },
  module: { exports: {} },
  console: console,
  JSON: JSON,
  Date: Date,
  Set: Set,
  Promise: Promise
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.FileReader.prototype.readAsText = function (file) {
  this.result = file.text;
  if (this.onload) this.onload();
};

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox, { filename: "team-command/index.html" });
var api = sandbox.module.exports;

var defaults = api.DEF();
assert.strictEqual(defaults.goal, "");
assert.strictEqual(defaults.plan.length, 0);
assert.strictEqual(defaults.roles.length, 6);
defaults.roles.forEach(function (role) {
  assert.strictEqual(role.human, "", role.name + " default owner stays blank");
  assert.ok(role.name.indexOf("@") === -1);
});
assert.deepStrictEqual(Array.prototype.map.call(defaults.roles, function (role) { return String(role.name); }), [
  "Project / Delivery Lead",
  "Research / Community Needs",
  "Build / Technical / Field",
  "Outreach / Partnerships",
  "Operations / Resources",
  "Quality / Safety Review"
]);

function strongs(root) {
  var found = [];
  function walk(node) {
    if (!node || !node.tag) return;
    if (node.tag === "strong") found.push(node.textContent);
    node.children.forEach(walk);
  }
  walk(root);
  return found;
}

var orgNames = strongs(ids.org);
assert.deepStrictEqual(orgNames.slice(0, 2).map(String), ["You", "CODY"], "You and CODY stay on top");
assert.ok(orgNames.indexOf("Project / Delivery Lead") > 1);

ids.goal.value = "";
ids.gen.click();
assert.ok(alerts.indexOf("Enter a goal first.") !== -1);

ids.goal.value = "budget money for a community survey and build a prototype";
ids.gen.click();
var plan = api.S.plan;
assert.strictEqual(plan.length, 6);
function roleName(id) {
  var role = api.S.roles.find(function (item) { return item.id === id; });
  return role ? role.name : "";
}
assert.strictEqual(roleName(plan.find(function (row) { return row.stage === "plan"; }).role), "Operations / Resources");
assert.strictEqual(roleName(plan.find(function (row) { return row.stage === "research"; }).role), "Research / Community Needs");
assert.strictEqual(roleName(plan.find(function (row) { return row.stage === "build"; }).role), "Build / Technical / Field");
assert.ok(plan.every(function (row) { return row.task.indexOf(ids.goal.value) !== -1; }));
var warnText = ids.warns.textContent;
assert.ok(warnText.indexOf("Goal mentions money") !== -1, warnText);
assert.ok(warnText.indexOf("qualified professional") !== -1, warnText);

var saved = JSON.parse(storage["teamCommand.v1"]);
assert.strictEqual(saved.goal, ids.goal.value);
assert.strictEqual(saved.plan.length, 6);

var nameInput = ids.fr1name;
assert.ok(nameInput, "role name field");
nameInput.value = "Delivery Editor";
nameInput.listeners.change();
assert.strictEqual(api.S.roles[0].name, "Delivery Editor");
assert.ok(strongs(ids.org).indexOf("Delivery Editor") !== -1);
assert.strictEqual(JSON.parse(storage["teamCommand.v1"]).roles[0].name, "Delivery Editor");

var buildCard = ids.roles.children[2];
var disable = buildCard.children.filter(function (node) { return node.tag === "div" && node.attrs.class === "row"; })[0].children[0];
assert.strictEqual(disable.textContent, "Disable");
disable.click();
assert.strictEqual(api.S.roles[2].on, false);
var buildNode = ids.org.children[1].children[2];
assert.ok(buildNode.attrs.class.indexOf("off") !== -1, "disabled role is marked off");

ids.goal.value = "install a field prototype";
confirmAnswer = true;
ids.gen.click();
assert.ok(ids.warns.textContent.indexOf('No active role covers "build"') !== -1, ids.warns.textContent);
var buildRow = api.S.plan.find(function (row) { return row.stage === "build"; });
assert.strictEqual(buildRow.role, "");
var planText = ids.plan.textContent;
assert.ok(planText.indexOf("Missing capability / owner") !== -1, planText);

ids.exp.click();
assert.strictEqual(downloads.length, 1);

var evil = {
  goal: "<img src=x onerror=\"alert(1)\">",
  roles: [{
    id: "rx",
    name: "<script>alert(1)</script>",
    stage: ["build", "drop-table"],
    caps: "build <img src=x onerror=alert(1)>",
    human: "<svg/onload=alert(1)>",
    ai: "helper",
    on: true,
    extra: "<iframe src=javascript:alert(1)>"
  }],
  plan: [{
    stage: "build",
    task: "<iframe src=javascript:alert(1)>",
    role: "rx",
    out: "safe",
    dep: "plan"
  }]
};
var beforeAlerts = alerts.length;
ids.imp.files = [{ size: 120, text: JSON.stringify(evil) }];
ids.imp.onchange({ target: ids.imp });
assert.strictEqual(api.S.goal, evil.goal);
assert.strictEqual(api.S.roles[0].name, evil.roles[0].name);
assert.deepStrictEqual(Array.from(api.S.roles[0].stage, String), ["build"]);
assert.strictEqual(api.S.roles[0].extra, undefined);
assert.strictEqual(strongs(ids.org).indexOf("<script>alert(1)</script>") > 1, true);
function countTags(node, tag, acc) {
  if (!node || !node.tag) return acc;
  if (node.tag === tag) acc.push(node);
  node.children.forEach(function (child) { countTags(child, tag, acc); });
  return acc;
}
assert.strictEqual(countTags(ids.org, "script", []).length, 0);
assert.strictEqual(countTags(ids.roles, "script", []).length, 0);
assert.strictEqual(countTags(body, "iframe", []).length, 0);
assert.strictEqual(countTags(body, "img", []).length, 0);
assert.strictEqual(alerts.length, beforeAlerts, "import did not execute a script alert");

ids.imp.files = [{ size: 20, text: "{not json" }];
ids.imp.onchange({ target: ids.imp });
assert.ok(alerts[alerts.length - 1].indexOf("Not a valid") !== -1);
assert.strictEqual(api.S.roles[0].name, evil.roles[0].name);

ids.imp.files = [{ size: 1000001, text: "{}" }];
ids.imp.onchange({ target: ids.imp });
assert.ok(alerts[alerts.length - 1].indexOf("too large") !== -1);

ids.reset.click();
assert.strictEqual(api.S.goal, "");
assert.strictEqual(api.S.roles[0].name, "Project / Delivery Lead");
assert.strictEqual(api.S.roles[0].human, "");
assert.strictEqual(api.S.plan.length, 0);
assert.ok(storage["teamCommand.v1"].indexOf("<script>") === -1);

var exportedText = "";
downloads[0].text().then(function (text) {
  exportedText = text;
  var exported = JSON.parse(text);
  assert.strictEqual(exported.roles[0].name, "Delivery Editor");
  assert.strictEqual(exported.roles[2].on, false);
  assert.ok(exportedText.indexOf("Delivery Editor") !== -1);
  console.log("team-command page tests passed");
}).catch(function (error) {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
