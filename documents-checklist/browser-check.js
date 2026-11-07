/* Headless browser check for the open checklist.
   Run from the repo root: node documents-checklist/browser-check.js [artifacts-dir] */
var fs = require("fs");
var http = require("http");
var os = require("os");
var path = require("path");
var child = require("child_process");

var root = path.join(__dirname, "..");
var artifacts = process.argv[2] || path.join(os.tmpdir(), "documents-checklist-artifacts");
fs.mkdirSync(artifacts, { recursive: true });

function fail(message) {
  console.error(message);
  process.exitCode = 1;
  throw new Error(message);
}

function startServer() {
  var types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2", ".png": "image/png" };
  return new Promise(function (resolve) {
    var server = http.createServer(function (req, res) {
      var urlPath = decodeURIComponent(req.url.split("?")[0]);
      if (urlPath.indexOf("..") !== -1) {
        res.writeHead(400);
        res.end();
        return;
      }
      var filePath = path.normalize(path.join(root, urlPath));
      if (filePath !== root && filePath.indexOf(root + path.sep) !== 0) {
        res.writeHead(403);
        res.end();
        return;
      }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }
      fs.readFile(filePath, function (err, data) {
        if (err) {
          res.writeHead(404);
          res.end("missing");
          return;
        }
        res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
        res.end(data);
      });
    });
    server.listen(0, "127.0.0.1", function () {
      resolve({ server: server, port: server.address().port });
    });
  });
}

function waitForJson(url) {
  return new Promise(function (resolve, reject) {
    var tries = 0;
    function once() {
      http.get(url, function (res) {
        var body = "";
        res.on("data", function (chunk) { body += chunk; });
        res.on("end", function () { resolve(body); });
      }).on("error", function () {
        tries += 1;
        if (tries > 50) reject(new Error("chrome debug port did not open"));
        else setTimeout(once, 100);
      });
    }
    once();
  });
}

function connect(wsUrl) {
  var ws = new WebSocket(wsUrl);
  var seq = 0;
  var pending = new Map();
  var listeners = [];
  return new Promise(function (resolve, reject) {
    ws.addEventListener("open", function () { resolve(api); });
    ws.addEventListener("error", function () { reject(new Error("devtools socket failed")); });
    ws.addEventListener("message", function (event) {
      var message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        var waiter = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) waiter.reject(new Error(JSON.stringify(message.error)));
        else waiter.resolve(message.result);
      } else if (message.method) {
        listeners.forEach(function (listener) { listener(message); });
      }
    });
    var api = {
      send: function (method, params) {
        var id = ++seq;
        return new Promise(function (resolveSend, rejectSend) {
          pending.set(id, { resolve: resolveSend, reject: rejectSend });
          ws.send(JSON.stringify({ id: id, method: method, params: params || {} }));
        });
      },
      close: function () { ws.close(); }
    };
  });
}

async function evaluate(client, expression) {
  var result = await client.send("Runtime.evaluate", {
    expression: expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (result.exceptionDetails) fail("page error: " + JSON.stringify(result.exceptionDetails));
  return result.result.value;
}

async function screenshot(client, file) {
  var shot = await client.send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
}

async function scrollToId(client, id) {
  var info = await evaluate(client, "(function(){var el=document.getElementById('" + id + "');document.documentElement.style.scrollBehavior='auto';var target=Math.max(0, el.getBoundingClientRect().top + window.scrollY - 12);var scroller=document.scrollingElement||document.documentElement;scroller.scrollTop=target;return {y:scroller.scrollTop,target:target,found:!!el};})()");
  if (!info || !info.found || info.target > 40 && !(info.y > 40)) {
    fail("did not scroll to " + id + " " + JSON.stringify(info));
  }
}

function writePreview() {
  var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  var css = fs.readFileSync(path.join(__dirname, "styles.css"), "utf8");
  var fonts = [
    ["nunito-latin-600.woff2", 600],
    ["nunito-latin-700.woff2", 700],
    ["nunito-latin-800.woff2", 800]
  ];
  fonts.forEach(function (pair) {
    var encoded = fs.readFileSync(path.join(root, "assets", "fonts", pair[0])).toString("base64");
    css = css.replace(
      'url("../assets/fonts/' + pair[0] + '")',
      'url("data:font/woff2;base64,' + encoded + '")'
    );
  });
  var script = fs.readFileSync(path.join(__dirname, "store.js"), "utf8") + "\n" +
    fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
  html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\n/, "");
  html = html.replace(/<link rel="preload"[^>]*>\n/, "");
  html = html.replace('<link rel="stylesheet" href="styles.css">', "<style>\n" + css + "\n.preview-banner{position:sticky;top:0;z-index:6;margin:0;padding:10px 14px;background:#3a2a08;color:#ffe7b8;border-bottom:2px solid #ffd27a;font-weight:800}</style>");
  html = html.replace("<body>", '<body>\n<p class="preview-banner" role="note">Unpublished design preview. This file is not the live site, not a private hosting link, and not a sign-in gate. The checklist is generic and fully open.</p>');
  html = html.replace('<script src="store.js"></script>\n<script src="app.js"></script>', "<script>\n" + script + "\n</script>");
  var dest = path.join(artifacts, "documents_checklist_preview.html");
  fs.writeFileSync(dest, html);
  return dest;
}

async function main() {
  var started = await startServer();
  var pageUrl = "http://127.0.0.1:" + started.port + "/documents-checklist/";
  var direct = await new Promise(function (resolve, reject) {
    http.get(pageUrl, function (res) {
      var body = "";
      res.on("data", function (chunk) { body += chunk; });
      res.on("end", function () { resolve({ status: res.statusCode, body: body }); });
    }).on("error", reject);
  });
  if (direct.status !== 200) fail("checklist URL status " + direct.status);
  ["VA", "Housing", "Tax", "Banking", "School", "Vehicles", "Identity", "Medical", "Benefits", "Crypto / security notes"].forEach(function (title) {
    if (direct.body.indexOf(title) === -1) fail("response missing " + title);
  });
  if (direct.body.indexOf("Documents Checklist") === -1) fail("response missing title");
  if (direct.body.indexOf("Yearly adult responsibilities schedule") === -1) fail("schedule missing from the page");
  ["Medications", "Five-minute money glance", "One real task from a list", "Pay bills", "Review bank and credit card statements", "Quick budget glance", "Review investments or retirement contributions", "Check insurance coverage", "Change smoke detector batteries", "Clean dryer vent", "File taxes", "Review or update will or beneficiaries", "Get a physical", "Review critical-account passwords", "Inventory important documents"].forEach(function (label) {
    if (direct.body.indexOf(label) === -1) fail("schedule missing " + label);
  });

  var userData = fs.mkdtempSync(path.join(os.tmpdir(), "docs-check-"));
  var chrome = child.spawn("google-chrome", [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--remote-debugging-port=9333",
    "--user-data-dir=" + userData,
    "--window-size=1440,900",
    "about:blank"
  ], { stdio: "ignore" });
  var client;
  try {
    await waitForJson("http://127.0.0.1:9333/json/version");
    var page = null;
    for (var attempt = 0; attempt < 30 && !page; attempt += 1) {
      var list = JSON.parse(await waitForJson("http://127.0.0.1:9333/json/list"));
      page = list.find(function (target) { return target.type === "page"; });
      if (!page) await new Promise(function (resolve) { setTimeout(resolve, 100); });
    }
    if (!page) fail("chrome did not open a page");
    client = await connect(page.webSocketDebuggerUrl);
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1440, height: 900, deviceScaleFactor: 1, mobile: false
    });
    await client.send("Page.navigate", { url: pageUrl });
    var ready = false;
    for (var i = 0; i < 40 && !ready; i += 1) {
      var state = await evaluate(client, "document.readyState + '|' + (document.getElementById('progress-label') ? document.getElementById('progress-label').textContent : '')");
      ready = String(state).indexOf("0 of 56 marked have it") !== -1;
      if (!ready) await new Promise(function (resolve) { setTimeout(resolve, 100); });
    }
    if (!ready) fail("checklist did not render immediately");
    var visible = await evaluate(client, "(function(){var headings=[].map.call(document.querySelectorAll('.packet h2'),function(node){return node.textContent.replace(/\\s+/g,' ').trim()});var password=document.querySelector('input[type=password]');var text=document.body.innerText.toLowerCase();return {headings:headings,password:!!password,sign:text.indexOf('sign in')!==-1||text.indexOf('log in')!==-1,checks:document.querySelectorAll('[data-check]').length,h1:document.querySelector('h1').textContent};})()");
    if (visible.password || visible.sign) fail("a sign-in control is on the page");
    if (visible.h1 !== "Documents Checklist") fail("unexpected title " + visible.h1);
    if (visible.checks !== 56) fail("expected 56 checks, saw " + visible.checks);
    if (visible.headings.length !== 10) fail("expected 10 visible categories");
    await screenshot(client, path.join(artifacts, "documents_checklist_desktop.png"));

    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 390, height: 844, deviceScaleFactor: 1, mobile: false
    });
    await evaluate(client, "new Promise(function(resolve){requestAnimationFrame(function(){requestAnimationFrame(resolve)})})");
    await scrollToId(client, "schedule");
    await screenshot(client, path.join(artifacts, "documents_checklist_mobile.png"));

    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1440, height: 900, deviceScaleFactor: 1, mobile: false
    });
    await evaluate(client, "(function(){var box=document.getElementById('va-dd214');box.checked=true;box.dispatchEvent(new Event('change',{bubbles:true}));var other=document.getElementById('housing-deed');other.checked=true;other.dispatchEvent(new Event('change',{bubbles:true}));var sel=document.getElementById('status-va');sel.value='partial';sel.dispatchEvent(new Event('change',{bubbles:true}));var filed=document.getElementById('status-identity');filed.value='filed';filed.dispatchEvent(new Event('change',{bubbles:true}));document.getElementById('q').value='not saved';document.getElementById('q').dispatchEvent(new Event('input',{bubbles:true}));return true;})()");
    var stored = await evaluate(client, "localStorage.getItem('dukktape-documents-checklist-v1')");
    var parsed = JSON.parse(stored);
    if (!parsed.checks["va-dd214"] || !parsed.checks["housing-deed"]) fail("checks were not saved");
    if (parsed.status.va !== "partial" || parsed.status.identity !== "filed") fail("packet status was not saved");
    if (JSON.stringify(parsed).indexOf("not saved") !== -1) fail("search text was stored");
    Object.keys(parsed).forEach(function (key) {
      if (key !== "v" && key !== "checks" && key !== "status") fail("unexpected stored key");
    });

    await client.send("Page.reload", { ignoreCache: true });
    ready = false;
    for (var j = 0; j < 40 && !ready; j += 1) {
      var again = await evaluate(client, "document.getElementById('va-dd214') && document.getElementById('va-dd214').checked && document.getElementById('status-va').value");
      ready = again === "partial";
      if (!ready) await new Promise(function (resolve) { setTimeout(resolve, 100); });
    }
    if (!ready) fail("marks did not persist across reload");
    var afterReload = await evaluate(client, "(function(){return {deed:document.getElementById('housing-deed').checked,identity:document.getElementById('status-identity').value,label:document.getElementById('progress-label').textContent,search:document.getElementById('q').value};})()");
    if (!afterReload.deed || afterReload.identity !== "filed") fail("reload lost a mark");
    if (afterReload.label !== "2 of 56 marked have it") fail("progress label " + afterReload.label);
    if (afterReload.search !== "") fail("search was restored");
    await scrollToId(client, "cat-va");
    await screenshot(client, path.join(artifacts, "documents_checklist_persisted.png"));

    await evaluate(client, "document.getElementById('q').value='emissions';document.getElementById('q').dispatchEvent(new Event('input',{bubbles:true}));");
    var filtered = await evaluate(client, "(function(){var shown=[].filter.call(document.querySelectorAll('.item'),function(item){return !item.hidden}).map(function(item){return item.getAttribute('data-item')});return shown;})()");
    if (filtered.length !== 1 || filtered[0] !== "vehicle-inspection") fail("search did not filter to the emissions item");
    await evaluate(client, "document.getElementById('clear-search').click()");

    await evaluate(client, "document.getElementById('reset').click()");
    var dialogOpen = await evaluate(client, "document.getElementById('reset-dialog').open");
    if (!dialogOpen) fail("clear confirmation did not open");
    await evaluate(client, "document.getElementById('reset-cancel').click()");
    var kept = await evaluate(client, "document.getElementById('va-dd214').checked && !document.getElementById('reset-dialog').open");
    if (!kept) fail("cancel did not keep marks");
    await evaluate(client, "document.getElementById('reset').click();document.getElementById('reset-confirm').click();");
    var cleared = await evaluate(client, "(function(){var boxes=[].every.call(document.querySelectorAll('[data-check]'),function(box){return !box.checked});var blank=[].every.call(document.querySelectorAll('[data-status-for]'),function(sel){return sel.value==='blank'});return {boxes:boxes,blank:blank,storage:localStorage.getItem('dukktape-documents-checklist-v1'),label:document.getElementById('progress-label').textContent};})()");
    if (!cleared.boxes || !cleared.blank || cleared.storage !== null) fail("clear did not reset marks");
    if (cleared.label !== "0 of 56 marked have it") fail("progress did not reset");

    var goodFile = path.join(os.tmpdir(), "documents-checklist-marks.json");
    var badFile = path.join(os.tmpdir(), "documents-checklist-bad.json");
    fs.writeFileSync(goodFile, JSON.stringify({
      v: 1,
      checks: { "school-diploma": true, "extra": true },
      status: { school: "filed", va: "blank" },
      notes: "ignore"
    }));
    fs.writeFileSync(badFile, JSON.stringify({ v: 1, checks: { "not-real": true }, status: {} }));
    await evaluate(client, "document.getElementById('va-decision').click()");
    var doc = await client.send("DOM.getDocument", { depth: 0 });
    var badNode = await client.send("DOM.querySelector", { nodeId: doc.root.nodeId, selector: "#import-file" });
    await client.send("DOM.setFileInputFiles", { nodeId: badNode.nodeId, files: [badFile] });
    await new Promise(function (resolve) { setTimeout(resolve, 200); });
    var afterBad = await evaluate(client, "(function(){return {kept:document.getElementById('va-decision').checked,note:document.getElementById('save-note').textContent};})()");
    if (!afterBad.kept || afterBad.note.indexOf("Current marks were kept") === -1) fail("bad import changed marks");
    var goodNode = await client.send("DOM.querySelector", { nodeId: doc.root.nodeId, selector: "#import-file" });
    await client.send("DOM.setFileInputFiles", { nodeId: goodNode.nodeId, files: [goodFile] });
    await new Promise(function (resolve) { setTimeout(resolve, 200); });
    var afterGood = await evaluate(client, "(function(){var raw=localStorage.getItem('dukktape-documents-checklist-v1');return {diploma:document.getElementById('school-diploma').checked,school:document.getElementById('status-school').value,decision:document.getElementById('va-decision').checked,raw:raw};})()");
    if (!afterGood.diploma || afterGood.school !== "filed" || afterGood.decision) fail("import did not apply marks");
    if (afterGood.raw.indexOf("ignore") !== -1 || afterGood.raw.indexOf("extra") !== -1) fail("import kept an extra field");

    await evaluate(client, "(function(){['day-meds','year-taxes'].forEach(function(id){var box=document.getElementById(id);box.checked=true;box.dispatchEvent(new Event('change',{bubbles:true}));});return true;})()");
    var scheduleState = await evaluate(client, "(function(){return {raw:localStorage.getItem('dukktape-documents-checklist-schedule-v1'),day:DocStore.periodToken('day', new Date()),year:DocStore.periodToken('year', new Date()),label:document.querySelector('[data-period-label=\"day\"]').textContent,count:document.querySelector('[data-period-count=\"day\"]').textContent};})()");
    var savedSchedule = JSON.parse(scheduleState.raw);
    if (savedSchedule["day-meds"] !== scheduleState.day || savedSchedule["year-taxes"] !== scheduleState.year) fail("schedule period was not saved");
    if (Object.keys(savedSchedule).length !== 2) fail("schedule stored extra fields");
    if (scheduleState.label.indexOf("Clears the next day") === -1) fail("daily period label missing");
    if (scheduleState.count !== "1 of 3 done for this period") fail("daily count " + scheduleState.count);
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1440, height: 900, deviceScaleFactor: 1, mobile: false
    });
    await scrollToId(client, "schedule");
    await screenshot(client, path.join(artifacts, "documents_checklist_schedule.png"));

    await evaluate(client, "(function(){var d=new Date();d.setDate(d.getDate()-1);var stale={'day-meds':DocStore.periodToken('day', d)};localStorage.setItem('dukktape-documents-checklist-schedule-v1', JSON.stringify(stale));return true;})()");
    await client.send("Page.reload", { ignoreCache: true });
    var staleReady = false;
    for (var s = 0; s < 40 && !staleReady; s += 1) {
      var staleState = await evaluate(client, "document.getElementById('day-meds') && document.getElementById('progress-label').textContent.indexOf('marked have it') !== -1 && !document.getElementById('day-meds').checked && (localStorage.getItem('dukktape-documents-checklist-schedule-v1') || '').indexOf('day-meds') === -1");
      staleReady = staleState === true;
      if (!staleReady) await new Promise(function (resolve) { setTimeout(resolve, 100); });
    }
    if (!staleReady) fail("a finished daily box stayed finished into the next period");

    await evaluate(client, "(function(){['day-meds','year-taxes'].forEach(function(id){var box=document.getElementById(id);box.checked=true;box.dispatchEvent(new Event('change',{bubbles:true}));});document.querySelector('[data-reset-period=\"day\"]').click();return true;})()");
    var afterGroupReset = await evaluate(client, "(function(){var raw=localStorage.getItem('dukktape-documents-checklist-schedule-v1');return {meds:document.getElementById('day-meds').checked,taxes:document.getElementById('year-taxes').checked,raw:raw};})()");
    if (afterGroupReset.meds || !afterGroupReset.taxes) fail("group reset cleared the wrong period");
    if (afterGroupReset.raw.indexOf("day-meds") !== -1) fail("daily stamp remained after reset");

    await evaluate(client, "document.getElementById('reset').click();document.getElementById('reset-confirm').click();");
    var scheduleCleared = await evaluate(client, "(function(){var open=[].some.call(document.querySelectorAll('[data-schedule]'),function(box){return box.checked});return {open:open,schedule:localStorage.getItem('dukktape-documents-checklist-schedule-v1'),docs:localStorage.getItem('dukktape-documents-checklist-v1')};})()");
    if (scheduleCleared.open || scheduleCleared.schedule !== null || scheduleCleared.docs !== null) fail("clear did not remove schedule marks");

    var preview = writePreview();
    console.log("Browser checks passed.");
    console.log(preview);
  } finally {
    if (client) client.close();
    chrome.kill("SIGKILL");
    started.server.close();
  }
}

main().catch(function (err) {
  console.error(err && err.stack ? err.stack : err);
  process.exitCode = 1;
});
