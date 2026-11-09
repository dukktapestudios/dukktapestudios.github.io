(function () {
  var W = window.OneSmallWin;
  var WIN_KEY = "dukktape-app-store-course-v1-wins";
  var CHECK_KEY = "dukktape-app-store-course-v1-checks";
  var NOTE_KEY = "dukktape-app-store-course-v1-notes";

  function storage() {
    try {
      var probe = "__dukktape_probe__";
      window.localStorage.setItem(probe, "1");
      window.localStorage.removeItem(probe);
      return window.localStorage;
    } catch (err) {
      return null;
    }
  }

  function read(store, key) {
    if (!store) return null;
    try { return store.getItem(key); } catch (err) { return null; }
  }

  function write(store, key, value) {
    if (!store) return false;
    try {
      store.setItem(key, value);
      return true;
    } catch (err) {
      return false;
    }
  }

  function setupDemo() {
    var root = document.getElementById("demo");
    if (!root || !W) return;
    var store = storage();
    var wins = W.parseWins(read(store, WIN_KEY));
    var screen = "today";
    var draft = "";
    var focusInput = false;
    var banner = store ? "" : "This browser is not saving the list. The buttons still work until you leave the page.";

    function paint() {
      var open = W.openWins(wins);
      var html = "";
      html += '<div class="tabs" role="tablist" aria-label="One Small Win screens">';
      ["today", "list", "about"].forEach(function (name) {
        var label = name === "today" ? "Today" : name === "list" ? "All wins" : "About";
        html += '<button type="button" role="tab" id="tab-' + name + '" data-screen="' + name + '" aria-selected="' + (screen === name) + '" aria-controls="panel-' + name + '">' + label + "</button>";
      });
      html += "</div>";
      html += '<div id="panel-today" role="tabpanel" aria-labelledby="tab-today"' + (screen === "today" ? "" : " hidden") + ">";
      html += '<p id="win-status" class="progress" role="status">' + open.length + " still open</p>";
      if (banner) html += '<p class="note">' + escapeHtml(banner) + "</p>";
      if (open.length === 0) html += "<p>No open wins. Add one small thing you can finish.</p>";
      else html += "<p><strong>" + escapeHtml(open[0].text) + "</strong></p>";
      html += '<label for="win-input">Win to add</label>';
      html += '<input id="win-input" type="text" maxlength="140" value="' + escapeAttr(draft) + '">';
      html += '<div class="actions"><button type="button" class="primary" id="add-win">Add win</button></div>';
      html += "</div>";
      html += '<div id="panel-list" role="tabpanel" aria-labelledby="tab-list"' + (screen === "list" ? "" : " hidden") + ">";
      if (wins.length === 0) html += "<p>The list is empty.</p>";
      wins.forEach(function (win) {
        html += '<div class="win-row">';
        html += '<button type="button" class="grow" data-toggle="' + escapeAttr(win.id) + '">';
        html += '<span class="' + (win.done ? "done-text" : "") + '">' + escapeHtml(win.text) + "</span></button>";
        html += '<button type="button" data-remove="' + escapeAttr(win.id) + '">Remove</button>';
        html += "</div>";
      });
      html += "</div>";
      html += '<div id="panel-about" role="tabpanel" aria-labelledby="tab-about"' + (screen === "about" ? "" : " hidden") + ">";
      html += "<p>This practice copy stores the list in this browser only. Nothing on this page is sent to Dukktape Studios or to Apple.</p>";
      html += "<p>A shippable app still needs a privacy policy at a public address, even when the list never leaves the phone. The About screen of the phone app is where that link goes.</p>";
      html += "</div>";
      html += '<div class="actions"><button type="button" id="reload-wins">Read saved list again</button><button type="button" id="erase-wins">Erase list on this browser</button></div>';
      root.innerHTML = html;
      var input = document.getElementById("win-input");
      if (input) {
        input.addEventListener("input", function () { draft = input.value; });
        if (focusInput) {
          input.focus();
          focusInput = false;
        }
      }
      root.querySelectorAll("[data-screen]").forEach(function (button) {
        button.addEventListener("click", function () {
          screen = button.getAttribute("data-screen");
          draft = input ? input.value : draft;
          paint();
        });
      });
      var add = document.getElementById("add-win");
      if (add) add.addEventListener("click", onAdd);
      var erase = document.getElementById("erase-wins");
      if (erase) erase.addEventListener("click", function () {
        wins = [];
        draft = "";
        var ok = write(store, WIN_KEY, W.serialize(wins));
        banner = ok || !store ? "" : "Erase did not stick. The list is empty until you leave the page.";
        if (!store) banner = "This browser is not saving the list. The buttons still work until you leave the page.";
        paint();
      });
      var reload = document.getElementById("reload-wins");
      if (reload) reload.addEventListener("click", function () {
        var status = document.getElementById("win-status");
        if (status) status.textContent = "Reading saved wins…";
        wins = W.parseWins(read(store, WIN_KEY));
        banner = store
          ? "Read " + wins.length + " saved wins from this browser."
          : "This browser is not saving the list. The buttons still work until you leave the page.";
        paint();
      });
      root.querySelectorAll("[data-toggle]").forEach(function (button) {
        button.addEventListener("click", function () {
          wins = W.toggleWin(wins, button.getAttribute("data-toggle"));
          persist();
          paint();
        });
      });
      root.querySelectorAll("[data-remove]").forEach(function (button) {
        button.addEventListener("click", function () {
          wins = W.removeWin(wins, button.getAttribute("data-remove"));
          persist();
          paint();
        });
      });
    }

    function persist() {
      var ok = write(store, WIN_KEY, W.serialize(wins));
      if (!ok) banner = "The win is on screen. This browser refused to save it.";
    }

    function onAdd() {
      var input = document.getElementById("win-input");
      draft = input ? input.value : draft;
      var result = W.addWin(wins, draft, Date.now());
      if (!result.ok) {
        banner = result.error === "long"
          ? "Keep the win to 120 characters."
          : result.error === "full"
            ? "The practice list stops at 200 wins."
            : "Type a win first.";
        paint();
        return;
      }
      wins = result.list;
      draft = "";
      banner = "";
      focusInput = true;
      persist();
      paint();
    }

    paint();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, "&quot;");
  }

  function setupChecks() {
    var boxes = document.querySelectorAll("[data-check]");
    if (!boxes.length) return;
    var store = storage();
    var saved = [];
    try { saved = JSON.parse(read(store, CHECK_KEY) || "[]"); } catch (err) { saved = []; }
    if (!Array.isArray(saved)) saved = [];
    boxes.forEach(function (box) {
      var id = box.getAttribute("data-check");
      box.checked = saved.indexOf(id) !== -1;
      box.addEventListener("change", function () {
        var next = [];
        boxes.forEach(function (item) {
          if (item.checked) next.push(item.getAttribute("data-check"));
        });
        write(store, CHECK_KEY, JSON.stringify(next));
        updateCount();
      });
    });
    var reset = document.getElementById("reset-checks");
    if (reset) reset.addEventListener("click", function () {
      boxes.forEach(function (box) { box.checked = false; });
      write(store, CHECK_KEY, "[]");
      updateCount();
    });
    updateCount();
  }

  function updateCount() {
    var out = document.getElementById("check-progress");
    var boxes = document.querySelectorAll("[data-check]");
    if (!out || !boxes.length) return;
    var done = 0;
    boxes.forEach(function (box) { if (box.checked) done += 1; });
    out.textContent = done + " of " + boxes.length + " release items checked on this browser";
  }

  function setupNotes() {
    var fields = document.querySelectorAll("[data-note]");
    if (!fields.length) return;
    var store = storage();
    var saved = {};
    try { saved = JSON.parse(read(store, NOTE_KEY) || "{}"); } catch (err) { saved = {}; }
    if (!saved || typeof saved !== "object") saved = {};
    fields.forEach(function (field) {
      var id = field.getAttribute("data-note");
      if (typeof saved[id] === "string") field.value = saved[id];
      field.addEventListener("input", function () {
        saved[id] = field.value;
        var ok = write(store, NOTE_KEY, JSON.stringify(saved));
        var status = document.getElementById("note-status");
        if (status) status.textContent = ok ? "Notes stay in this browser." : "This browser did not save that note.";
      });
    });
    var wipe = document.getElementById("wipe-notes");
    var confirm = document.getElementById("confirm-wipe");
    if (wipe && confirm) {
      wipe.addEventListener("click", function () { confirm.hidden = false; });
      confirm.addEventListener("click", function () {
        saved = {};
        fields.forEach(function (field) { field.value = ""; });
        write(store, NOTE_KEY, "{}");
        confirm.hidden = true;
        var status = document.getElementById("note-status");
        if (status) status.textContent = "Notes on this browser were erased.";
      });
    }
  }

  function setupSearch() {
    var input = document.getElementById("glossary-search");
    var rows = document.querySelectorAll("#glossary-table tbody tr");
    if (!input || !rows.length) return;
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      rows.forEach(function (row) {
        var show = !q || row.textContent.toLowerCase().indexOf(q) !== -1;
        row.hidden = !show;
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else start();

  function start() {
    setupDemo();
    setupChecks();
    setupNotes();
    setupSearch();
  }
})();
