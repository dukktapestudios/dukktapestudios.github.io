/* Wires the static checklist. Saves checkmarks and packet status only. */
(function () {
  if (!window.DocStore) return;

  var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-check]"));
  var scheduleBoxes = Array.prototype.slice.call(document.querySelectorAll("[data-schedule]"));
  var scheduleRoot = document.getElementById("schedule");
  var selects = Array.prototype.slice.call(document.querySelectorAll("[data-status-for]"));
  var packets = Array.prototype.slice.call(document.querySelectorAll("[data-category]"));
  var search = document.getElementById("q");
  var shown = document.getElementById("shown-count");
  var progressLabel = document.getElementById("progress-label");
  var packetSummary = document.getElementById("packet-summary");
  var bar = document.getElementById("progress");
  var fill = document.getElementById("progress-fill");
  var saveNote = document.getElementById("save-note");
  var announce = document.getElementById("announce");
  var dialog = document.getElementById("reset-dialog");
  var fileInput = document.getElementById("import-file");
  var filterMode = "all";

  function known() {
    return {
      checks: boxes.map(function (box) { return box.getAttribute("data-check"); }),
      categories: selects.map(function (sel) { return sel.getAttribute("data-status-for"); })
    };
  }

  function collect() {
    var checks = {};
    var status = {};
    boxes.forEach(function (box) {
      if (box.checked) checks[box.getAttribute("data-check")] = true;
    });
    selects.forEach(function (sel) {
      status[sel.getAttribute("data-status-for")] = sel.value;
    });
    return { v: 1, checks: checks, status: status };
  }

  function apply(state) {
    boxes.forEach(function (box) {
      box.checked = state.checks[box.getAttribute("data-check")] === true;
    });
    selects.forEach(function (sel) {
      var value = state.status[sel.getAttribute("data-status-for")];
      sel.value = value === "partial" || value === "filed" ? value : "blank";
    });
    refresh();
  }

  function noteSaveFailure() {
    saveNote.textContent = "This browser did not save marks. They last only until you leave the page.";
  }

  function persist() {
    var state = DocStore.sanitize(collect(), known());
    try {
      localStorage.setItem(DocStore.KEY, JSON.stringify(state));
      if (saveNote.textContent.indexOf("did not save") !== -1) saveNote.textContent = "";
    } catch (err) {
      noteSaveFailure();
    }
    refresh();
    return state;
  }

  function setFilter(mode) {
    filterMode = mode;
    Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (button) {
      var on = button.getAttribute("data-filter") === mode;
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
    applyFilter();
  }

  function applyFilter() {
    var query = search ? search.value.trim().toLowerCase() : "";
    var visible = 0;
    packets.forEach(function (packet) {
      var title = (packet.querySelector("h2") || {}).textContent || "";
      var titleMatch = query && title.toLowerCase().indexOf(query) !== -1;
      var any = false;
      Array.prototype.forEach.call(packet.querySelectorAll(".item"), function (item) {
        var box = item.querySelector("[data-check]");
        var modeOk = filterMode === "all" ||
          (filterMode === "have" && box.checked) ||
          (filterMode === "need" && !box.checked);
        var textOk = !query || titleMatch || item.textContent.toLowerCase().indexOf(query) !== -1;
        var show = modeOk && textOk;
        item.hidden = !show;
        if (show) {
          any = true;
          visible += 1;
        }
      });
      packet.hidden = !any;
    });
    var scheduleTitle = scheduleRoot && scheduleRoot.querySelector("h2") ? scheduleRoot.querySelector("h2").textContent.toLowerCase() : "";
    var scheduleMatch = query && scheduleTitle.indexOf(query) !== -1;
    var anySchedule = false;
    Array.prototype.forEach.call(document.querySelectorAll("[data-period]"), function (group) {
      var heading = group.querySelector("h3");
      var groupMatch = query && heading && heading.textContent.toLowerCase().indexOf(query) !== -1;
      var any = false;
      Array.prototype.forEach.call(group.querySelectorAll(".sched-item"), function (item) {
        var box = item.querySelector("[data-schedule]");
        var modeOk = filterMode === "all" ||
          (filterMode === "have" && box.checked) ||
          (filterMode === "need" && !box.checked);
        var textOk = !query || scheduleMatch || groupMatch || item.textContent.toLowerCase().indexOf(query) !== -1;
        var show = modeOk && textOk;
        item.hidden = !show;
        if (show) {
          any = true;
          anySchedule = true;
          visible += 1;
        }
      });
      group.hidden = !any;
    });
    if (scheduleRoot) scheduleRoot.hidden = !anySchedule;
    if (shown) shown.textContent = visible + (visible === 1 ? " item shown" : " items shown");
  }

  function scheduleKinds() {
    var kinds = {};
    scheduleBoxes.forEach(function (box) {
      kinds[box.getAttribute("data-schedule")] = box.getAttribute("data-period-kind");
    });
    return kinds;
  }

  function paintPeriods() {
    var now = new Date();
    Array.prototype.forEach.call(document.querySelectorAll("[data-period]"), function (group) {
      var kind = group.getAttribute("data-period");
      var label = group.querySelector("[data-period-label]");
      if (label) label.textContent = DocStore.periodLabel(kind, now);
      var itemBoxes = group.querySelectorAll("[data-schedule]");
      var n = 0;
      Array.prototype.forEach.call(itemBoxes, function (box) { if (box.checked) n += 1; });
      var count = group.querySelector("[data-period-count]");
      if (count) count.textContent = n + " of " + itemBoxes.length + " done for this period";
    });
  }

  function readSchedule() {
    var prior = null;
    try { prior = localStorage.getItem(DocStore.SCHEDULE_KEY); } catch (err) { prior = null; }
    var raw = {};
    if (prior) {
      try { raw = JSON.parse(prior); } catch (err) { raw = {}; }
    }
    var active = DocStore.activeSchedule(raw, scheduleKinds(), new Date());
    if (prior !== null) {
      try { localStorage.setItem(DocStore.SCHEDULE_KEY, JSON.stringify(active)); } catch (err) { noteSaveFailure(); }
    }
    return active;
  }

  function applySchedule(active) {
    scheduleBoxes.forEach(function (box) {
      box.checked = !!active[box.getAttribute("data-schedule")];
    });
    paintPeriods();
    applyFilter();
  }

  function persistSchedule() {
    var kinds = scheduleKinds();
    var now = new Date();
    var next = {};
    scheduleBoxes.forEach(function (box) {
      if (box.checked) next[box.getAttribute("data-schedule")] = DocStore.periodToken(box.getAttribute("data-period-kind"), now);
    });
    var active = DocStore.activeSchedule(next, kinds, now);
    try { localStorage.setItem(DocStore.SCHEDULE_KEY, JSON.stringify(active)); } catch (err) { noteSaveFailure(); }
    paintPeriods();
    applyFilter();
    return active;
  }

  function refresh() {
    var total = boxes.length;
    var have = 0;
    boxes.forEach(function (box) { if (box.checked) have += 1; });
    if (progressLabel) progressLabel.textContent = have + " of " + total + " marked have it";
    if (bar) {
      bar.setAttribute("aria-valuemax", String(total));
      bar.setAttribute("aria-valuenow", String(have));
      bar.setAttribute("aria-valuetext", have + " of " + total + " marked have it");
    }
    if (fill) fill.style.width = (total ? Math.round((have / total) * 100) : 0) + "%";
    var filed = 0;
    var partial = 0;
    var blank = 0;
    selects.forEach(function (sel) {
      if (sel.value === "filed") filed += 1;
      else if (sel.value === "partial") partial += 1;
      else blank += 1;
      var packet = document.getElementById("cat-" + sel.getAttribute("data-status-for"));
      if (packet) packet.setAttribute("data-state", sel.value);
    });
    if (packetSummary) packetSummary.textContent = filed + " filed · " + partial + " partial · " + blank + " blank";
    packets.forEach(function (packet) {
      var count = packet.querySelector("[data-count-for]");
      var itemBoxes = packet.querySelectorAll("[data-check]");
      var n = 0;
      Array.prototype.forEach.call(itemBoxes, function (box) { if (box.checked) n += 1; });
      if (count) count.textContent = n + " of " + itemBoxes.length + " have it";
    });
    applyFilter();
  }

  function clearAll() {
    boxes.forEach(function (box) { box.checked = false; });
    scheduleBoxes.forEach(function (box) { box.checked = false; });
    selects.forEach(function (sel) { sel.value = "blank"; });
    if (search) search.value = "";
    setFilter("all");
    try {
      localStorage.removeItem(DocStore.KEY);
      localStorage.removeItem(DocStore.SCHEDULE_KEY);
    } catch (err) { noteSaveFailure(); }
    refresh();
    paintPeriods();
    if (announce) announce.textContent = "Marks cleared on this device.";
  }

  boxes.forEach(function (box) {
    box.addEventListener("change", persist);
  });
  scheduleBoxes.forEach(function (box) {
    box.addEventListener("change", persistSchedule);
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-reset-period]"), function (button) {
    button.addEventListener("click", function () {
      var kind = button.getAttribute("data-reset-period");
      scheduleBoxes.forEach(function (box) {
        if (box.getAttribute("data-period-kind") === kind) box.checked = false;
      });
      persistSchedule();
      if (announce) announce.textContent = "Schedule marks reset for this period.";
    });
  });
  selects.forEach(function (sel) {
    sel.addEventListener("change", persist);
  });
  if (search) search.addEventListener("input", applyFilter);
  document.getElementById("clear-search").addEventListener("click", function () {
    search.value = "";
    search.focus();
    applyFilter();
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (button) {
    button.addEventListener("click", function () {
      setFilter(button.getAttribute("data-filter"));
    });
  });

  document.getElementById("export").addEventListener("click", function () {
    var state = DocStore.sanitize(collect(), known());
    var blob = new Blob([JSON.stringify(state, null, 2) + "\n"], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "documents-checklist-marks.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    if (announce) announce.textContent = "Marks file downloaded. It contains checkmarks and packet status only.";
  });

  document.getElementById("import").addEventListener("click", function () {
    fileInput.click();
  });
  fileInput.addEventListener("change", function () {
    var file = fileInput.files && fileInput.files[0];
    fileInput.value = "";
    if (!file) return;
    if (file.size > DocStore.MAX_IMPORT) {
      saveNote.textContent = "That file is too large. This page only imports checklist marks.";
      return;
    }
    var reader = new FileReader();
    reader.onerror = function () {
      saveNote.textContent = "That file is not checklist marks this page can use.";
    };
    reader.onload = function () {
      var text = String(reader.result || "");
      if (text.length > DocStore.MAX_IMPORT) {
        saveNote.textContent = "That file is too large. This page only imports checklist marks.";
        return;
      }
      var parsed;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        saveNote.textContent = "That file is not checklist marks this page can use.";
        return;
      }
      var result = DocStore.acceptedImport(parsed, known());
      if (!result.ok) {
        saveNote.textContent = result.reason === "unrecognized"
          ? "Nothing in that file matched this checklist. Current marks were kept."
          : "That file is not checklist marks this page can use.";
        return;
      }
      apply(result.state);
      try {
        localStorage.setItem(DocStore.KEY, JSON.stringify(result.state));
        saveNote.textContent = "";
      } catch (err) {
        noteSaveFailure();
      }
      if (announce) announce.textContent = "Checklist marks imported on this device.";
    };
    reader.readAsText(file);
  });

  document.getElementById("reset").addEventListener("click", function () {
    if (dialog && typeof dialog.showModal === "function") dialog.showModal();
    else if (window.confirm("Clear document checkmarks, packet status, and schedule marks on this device?")) clearAll();
  });
  document.getElementById("reset-cancel").addEventListener("click", function () {
    if (dialog && dialog.open) dialog.close();
  });
  document.getElementById("reset-confirm").addEventListener("click", function () {
    if (dialog && dialog.open) dialog.close();
    clearAll();
    document.getElementById("reset").focus();
  });

  var state = DocStore.empty();
  var prior = null;
  try { prior = localStorage.getItem(DocStore.KEY); } catch (err) { prior = null; }
  if (prior) {
    try { state = DocStore.sanitize(JSON.parse(prior), known()); } catch (err) { state = DocStore.empty(); }
    try { localStorage.setItem(DocStore.KEY, JSON.stringify(state)); } catch (err) { noteSaveFailure(); }
  }
  apply(state);
  applySchedule(readSchedule());
})();
