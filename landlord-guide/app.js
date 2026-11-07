(function () {
  var KEYS = {
    inputs: "dukktape-landlord-guide-inputs-v1",
    checks: "dukktape-landlord-guide-checklist-v1",
    season: "dukktape-landlord-guide-season-v1",
    life: "dukktape-landlord-guide-lifecycle-v1",
    repairs: "dukktape-landlord-guide-repairs-v1",
    shutoffs: "dukktape-landlord-guide-shutoffs-v1"
  };
  var form = document.getElementById("worksheet-form");
  var summary = document.getElementById("result-summary");
  var results = document.getElementById("results");
  var storageNote = document.getElementById("storage-note");
  var storageOk = probeStore();

  function probeStore() {
    try {
      var probe = "dukktape-landlord-guide-probe";
      localStorage.setItem(probe, "1");
      localStorage.removeItem(probe);
      return true;
    } catch (err) {
      return false;
    }
  }

  function readStore(key) {
    if (!storageOk) return null;
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch (err) {
      return null;
    }
  }

  function writeStore(key, value) {
    if (!storageOk) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  function clearStore(key) {
    if (!storageOk) return;
    try { localStorage.removeItem(key); } catch (err) {}
  }

  function setNote() {
    storageNote.textContent = storageOk
      ? "Saved in this browser only. It is not backed up and not shared. Use the download buttons if you want a copy."
      : "This browser is not storing the worksheet. You can still calculate and download. Checks will reset if you leave.";
  }

  function money(n) {
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
  }

  function pct(ratio) {
    if (!Number.isFinite(ratio)) return "—";
    return (ratio * 100).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 0 }) + "%";
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function fieldValue(name) {
    var node = form.elements[name];
    return node ? node.value : "";
  }

  function collectInput() {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (node) {
      if (!node.name) return;
      data[node.name] = node.value;
    });
    return data;
  }

  function applyInput(data) {
    Array.prototype.forEach.call(form.elements, function (node) {
      if (!node.name || data[node.name] == null) return;
      node.value = data[node.name];
    });
  }

  function defaultUnit(node) {
    return node.getAttribute("data-default") || (node.options[0] && node.options[0].value) || "";
  }

  function resetForm() {
    Array.prototype.forEach.call(form.elements, function (node) {
      if (!node.name) return;
      if (node.tagName === "SELECT") node.value = defaultUnit(node);
      else node.value = "";
    });
  }

  function matchesExample(data) {
    var sample = window.LandlordCalc.EXAMPLE;
    return Object.keys(sample).every(function (key) {
      if (key === "label") return true;
      return String(data[key] == null ? "" : data[key]) === String(sample[key]);
    });
  }

  function addRow(table, label, monthly, annual) {
    var tr = document.createElement("tr");
    tr.appendChild(el("th", "", label));
    var monthCell = el("td", "num", monthly);
    var yearCell = el("td", "num", annual);
    tr.appendChild(monthCell);
    tr.appendChild(yearCell);
    table.appendChild(tr);
  }

  function flowRow(table, label, annual) {
    addRow(table, label, money(annual / 12), money(annual));
  }

  function render() {
    var data = collectInput();
    writeStore(KEYS.inputs, data);
    var outcome = window.LandlordCalc.analyze(data);
    results.replaceChildren();

    if (outcome.idle) {
      summary.textContent = "Enter a purchase price and a down payment.";
      return;
    }
    if (!outcome.ok) {
      summary.textContent = "Fix the highlighted items before reading an estimate.";
      var box = el("div", "errors");
      var list = document.createElement("ul");
      outcome.errors.forEach(function (error) {
        list.appendChild(el("li", "", error.message));
      });
      box.appendChild(list);
      results.appendChild(box);
      return;
    }

    var r = outcome.results;
    var example = matchesExample(data);
    summary.textContent = example
      ? "Showing the made-up example. Cash flow " + money(r.cashFlow) + " per year."
      : "Cash flow " + money(r.cashFlow) + " per year. Educational estimate only.";

    if (example) {
      results.appendChild(el("p", "banner", "Made-up example. These numbers are not a real house, not listings, and not a rent to charge."));
    }
    outcome.warnings.forEach(function (warning) {
      results.appendChild(el("p", "help", warning));
    });

    var table = document.createElement("table");
    var head = document.createElement("thead");
    var headRow = document.createElement("tr");
    ["Line", "Per month", "Per year"].forEach(function (label) {
      headRow.appendChild(el("th", label === "Line" ? "" : "num", label));
    });
    head.appendChild(headRow);
    table.appendChild(head);
    var body = document.createElement("tbody");
    addRow(body, "Loan amount", "—", money(r.loan));
    flowRow(body, "Principal and interest", r.annualDebtService);
    addRow(body, "Cash invested", "—", money(r.cashInvested));
    flowRow(body, "Scheduled rent", r.scheduledRent);
    flowRow(body, "Vacancy loss", r.vacancyLoss);
    flowRow(body, "Collected rent", r.collectedRent);
    flowRow(body, "Other income", r.otherIncome);
    flowRow(body, "Effective income", r.effectiveIncome);
    flowRow(body, "Management", r.managementCost);
    flowRow(body, "Operating costs, including management", r.operatingExpenses);
    flowRow(body, "NOI (excludes debt, mortgage insurance, reserve)", r.noi);
    flowRow(body, "Mortgage insurance", r.mortgageInsurance);
    flowRow(body, "Capital reserve", r.capexReserve);
    flowRow(body, "Cash flow", r.cashFlow);
    table.appendChild(body);
    results.appendChild(table);

    var coc = el("p", "");
    coc.appendChild(el("strong", "", "Cash-on-cash: "));
    coc.appendChild(document.createTextNode(
      r.cashOnCash.status === "ratio" ? pct(r.cashOnCash.ratio) + ". " + r.cashOnCash.message : r.cashOnCash.message
    ));
    results.appendChild(coc);

    var be = el("p", "");
    be.appendChild(el("strong", "", "Cash-flow break-even scheduled rent: "));
    if (r.breakEven.status === "rent") {
      be.appendChild(document.createTextNode(money(r.breakEven.monthlyScheduledRent) + " per month (" + money(r.breakEven.annualScheduledRent) + " per year). "));
    }
    be.appendChild(document.createTextNode(r.breakEven.message));
    results.appendChild(be);

    var comps = el("div", "");
    comps.appendChild(el("h3", "", "Your comparable rents"));
    if (!r.comparables.length) {
      comps.appendChild(el("p", "help", "No comparable rents entered. This page does not look up listings or estimate market value."));
    } else {
      comps.appendChild(el("p", "help", example
        ? "The rents below are part of the made-up example. They are not listings. A gap is math from these inputs, not advice to charge the break-even number."
        : "The rents below are only what you typed. They are not a valuation. A gap is math from your inputs, not advice to charge the break-even number."));
      var compTable = document.createElement("table");
      var compHead = document.createElement("tr");
      ["Rent you entered", "Per month", "Versus break-even"].forEach(function (label) {
        compHead.appendChild(el("th", "", label));
      });
      compTable.appendChild(compHead);
      r.comparables.forEach(function (comp) {
        var tr = document.createElement("tr");
        tr.appendChild(el("td", "", comp.label));
        tr.appendChild(el("td", "num", money(comp.monthlyRent)));
        var versus = "No break-even rent to compare.";
        if (Number.isFinite(r.breakEven.monthlyScheduledRent)) {
          var gap = comp.monthlyRent - r.breakEven.monthlyScheduledRent;
          versus = (gap < 0 ? money(Math.abs(gap)) + " below" : money(gap) + " above") + " break-even";
        }
        tr.appendChild(el("td", "", versus));
        compTable.appendChild(tr);
      });
      comps.appendChild(compTable);
    }
    results.appendChild(comps);
    results.appendChild(el("p", "help", "Educational estimate. No guarantee. Not tax, legal, or investment advice."));
  }

  function linesForExport() {
    var data = collectInput();
    var outcome = window.LandlordCalc.analyze(data);
    var lines = [
      "Landlord Crash Course worksheet",
      "Educational estimate only. Not a rent to charge, an appraisal, or tax or investment advice.",
      ""
    ];
    Object.keys(data).forEach(function (key) {
      lines.push(key + ": " + data[key]);
    });
    lines.push("");
    if (!outcome.ok) {
      lines.push(outcome.idle ? "No estimate yet." : "Not calculated.");
      outcome.errors.forEach(function (error) { lines.push(error.message); });
      return lines;
    }
    var r = outcome.results;
    lines.push("Loan: " + money(r.loan));
    lines.push("Principal and interest per month: " + money(r.monthlyPrincipalInterest));
    lines.push("Debt service per year: " + money(r.annualDebtService));
    lines.push("Cash invested: " + money(r.cashInvested));
    lines.push("Scheduled rent per year: " + money(r.scheduledRent));
    lines.push("Collected rent per year: " + money(r.collectedRent));
    lines.push("Management per year: " + money(r.managementCost));
    lines.push("NOI per year: " + money(r.noi));
    lines.push("Capital reserve per year: " + money(r.capexReserve));
    lines.push("Cash flow per year: " + money(r.cashFlow));
    lines.push("Cash-on-cash: " + (r.cashOnCash.status === "ratio" ? pct(r.cashOnCash.ratio) : "not defined"));
    lines.push("Break-even: " + (r.breakEven.status === "rent"
      ? money(r.breakEven.monthlyScheduledRent) + " per month. " + r.breakEven.message
      : r.breakEven.message));
    r.assumptions.forEach(function (item) { lines.push("Assumption: " + item); });
    return lines;
  }

  function download(filename, text, type) {
    var blob = new Blob([text], { type: type });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function bindChecks(group, key, countId) {
    var boxes = document.querySelectorAll('.checks[data-group="' + group + '"] input[data-check]');
    var saved = readStore(key) || {};
    function update() {
      var done = 0;
      boxes.forEach(function (box) { if (box.checked) done += 1; });
      document.getElementById(countId).textContent = done + " of " + boxes.length + " checked. Saved in this browser only.";
    }
    boxes.forEach(function (box) {
      box.checked = !!saved[box.dataset.check];
      box.addEventListener("change", function () {
        var data = readStore(key) || {};
        data[box.dataset.check] = box.checked;
        writeStore(key, data);
        update();
      });
    });
    update();
    return function clear() {
      clearStore(key);
      boxes.forEach(function (box) { box.checked = false; });
      update();
    };
  }

  var clearChecks = bindChecks("ready", KEYS.checks, "check-count");
  var clearSeason = bindChecks("season", KEYS.season, "season-count");

  function lifeDefaults() {
    var defaults = {};
    document.querySelectorAll("#life-body tr").forEach(function (row) {
      defaults[row.dataset.life] = {
        years: row.querySelector(".life-years").defaultValue,
        cost: row.querySelector(".life-cost").defaultValue
      };
    });
    return defaults;
  }

  function lifeAnnual(years, cost) {
    var parsedYears = window.LandlordCalc.parseNumber(years);
    var parsedCost = window.LandlordCalc.parseNumber(cost);
    if (!parsedYears.ok || !parsedCost.ok || parsedYears.value <= 0 || parsedCost.value < 0) return null;
    var annual = parsedCost.value / parsedYears.value;
    return Number.isFinite(annual) ? annual : null;
  }

  function renderLife() {
    var saved = readStore(KEYS.life) || {};
    var total = 0;
    var usable = 0;
    document.querySelectorAll("#life-body tr").forEach(function (row) {
      var id = row.dataset.life;
      var years = row.querySelector(".life-years");
      var cost = row.querySelector(".life-cost");
      var out = row.querySelector(".life-year");
      if (saved[id]) {
        if (saved[id].years != null) years.value = saved[id].years;
        if (saved[id].cost != null) cost.value = saved[id].cost;
      }
      var annual = lifeAnnual(years.value, cost.value);
      if (annual == null) {
        out.textContent = "—";
      } else {
        out.textContent = money(annual);
        total += annual;
        usable += 1;
      }
    });
    document.getElementById("life-total").textContent = usable
      ? "Yearly set-aside from the rows that divide cleanly: " + money(total) + "."
      : "Yearly set-aside: enter years greater than 0.";
    return total;
  }

  function saveLife() {
    var data = {};
    document.querySelectorAll("#life-body tr").forEach(function (row) {
      data[row.dataset.life] = {
        years: row.querySelector(".life-years").value,
        cost: row.querySelector(".life-cost").value
      };
    });
    writeStore(KEYS.life, data);
  }

  document.getElementById("life-body").addEventListener("input", function () {
    saveLife();
    renderLife();
  });

  function renderRepairs() {
    var list = document.getElementById("repair-list");
    var items = readStore(KEYS.repairs) || [];
    list.replaceChildren();
    if (!items.length) {
      list.appendChild(el("p", "help", "No repairs logged in this browser."));
      return;
    }
    items.forEach(function (item) {
      var card = el("article", "log-item");
      var title = el("p", "");
      title.appendChild(el("strong", "", (item.date || "No date") + " — " + item.area));
      card.appendChild(title);
      card.appendChild(el("p", "", item.note));
      if (item.cost) card.appendChild(el("p", "help", "Cost entered: " + item.cost));
      var remove = el("button", "quiet noprint", "Remove");
      remove.type = "button";
      remove.addEventListener("click", function () {
        var next = (readStore(KEYS.repairs) || []).filter(function (row) { return row.id !== item.id; });
        writeStore(KEYS.repairs, next);
        renderRepairs();
      });
      card.appendChild(remove);
      list.appendChild(card);
    });
  }

  function loadShutoffs() {
    var saved = readStore(KEYS.shutoffs) || {};
    ["shut-water", "shut-electric", "shut-gas"].forEach(function (id) {
      var node = document.getElementById(id);
      if (saved[id]) node.value = saved[id];
      node.addEventListener("input", function () {
        var data = readStore(KEYS.shutoffs) || {};
        data[id] = node.value;
        writeStore(KEYS.shutoffs, data);
      });
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    render();
  });
  form.addEventListener("input", render);
  form.addEventListener("change", render);

  document.getElementById("load-example").addEventListener("click", function () {
    var sample = window.LandlordCalc.EXAMPLE;
    applyInput(sample);
    render();
    document.getElementById("results-card").scrollIntoView({ block: "start" });
  });

  document.getElementById("reset-worksheet").addEventListener("click", function () {
    resetForm();
    clearStore(KEYS.inputs);
    render();
  });

  document.getElementById("export-text").addEventListener("click", function () {
    download("landlord-worksheet.txt", linesForExport().join("\n"), "text/plain");
  });

  document.getElementById("export-csv").addEventListener("click", function () {
    var lines = linesForExport().map(function (line) {
      return '"' + String(line).replace(/"/g, '""') + '"';
    });
    download("landlord-worksheet.csv", lines.join("\n"), "text/csv");
  });

  document.getElementById("print-page").addEventListener("click", function () { window.print(); });
  document.getElementById("clear-checks").addEventListener("click", clearChecks);
  document.getElementById("clear-season").addEventListener("click", clearSeason);

  document.getElementById("use-reserve").addEventListener("click", function () {
    var total = renderLife();
    if (!(total > 0)) return;
    form.elements.capexReserve.value = String(window.LandlordCalc.roundCents(total));
    form.elements.capexReserveUnit.value = "year";
    render();
    document.getElementById("capexReserve").focus();
  });

  document.getElementById("reset-life").addEventListener("click", function () {
    var defaults = lifeDefaults();
    document.querySelectorAll("#life-body tr").forEach(function (row) {
      var item = defaults[row.dataset.life];
      row.querySelector(".life-years").value = item.years;
      row.querySelector(".life-cost").value = item.cost;
    });
    clearStore(KEYS.life);
    saveLife();
    renderLife();
  });

  document.getElementById("repair-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var note = document.getElementById("repair-note").value.trim();
    if (!note) {
      document.getElementById("repair-note").focus();
      return;
    }
    var cost = document.getElementById("repair-cost").value.trim();
    var parsed = window.LandlordCalc.parseNumber(cost);
    if (cost && (!parsed.ok || parsed.value < 0)) {
      document.getElementById("repair-cost").focus();
      return;
    }
    var items = readStore(KEYS.repairs) || [];
    items.unshift({
      id: String(Date.now()),
      date: document.getElementById("repair-date").value,
      area: document.getElementById("repair-area").value,
      note: note,
      cost: cost
    });
    writeStore(KEYS.repairs, items);
    event.target.reset();
    renderRepairs();
  });

  document.getElementById("export-log").addEventListener("click", function () {
    var items = readStore(KEYS.repairs) || [];
    var lines = ["date,area,note,cost"];
    items.forEach(function (item) {
      lines.push([item.date, item.area, item.note, item.cost].map(function (part) {
        return '"' + String(part || "").replace(/"/g, '""') + '"';
      }).join(","));
    });
    download("repair-log.csv", lines.join("\n"), "text/csv");
  });

  document.getElementById("clear-log").addEventListener("click", function () {
    clearStore(KEYS.repairs);
    renderRepairs();
  });

  document.getElementById("clear-shutoffs").addEventListener("click", function () {
    clearStore(KEYS.shutoffs);
    ["shut-water", "shut-electric", "shut-gas"].forEach(function (id) {
      document.getElementById(id).value = "";
    });
  });

  document.getElementById("clear-all").addEventListener("click", function () {
    if (!window.confirm("Clear the worksheet, checklist, seasonal ticks, replacement budget, shutoff notes, and repair log saved in this browser?")) return;
    clearChecks();
    clearSeason();
    resetForm();
    clearStore(KEYS.inputs);
    document.getElementById("reset-life").click();
    document.getElementById("clear-shutoffs").click();
    document.getElementById("clear-log").click();
    render();
  });

  var stored = readStore(KEYS.inputs);
  if (stored && typeof stored === "object") applyInput(stored);
  renderLife();
  loadShutoffs();
  renderRepairs();
  render();
  setNote();
})();
