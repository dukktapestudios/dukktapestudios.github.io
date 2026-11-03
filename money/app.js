/* Renders stages from data.js and runs the two calculators. */
(function () {
  var DATA = window.MONEY_DATA;
  var Calc = window.MoneyCalc;

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function safeUrl(url) {
    try {
      var parsed = new URL(url);
      if (parsed.protocol !== "https:") return "";
      return parsed.href;
    } catch (err) {
      return "";
    }
  }

  function loadState() {
    var empty = { stageId: "", checks: {} };
    try {
      var raw = localStorage.getItem(DATA.storageKey);
      if (!raw) return empty;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return empty;
      if (!parsed.checks || typeof parsed.checks !== "object") parsed.checks = {};
      if (typeof parsed.stageId !== "string") parsed.stageId = "";
      return parsed;
    } catch (err) {
      return empty;
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(DATA.storageKey, JSON.stringify(state));
    } catch (err) {
      /* Private mode can block storage. The page still works for this visit. */
    }
  }

  function money(amount) {
    if (!isFinite(amount)) return "—";
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    });
  }

  function moneyCents(amount) {
    if (!isFinite(amount)) return "∞";
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function stageById(id) {
    var i;
    for (i = 0; i < DATA.stages.length; i++) {
      if (DATA.stages[i].id === id) return DATA.stages[i];
    }
    return null;
  }

  function checkKey(stage, item) {
    return stage.id + ":" + item.id;
  }

  var state = loadState();
  var picker = document.getElementById("stage-picker");
  var panel = document.getElementById("stage-panel");

  function renderPicker() {
    picker.innerHTML = DATA.stages.map(function (stage) {
      var pressed = stage.id === state.stageId ? "true" : "false";
      return (
        '<button type="button" class="stage-btn" data-stage="' + esc(stage.id) + '" aria-pressed="' + pressed + '">' +
          '<span class="stage-title">' + esc(stage.title) + "</span>" +
          '<span class="stage-blurb">' + esc(stage.blurb) + "</span>" +
        "</button>"
      );
    }).join("");
  }

  function checkedCount(stage) {
    var done = 0;
    stage.checklist.forEach(function (item) {
      if (state.checks[checkKey(stage, item)]) done += 1;
    });
    return done;
  }

  function renderPanel(moveFocus) {
    var stage = stageById(state.stageId);
    if (!stage) {
      panel.innerHTML = '<p class="lede">Pick the line that feels closest. You can switch any time. Checks stay on this device.</p>';
      return;
    }
    var done = checkedCount(stage);
    var total = stage.checklist.length;
    var checks = stage.checklist.map(function (item) {
      var key = checkKey(stage, item);
      var on = state.checks[key] ? " checked" : "";
      return (
        "<li><label><input type=\"checkbox\" data-check=\"" + esc(key) + "\"" + on + ">" +
        "<span>" + esc(item.text) + "</span></label></li>"
      );
    }).join("");
    var steps = stage.next.map(function (step) {
      return "<li>" + esc(step) + "</li>";
    }).join("");
    var links = stage.resources.map(function (item) {
      var href = safeUrl(item.url);
      if (!href) return "";
      return (
        "<li><a href=\"" + esc(href) + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + esc(item.name) + "</a>" +
        "<span class=\"note\">" + esc(item.note) + "</span></li>"
      );
    }).join("");
    panel.innerHTML =
      "<h3 id=\"stage-heading\">" + esc(stage.title) + "</h3>" +
      "<p>" + esc(stage.intro) + "</p>" +
      "<p class=\"progress\" id=\"stage-progress\">" + done + " of " + total + " checked</p>" +
      "<div class=\"meter\" aria-hidden=\"true\"><span id=\"stage-meter\" style=\"width:" + (total ? (done / total) * 100 : 0) + "%\"></span></div>" +
      "<ul class=\"checks\">" + checks + "</ul>" +
      "<h4>Next 3 steps</h4>" +
      "<ol class=\"steps\">" + steps + "</ol>" +
      "<h4>Places that can help</h4>" +
      "<ul class=\"resources\">" + links + "</ul>" +
      "<button type=\"button\" class=\"text-btn\" id=\"clear-checks\">Clear checks for this stage</button>";
    if (moveFocus) {
      var heading = document.getElementById("stage-heading");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus();
      }
    }
  }

  function updateProgress() {
    var stage = stageById(state.stageId);
    if (!stage) return;
    var done = checkedCount(stage);
    var total = stage.checklist.length;
    var label = document.getElementById("stage-progress");
    var meter = document.getElementById("stage-meter");
    if (label) label.textContent = done + " of " + total + " checked";
    if (meter) meter.style.width = (total ? (done / total) * 100 : 0) + "%";
  }

  picker.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-stage]");
    if (!button) return;
    state.stageId = button.getAttribute("data-stage");
    saveState(state);
    renderPicker();
    renderPanel(true);
  });

  panel.addEventListener("change", function (event) {
    var box = event.target;
    if (!box.matches || !box.matches("input[data-check]")) return;
    var key = box.getAttribute("data-check");
    if (box.checked) state.checks[key] = true;
    else delete state.checks[key];
    saveState(state);
    updateProgress();
  });

  panel.addEventListener("click", function (event) {
    if (event.target.id !== "clear-checks") return;
    var stage = stageById(state.stageId);
    if (!stage) return;
    if (!window.confirm("Clear the checks for this stage?")) return;
    stage.checklist.forEach(function (item) {
      delete state.checks[checkKey(stage, item)];
    });
    saveState(state);
    renderPanel(false);
  });

  function readNumber(id) {
    var raw = document.getElementById(id).value.trim();
    if (raw === "") return null;
    var value = Number(raw);
    if (!isFinite(value)) return null;
    return value;
  }

  function showAffordError(message) {
    document.getElementById("afford-results").innerHTML = '<p class="error">' + esc(message) + "</p>";
  }

  var payPeriod = "year";

  function setPeriod(next, convert) {
    var income = document.getElementById("income");
    var amount = readNumber("income");
    if (convert && amount != null && amount >= 0 && next !== payPeriod) {
      var switched = next === "month" ? amount / 12 : amount * 12;
      income.value = String(Math.round(switched * 100) / 100);
    }
    payPeriod = next;
    document.getElementById("period-year").setAttribute("aria-pressed", next === "year" ? "true" : "false");
    document.getElementById("period-month").setAttribute("aria-pressed", next === "month" ? "true" : "false");
    document.getElementById("income-label").textContent = next === "year" ? "Pay per year ($)" : "Pay per month ($)";
    renderAfford();
  }

  document.getElementById("period-year").addEventListener("click", function () { setPeriod("year", true); });
  document.getElementById("period-month").addEventListener("click", function () { setPeriod("month", true); });
  ["income", "state-tax", "rate", "down", "tax-rate", "ins-rate", "years"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", renderAfford);
  });

  function pieSvg() {
    var parts = [
      { fraction: 0.5, color: "#1d6840" },
      { fraction: 0.3, color: "#e07a2f" },
      { fraction: 0.2, color: "#6b442c" }
    ];
    var radius = 42;
    var circ = 2 * Math.PI * radius;
    var offset = 0;
    var shapes = parts.map(function (part) {
      var len = circ * part.fraction;
      var node = '<circle cx="60" cy="60" r="' + radius + '" fill="none" stroke="' + part.color + '" stroke-width="22" stroke-dasharray="' + len + " " + (circ - len) + '" stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 60 60)"/>';
      offset += len;
      return node;
    }).join("");
    return '<svg class="pie" viewBox="0 0 120 120" aria-hidden="true">' + shapes + "</svg>";
  }

  function renderAfford() {
    var typed = readNumber("income");
    if (typed == null) {
      showAffordError("Enter a pay amount to see the estimate.");
      return;
    }
    if (typed < 0) {
      showAffordError("Pay cannot be negative.");
      return;
    }
    if (typed > 100000000) {
      showAffordError("Enter a pay amount under $100,000,000.");
      return;
    }
    var stateTax = readNumber("state-tax");
    var rate = readNumber("rate");
    var down = readNumber("down");
    var taxRate = readNumber("tax-rate");
    var insRate = readNumber("ins-rate");
    var years = readNumber("years");
    if (stateTax == null || stateTax < 0 || stateTax > 40) {
      showAffordError("Use a state tax guess from 0 to 40.");
      return;
    }
    if (rate == null || rate < 0 || rate > 30) {
      showAffordError("Use an interest rate from 0 to 30.");
      return;
    }
    if (down == null || down < 0 || down > 100) {
      showAffordError("Use a down payment from 0 to 100 percent.");
      return;
    }
    if (taxRate == null || taxRate < 0 || taxRate > 5 || insRate == null || insRate < 0 || insRate > 5) {
      showAffordError("Use a property tax and insurance guess from 0 to 5 percent.");
      return;
    }
    if (years == null || years < 1 || years > 40) {
      showAffordError("Use a loan length from 1 to 40 years.");
      return;
    }

    var yearly = payPeriod === "year" ? typed : typed * 12;
    var monthlyGross = yearly / 12;
    var sketch = Calc.takeHome(yearly, stateTax);
    var maxRent = monthlyGross * 0.3;
    var housingOpts = { downPct: down, ratePct: rate, years: years, taxPct: taxRate, insPct: insRate };
    var lowPrice = Calc.homePrice(monthlyGross * 0.25, housingOpts);
    var highPrice = Calc.homePrice(monthlyGross * 0.28, housingOpts);
    var needs = sketch.takeHome * 0.5;
    var wants = sketch.takeHome * 0.3;
    var save = sketch.takeHome * 0.2;
    var priceNote = "";
    if (!isFinite(highPrice)) {
      priceNote = "<p>This guess cannot price a home when the loan, taxes, and insurance are all zero.</p>";
    } else {
      var highLoan = highPrice * (1 - down / 100);
      var highPI = Calc.monthlyPI(highLoan, rate, years);
      var highTax = highPrice * (taxRate / 100) / 12;
      var highIns = highPrice * (insRate / 100) / 12;
      priceNote =
        "<p>Rough home price: <strong>" + money(lowPrice) + " to " + money(highPrice) + "</strong>. " +
        "The low end keeps housing at 25% of gross pay. The high end uses 28%.</p>" +
        "<p>At the high end, the monthly housing guess is <strong>" + money(monthlyGross * 0.28) + "</strong>. " +
        "About " + money(highPI) + " is principal and interest on a " + money(highLoan) + " loan. " +
        "About " + money(highTax) + " is property tax and " + money(highIns) + " is insurance. " +
        "Down payment at " + down + "% is " + money(highPrice * down / 100) + ".</p>";
    }

    document.getElementById("afford-results").innerHTML =
      '<div class="stats">' +
        '<article class="stat"><h3>Estimated take-home</h3><p class="big">' + money(sketch.takeHome / 12) + ' <span class="sub">a month</span></p><p class="sub">' + money(sketch.takeHome) + " a year</p></article>" +
        '<article class="stat"><h3>Max rent</h3><p class="big">' + money(maxRent) + ' <span class="sub">a month</span></p><p class="sub">30% of gross pay (' + money(monthlyGross) + " a month)</p></article>" +
        '<article class="stat"><h3>Home price range</h3><p class="range">' + (isFinite(highPrice) ? money(lowPrice) + " – " + money(highPrice) : "—") + '</p><p class="sub">Housing at 25% to 28% of gross pay</p></article>' +
      "</div>" +
      "<h3>50 / 30 / 20 of estimated take-home</h3>" +
      '<div class="bar" role="img" aria-label="Bar chart: 50 percent needs, 30 percent wants, 20 percent savings">' +
        '<i class="needs"></i><i class="wants"></i><i class="save"></i>' +
      "</div>" +
      '<div class="chart-row">' +
        pieSvg() +
        '<ul class="legend">' +
          '<li><span><i class="swatch needs"></i>Needs, 50%</span><span>' + money(needs / 12) + "/mo</span></li>" +
          '<li><span><i class="swatch wants"></i>Wants, 30%</span><span>' + money(wants / 12) + "/mo</span></li>" +
          '<li><span><i class="swatch save"></i>Savings, 20%</span><span>' + money(save / 12) + "/mo</span></li>" +
        "</ul>" +
      "</div>" +
      "<p class=\"help\">The bar and pie always show 50, 30, and 20. The dollars follow the take-home estimate. Needs include rent, food, utilities, and minimum debt payments. Rent at 30% of gross can be larger than the needs slice if taxes are high.</p>" +
      "<details class=\"fine\"><summary>How this estimate is built</summary>" +
        "<p>Gross pay is " + money(yearly) + " a year (" + money(monthlyGross) + " a month).</p>" +
        "<p>Federal income tax guess: " + money(sketch.federal) + ". This uses 2025 single-filer brackets and a $" + Calc.STANDARD_DEDUCTION.toLocaleString("en-US") + " standard deduction.</p>" +
        "<p>Social Security and Medicare guess: " + money(sketch.socialSecurity + sketch.medicare) + ". Social Security in this sketch stops after $" + Calc.SS_WAGE_BASE.toLocaleString("en-US") + " of pay, a 2025 wage cap.</p>" +
        "<p>State tax guess: " + money(sketch.state) + " (" + stateTax + "% of gross). Leave that box at 0 to skip state tax.</p>" +
        "<p>Not included: health insurance, retirement contributions, tax credits, local tax, and filing status other than single.</p>" +
        priceNote +
        "<p>The home guess uses a " + years + "-year loan at " + rate + "% interest, a " + down + "% down payment, property tax of " + taxRate + "% of the price per year, and insurance of " + insRate + "% per year. It does not include mortgage insurance. Many loans add that when the down payment is under 20%.</p>" +
      "</details>";
  }

  function renderFlow() {
    var steps = DATA.flowchart;
    var width = 340;
    var boxH = 70;
    var gap = 28;
    var top = 8;
    var height = top + steps.length * boxH + (steps.length - 1) * gap + 8;
    var parts = [
      "<svg class=\"flow-svg\" viewBox=\"0 0 " + width + " " + height + "\" role=\"img\" aria-labelledby=\"flow-title\">",
      "<title id=\"flow-title\">Nine steps from crisis to wealth</title>"
    ];
    steps.forEach(function (step, index) {
      var y = top + index * (boxH + gap);
      parts.push(
        '<rect x="12" y="' + y + '" width="316" height="' + boxH + '" rx="16" fill="#fffaf3" stroke="#eadcc8" stroke-width="2"/>',
        '<circle cx="42" cy="' + (y + boxH / 2) + '" r="14" fill="#1d6840"/>',
        '<text x="42" y="' + (y + boxH / 2 + 5) + '" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="800">' + (index + 1) + "</text>",
        '<text x="68" y="' + (y + 30) + '" font-size="18" font-weight="800" fill="#143f28">' + esc(step.title) + "</text>",
        '<text x="68" y="' + (y + 52) + '" font-size="14" font-weight="700" fill="#5c4636">' + esc(step.text) + "</text>"
      );
      if (index < steps.length - 1) {
        var y1 = y + boxH;
        var y2 = y + boxH + gap;
        var x = 170;
        parts.push(
          '<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + (y2 - 8) + '" stroke="#e07a2f" stroke-width="3"/>',
          '<path d="M ' + (x - 6) + " " + (y2 - 9) + " L " + (x + 6) + " " + (y2 - 9) + " L " + x + " " + y2 + ' Z" fill="#e07a2f"/>'
        );
      }
    });
    parts.push("</svg>");
    var list = steps.map(function (step) {
      return "<li>" + esc(step.title) + ": " + esc(step.text) + "</li>";
    }).join("");
    document.getElementById("flow").innerHTML =
      '<div class="flow-wrap">' + parts.join("") + "</div>" +
      '<ol class="sr-only">' + list + "</ol>";
  }

  function renderRules() {
    document.getElementById("rules-list").innerHTML = DATA.rules.map(function (rule) {
      return "<li><div><h3>" + esc(rule.title) + "</h3><p>" + esc(rule.text) + "</p></div></li>";
    }).join("");
  }

  function renderTrueCost() {
    var price = readNumber("tc-price");
    var uses = readNumber("tc-uses");
    var years = readNumber("tc-years");
    var upkeep = readNumber("tc-upkeep");
    var rate = readNumber("tc-rate");
    var out = document.getElementById("tc-out");
    if ([price, uses, years, upkeep, rate].some(function (n) { return n == null; })) {
      out.innerHTML = '<p class="error">Fill in every box with a number.</p>';
      return;
    }
    if (price < 0 || uses < 0 || years < 0 || upkeep < 0) {
      out.innerHTML = '<p class="error">Use zero or a positive number in each box.</p>';
      return;
    }
    if (rate <= -100) {
      out.innerHTML = '<p class="error">Use a yearly return above -100%.</p>';
      return;
    }
    var result = Calc.trueCost(price, uses, years, upkeep, rate);
    var tone = result.costPerUse <= 2 ? "good" : result.costPerUse <= 10 ? "maybe" : "bad";
    out.innerHTML =
      "<p>Total cost to own: <strong>" + moneyCents(result.total) + "</strong></p>" +
      "<p>Total uses: <strong>" + (isFinite(result.uses) ? result.uses : "—") + "</strong></p>" +
      "<p class=\"big\">Cost per use: " + moneyCents(result.costPerUse) + "</p>" +
      "<p>If that money earned " + rate + "% a year instead, in " + years + " years it could be about <strong>" + money(result.invested) + "</strong>. That return is a flat guess. Real markets do not stay flat.</p>" +
      '<p class="verdict ' + tone + '">' + esc(result.verdict) + "</p>" +
      "<p class=\"help\">Cost per use = (price + yearly upkeep × years) ÷ (uses per year × years).</p>";
  }

  ["tc-price", "tc-uses", "tc-years", "tc-upkeep", "tc-rate"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", renderTrueCost);
  });

  renderPicker();
  renderPanel(false);
  setPeriod("year", false);
  renderFlow();
  renderRules();
  renderTrueCost();
})();
