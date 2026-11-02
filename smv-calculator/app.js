(function () {
  var form = document.getElementById("calc");
  var countrySelect = document.getElementById("country");
  var unitSelect = document.getElementById("height-unit");
  var cmInput = document.getElementById("height-cm");
  var ftInput = document.getElementById("height-ft");
  var inInput = document.getElementById("height-in");
  var incomeHelp = document.getElementById("income-help");
  var summary = document.getElementById("summary");
  var planHost = document.getElementById("plan");
  var sampleFlag = document.getElementById("sample-flag");
  var edited = false;
  var loading = false;

  var REGIONS = ["North America", "Latin America", "Europe", "Middle East", "Africa", "Asia and Pacific"];

  function $(id) { return document.getElementById(id); }

  function countryById(id) {
    for (var i = 0; i < SMV_DATA.countries.length; i++) {
      if (SMV_DATA.countries[i].id === id) return SMV_DATA.countries[i];
    }
    return SMV_DATA.countries[0];
  }

  function fillCountries() {
    var previous = countrySelect.value || "usa";
    countrySelect.innerHTML = "";
    REGIONS.forEach(function (region) {
      var group = document.createElement("optgroup");
      group.label = region;
      SMV_DATA.countries.filter(function (c) { return c.region === region; })
        .sort(function (a, b) { return a.name.localeCompare(b.name); })
        .forEach(function (c) {
          var opt = document.createElement("option");
          opt.value = c.id;
          opt.textContent = c.name;
          group.appendChild(opt);
        });
      countrySelect.appendChild(group);
    });
    countrySelect.value = previous;
  }

  function countryPhrase(country) {
    var needsThe = { usa: true, gbr: true, nld: true, phl: true, are: true };
    return (needsThe[country.id] ? "the " : "") + country.name;
  }

  function ordinal(n) {
    var v = n % 100;
    if (v >= 11 && v <= 13) return n + "th";
    switch (n % 10) {
      case 1: return n + "st";
      case 2: return n + "nd";
      case 3: return n + "rd";
      default: return n + "th";
    }
  }

  function cmFromImperial() {
    var ft = parseInt(ftInput.value, 10);
    var inch = parseInt(inInput.value, 10);
    if (!isFinite(ft) || !isFinite(inch)) return NaN;
    return (ft * 12 + inch) * 2.54;
  }

  function syncImperialFromCm() {
    var cm = parseFloat(cmInput.value);
    if (!isFinite(cm)) return;
    var total = Math.round(cm / 2.54);
    ftInput.value = String(Math.floor(total / 12));
    inInput.value = String(total % 12);
  }

  function heightCm() {
    if (unitSelect.value === "cm") return parseFloat(cmInput.value);
    return cmFromImperial();
  }

  function showHeightFields() {
    var metric = unitSelect.value === "cm";
    $("cm-field").hidden = !metric;
    $("ft-field").hidden = metric;
  }

  function readPerson() {
    return {
      age: parseInt($("age").value, 10),
      heightCm: heightCm(),
      looks: parseInt($("looks").value, 10),
      bodyFat: $("body-fat").value,
      strength: $("strength").value,
      style: parseInt($("style").value, 10),
      social: parseInt($("social").value, 10),
      humor: parseInt($("humor").value, 10),
      sleep: $("sleep").value,
      smoking: $("smoking").value,
      drinking: $("drinking").value,
      income: parseFloat($("income").value),
      netWorth: parseFloat($("net-worth").value),
      education: $("education").value,
      career: $("career").value,
      goals: $("goals").value
    };
  }

  function valid(person) {
    if (!isFinite(person.age) || person.age < 18 || person.age > 90) return "Age needs to be between 18 and 90.";
    if (!isFinite(person.heightCm) || person.heightCm < 140 || person.heightCm > 220) return "Height needs to be between 140 and 220 cm (about 4 ft 7 in to 7 ft 3 in).";
    if (!isFinite(person.income) || person.income < 0) return "Enter annual income as a number. Use 0 if you have none.";
    if (!isFinite(person.netWorth)) return "Enter net worth as a number. Use 0 if you are unsure. Negatives are allowed.";
    return "";
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function linkList(pairs) {
    var ul = el("ul", "links");
    pairs.forEach(function (pair) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = pair.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = pair.label;
      li.appendChild(a);
      ul.appendChild(li);
    });
    return ul;
  }

  function bulletList(items, className) {
    var ul = el("ul", className || "bullets");
    items.forEach(function (text) {
      ul.appendChild(el("li", "", text));
    });
    return ul;
  }

  function interpret(score) {
    if (score >= 8) return "This mix is strong on the things the page measures. Keep the habits that got you here, and still practice one small skill.";
    if (score >= 6.5) return "Solidly above the reference profile on this rough scale. The plan below is about the few bars that lag, not a rebuild of your life.";
    if (score >= 5) return "Close to the reference profile for your age and country. Small, repeated changes move the bars that can actually move.";
    return "Several bars are low. That is a starting point, not a label. Do the first short-term step this week and leave the rest alone until that one is in motion.";
  }

  function comparisons(person, country) {
    var lines = [];
    var diff = person.heightCm - country.height;
    var dir = diff >= 0 ? "above" : "below";
    lines.push("Height: " + person.heightCm.toFixed(1) + " cm is " + Math.abs(diff).toFixed(1) + " cm " + dir + " the male mean used for " + country.name + " (" + country.height.toFixed(1) + " cm, NCD-RisC, 19-year-old males, 2019). The worldwide mean used here is " + SMV_DATA.constants.heightWorldCm.toFixed(1) + " cm.");
    if (country.income) {
      var ratio = person.income / country.income.value;
      if (country.income.kind === "oecd") {
        lines.push("Income: " + SMVScore.money(person.income) + " is about " + ratio.toFixed(2) + " times the OECD average full-time wage for " + country.name + " (" + SMVScore.money(country.income.value) + " in purchasing-power dollars, " + country.income.year + "). That benchmark is an average for all employees, not a male median.");
      } else {
        lines.push("Income: " + SMVScore.money(person.income) + " is about " + ratio.toFixed(2) + " times the World Bank per-person median for " + country.name + ", annualized to " + SMVScore.money(country.income.value) + " (" + country.income.year + ", 2021 international dollars). " + (country.income.note ? country.income.note + " " : "") + "A paycheck is often higher than a per-person household figure, so this comparison is living-standards context.");
      }
    } else {
      lines.push("Income is not in the score for " + country.name + " because the embedded file has no paycheck or per-person median for it. Height is still compared. The earning ideas in the plan point at public job services.");
    }
    if (country.wealth) {
      var ref = country.wealth * SMVScore.ageFactor(person.age);
      var wr = person.netWorth / ref;
      lines.push("Net worth: " + SMVScore.money(person.netWorth) + " compared with about " + SMVScore.money(ref) + ", this page's age-adjusted read of the " + SMVScore.money(country.wealth) + " median wealth per adult in " + country.name + " (UBS/Credit Suisse, end-2022).");
    } else {
      lines.push("Net worth is not in the score for " + country.name + " because that median is not in the embedded UBS table. Worldwide, about " + SMVScore.money(SMV_DATA.constants.worldWealthMedian) + " was the end-2022 threshold to be in the wealthier half of adults.");
    }
    lines.push("Worldwide income context: the World Bank global median, via Our World in Data, is about " + SMVScore.money(SMV_DATA.constants.worldIncomeAnnual) + " per person per year (latest world aggregate in that series, " + SMV_DATA.constants.worldIncomeYear + ", extrapolated, 2021 international dollars). Comparing a paycheck with a per-person figure overstates how unusual a salary is. It is context, not a trophy.");
    return lines;
  }

  function renderChart(cats) {
    var chart = el("div", "chart");
    chart.setAttribute("role", "list");
    chart.setAttribute("aria-label", "Category scores out of 10");
    cats.forEach(function (cat) {
      var row = el("div", "chart-row" + (cat.score < 5 ? " is-low" : ""));
      row.setAttribute("role", "listitem");
      var top = el("div", "chart-top");
      top.appendChild(el("span", "chart-name", cat.label));
      top.appendChild(el("span", "chart-num", cat.score.toFixed(1)));
      var track = el("div", "track");
      track.setAttribute("aria-hidden", "true");
      var fill = el("div", "fill");
      fill.style.width = (cat.score / 10 * 100) + "%";
      track.appendChild(fill);
      row.appendChild(top);
      row.appendChild(track);
      if (cat.detail && (cat.id === "height" || cat.id === "income" || cat.id === "wealth" || cat.id === "age")) {
        row.appendChild(el("p", "chart-note", cat.detail));
      }
      chart.appendChild(row);
    });
    return chart;
  }

  function renderPlan(plan) {
    var wrap = el("div", "plan");
    wrap.appendChild(el("h3", "", "Action plan"));
    wrap.appendChild(el("p", "lead", "The three lowest bars, with something you can do. Age is never on this list. Relationship goals shape the last section and do not change the score."));
    var call = el("div", "callout");
    call.appendChild(el("p", "callout-kicker", "Do this one first"));
    call.appendChild(el("p", "", plan.firstStep));
    wrap.appendChild(call);

    plan.items.forEach(function (item, index) {
      var section = el("section", "plan-item");
      section.appendChild(el("h4", "", (index + 1) + ". " + item.title));
      section.appendChild(el("p", "", item.lead));
      section.appendChild(el("h5", "", "Skills to practice"));
      section.appendChild(bulletList(item.skills));
      section.appendChild(el("h5", "", "This month"));
      section.appendChild(bulletList(item.short));
      section.appendChild(el("h5", "", "About six months"));
      section.appendChild(bulletList(item.medium));
      section.appendChild(el("h5", "", "About two years"));
      section.appendChild(bulletList(item.long));
      if (item.local) {
        var box = el("div", "local");
        box.appendChild(el("h5", "", item.local.heading));
        box.appendChild(el("p", "", item.local.text));
        box.appendChild(linkList(item.local.links));
        section.appendChild(box);
      }
      wrap.appendChild(section);
    });

    var keep = el("section", "plan-item");
    keep.appendChild(el("h4", "", "Keep these going"));
    var names = plan.strengths.map(function (c) { return c.label + " (" + c.score.toFixed(1) + ")"; }).join(" and ");
    keep.appendChild(el("p", "", "Highest bars right now: " + names + ". Do not drop a strength to chase a weak bar. Protect the habit that already works, and add one short-term step from the list above."));
    wrap.appendChild(keep);

    var goals = el("section", "plan-item");
    goals.appendChild(el("h4", "", plan.goals.title));
    goals.appendChild(bulletList(plan.goals.points));
    wrap.appendChild(goals);

    wrap.appendChild(el("p", "close", "You do not have to overhaul your life. One short-term step, done this week, is the whole assignment."));
    return wrap;
  }

  function render(person, country) {
    var problem = valid(person);
    summary.innerHTML = "";
    planHost.innerHTML = "";
    if (problem) {
      summary.appendChild(el("p", "warn", problem));
      $("sticky-score").textContent = "—";
      $("live-status").textContent = problem;
      return;
    }
    var result = SMVScore.compute(person, country);
    var plan = SMVPlans.build(person, country, result);

    var hero = el("div", "hero-score");
    var kicker = el("p", "kicker", edited ? "Your estimate" : "Sample result");
    hero.appendChild(kicker);
    hero.appendChild(el("p", "score-num", result.overall.toFixed(1)));
    hero.appendChild(el("p", "score-of", "out of 10"));
    hero.appendChild(el("p", "disclaimer", "A rough, for-fun estimate. Not science, not medicine, and not a measure of your worth or anyone else's."));
    hero.appendChild(el("p", "", interpret(result.overall)));
    summary.appendChild(hero);

    var perc = el("div", "percents");
    perc.appendChild(el("p", "", "Among men your age in " + countryPhrase(country) + ": about the " + ordinal(result.countryPercentile) + " percentile."));
    perc.appendChild(el("p", "", "Among men worldwide: about the " + ordinal(result.worldPercentile) + " percentile."));
    perc.appendChild(el("p", "fine", "“Men your age” is a framing device. Age is held constant, and height uses male figures. Income and wealth sources are not limited to men of one age. The reference profile scores " + result.reference.toFixed(1) + " on this same scale. Read How this is calculated before you quote the number."));
    summary.appendChild(perc);

    summary.appendChild(el("h3", "", "Category breakdown"));
    summary.appendChild(renderChart(result.categories));

    var cmp = el("section", "compare");
    cmp.appendChild(el("h3", "", "How you sit against the public figures"));
    comparisons(person, country).forEach(function (line) {
      cmp.appendChild(el("p", "", line));
    });
    summary.appendChild(cmp);
    planHost.appendChild(renderPlan(plan));

    $("sticky-score").textContent = result.overall.toFixed(1);
    $("sticky-country").textContent = country.name + " · " + ordinal(result.countryPercentile);
    $("sticky-world").textContent = "World · " + ordinal(result.worldPercentile);
    var live = "Score " + result.overall.toFixed(1) + " out of 10. About the " + ordinal(result.countryPercentile) + " percentile in " + countryPhrase(country) + ", and about the " + ordinal(result.worldPercentile) + " worldwide.";
    if ($("live-status").textContent !== live) $("live-status").textContent = live;
  }

  function incomeHelpText(country) {
    if (!country.income) {
      return "No paycheck benchmark is embedded for " + country.name + ". You can still enter income; it will not move the score. Height is still compared.";
    }
    if (country.income.kind === "oecd") {
      return "Benchmark for " + country.name + ": about " + SMVScore.money(country.income.value) + " (OECD average full-time wage, " + country.income.year + ", US dollars at purchasing-power parity). In the United States, that is close to ordinary dollars. Elsewhere, a purchasing-power dollar buys a similar basket to a US dollar, so a market-rate conversion is only a rough match. Enter your pre-tax annual pay.";
    }
    var extra = country.income.note ? " " + country.income.note : "";
    return "Benchmark for " + country.name + ": about " + SMVScore.money(country.income.value) + " per person per year (World Bank median income or consumption, " + country.income.year + ")." + extra + " This is not a typical salary. A single adult's pay is often higher than a per-person household figure.";
  }

  function refresh() {
    var country = countryById(countrySelect.value);
    incomeHelp.textContent = incomeHelpText(country);
    ["looks", "style", "social", "humor", "age"].forEach(function (id) {
      $(id + "-out").textContent = $(id).value;
    });
    render(readPerson(), country);
  }

  function applySample() {
    loading = true;
    edited = false;
    countrySelect.value = "usa";
    $("age").value = "34";
    unitSelect.value = "ft";
    ftInput.value = "5";
    inInput.value = "11";
    cmInput.value = "180";
    $("looks").value = "6";
    $("body-fat").value = "fit";
    $("strength").value = "consistent";
    $("sleep").value = "five";
    $("smoking").value = "never";
    $("drinking").value = "moderate";
    $("style").value = "4";
    $("social").value = "5";
    $("humor").value = "7";
    $("income").value = "72000";
    $("net-worth").value = "40000";
    $("education").value = "bachelor";
    $("career").value = "skilled";
    $("goals").value = "family";
    showHeightFields();
    sampleFlag.hidden = false;
    refresh();
    loading = false;
  }

  fillCountries();
  showHeightFields();

  form.addEventListener("input", function (event) {
    if (event.target.id === "height-cm") syncImperialFromCm();
    if (event.target.id === "height-ft" || event.target.id === "height-in") {
      var cm = cmFromImperial();
      if (isFinite(cm)) cmInput.value = cm.toFixed(1);
    }
    if (!loading) {
      edited = true;
      sampleFlag.hidden = true;
    }
    refresh();
  });

  unitSelect.addEventListener("change", function () {
    if (unitSelect.value === "ft") syncImperialFromCm();
    showHeightFields();
    refresh();
  });

  $("reset-sample").addEventListener("click", function () {
    applySample();
    summary.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  applySample();
})();
