(function () {
  var KEY = "dukktape-b2b-sales-course-v1";
  var lessons = (window.B2BLessonsA || []).concat(window.B2BLessonsB || []);
  var practice = window.B2BPractice;
  var math = window.B2BMath;
  var state = load() || {};

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); }
    catch (err) { return null; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); setNote(true); }
    catch (err) { setNote(false); }
  }
  function setNote(ok) {
    var el = document.getElementById("storage-note");
    if (!el) return;
    el.textContent = ok
      ? "Practice notes stay in this browser only. They are not uploaded, not a backup, and not shared. Export a JSON file if you want a copy."
      : "This browser is not storing notes. You can still read and use Download.";
  }
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function paras(parent, lines) {
    (lines || []).forEach(function (line) { parent.appendChild(el("p", "", line)); });
  }
  function bullets(parent, lines) {
    var ul = document.createElement("ul");
    (lines || []).forEach(function (line) { ul.appendChild(el("li", "", line)); });
    parent.appendChild(ul);
  }

  function renderLessons() {
    var root = document.getElementById("lessons");
    var toc = document.getElementById("lesson-links");
    lessons.forEach(function (lesson, index) {
      var link = el("a", "", (index + 1) + ". " + lesson.title);
      link.href = "#lesson-" + lesson.id;
      toc.appendChild(link);
      var article = el("article", "lesson");
      article.id = "lesson-" + lesson.id;
      article.appendChild(el("p", "meta", "Lesson " + (index + 1) + " of " + lessons.length + " · about " + lesson.minutes + " minutes of reading and practice · prerequisite: " + lesson.prereq));
      article.appendChild(el("h2", "", lesson.title));
      article.appendChild(el("p", "", "Objective: " + lesson.objective));
      article.appendChild(el("h3", "", "Concept"));
      paras(article, lesson.concept);
      article.appendChild(el("h3", "", "How to do it"));
      var ol = document.createElement("ol");
      lesson.steps.forEach(function (step) { ol.appendChild(el("li", "", step)); });
      article.appendChild(ol);
      if (lesson.dialogue) {
        article.appendChild(el("h3", "", "Worked dialogue"));
        var turns = document.createElement("ol");
        lesson.dialogue.forEach(function (turn) {
          turns.appendChild(el("li", "", turn[0] + ": " + turn[1]));
        });
        article.appendChild(turns);
        article.appendChild(el("p", "meta", lesson.dialogue.length + " turns in the worked example. Add the two turns in the assignment before you score it."));
      }
      article.appendChild(el("h3", "", "Worked example"));
      paras(article, lesson.example);
      article.appendChild(el("h3", "", "A common miss, rewritten"));
      article.appendChild(el("p", "bad", "Miss: " + lesson.bad));
      article.appendChild(el("p", "good", "Rewrite: " + lesson.good));
      article.appendChild(el("p", "", lesson.why));
      article.appendChild(el("h3", "", "Assignment"));
      article.appendChild(el("p", "", lesson.assignment));
      var details = document.createElement("details");
      details.className = "answer";
      details.appendChild(el("summary", "", "Sample answer and pass bar"));
      paras(details, lesson.sample);
      details.appendChild(el("p", "", "You pass this lesson's practice when:"));
      bullets(details, lesson.pass);
      article.appendChild(details);
      var done = el("label", "");
      var box = document.createElement("input");
      box.type = "checkbox";
      box.checked = !!(state.done && state.done[lesson.id]);
      box.addEventListener("change", function () {
        state.done = state.done || {};
        state.done[lesson.id] = box.checked;
        save();
        renderProgress();
      });
      done.appendChild(box);
      done.appendChild(document.createTextNode(" I finished this assignment in my notes. This checkbox is my record, not a grade."));
      article.appendChild(done);
      root.appendChild(article);
    });
  }

  function renderProgress() {
    var done = state.done || {};
    var count = lessons.filter(function (lesson) { return done[lesson.id]; }).length;
    document.getElementById("progress").textContent = count + " of " + lessons.length + " assignments marked done in this browser.";
  }

  function renderGlossary() {
    var table = document.createElement("table");
    window.B2BGlossary.forEach(function (pair) {
      var tr = document.createElement("tr");
      tr.appendChild(el("th", "", pair[0]));
      tr.appendChild(el("td", "", pair[1]));
      table.appendChild(tr);
    });
    document.getElementById("glossary").appendChild(table);
  }

  function renderQuiz() {
    var root = document.getElementById("quiz");
    state.quiz = state.quiz || {};
    practice.quizzes.forEach(function (item, index) {
      var block = el("fieldset", "card");
      block.appendChild(el("legend", "", "Check " + (index + 1)));
      block.appendChild(el("p", "", item.q));
      item.options.forEach(function (option, optionIndex) {
        var label = el("label", "");
        var radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "quiz-" + index;
        radio.value = String(optionIndex);
        if (String(state.quiz[index]) === String(optionIndex)) radio.checked = true;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(" " + option));
        block.appendChild(label);
      });
      var result = el("p", "meta", "");
      var button = el("button", "", "Check this answer");
      button.type = "button";
      button.addEventListener("click", function () {
        var chosen = block.querySelector("input:checked");
        if (!chosen) { result.textContent = "Pick one first."; return; }
        state.quiz[index] = Number(chosen.value);
        save();
        var right = Number(chosen.value) === item.correct;
        result.textContent = (right ? "That matches the course. " : "Not the course answer. ") + item.why;
      });
      block.appendChild(button);
      block.appendChild(result);
      root.appendChild(block);
    });
  }

  function renderRole(play) {
    var box = el("article", "card");
    box.id = "role-" + play.id;
    box.appendChild(el("h3", "", play.title));
    box.appendChild(el("p", "", play.setup));
    var log = el("div", "");
    var choices = el("div", "");
    var path = (state.roles && state.roles[play.id]) || [];
    function show(id, push) {
      var current = play.nodes[id];
      log.appendChild(el("p", "", current.say));
      choices.replaceChildren();
      if (push) {
        path.push(id);
        state.roles = state.roles || {};
        state.roles[play.id] = path.slice();
        save();
      }
      if (current.model) {
        choices.appendChild(el("p", "good", "Model note: " + current.model));
        return;
      }
      (current.choices || []).forEach(function (item) {
        var button = el("button", "choice", item.label);
        button.type = "button";
        button.addEventListener("click", function () { show(item.to, true); });
        choices.appendChild(button);
      });
    }
    path.forEach(function (id, index) { show(id, false); });
    if (!path.length) show(play.start, true);
    var restart = el("button", "", "Restart this roleplay");
    restart.type = "button";
    restart.addEventListener("click", function () {
      path = [];
      log.replaceChildren();
      state.roles[play.id] = [];
      save();
      show(play.start, true);
    });
    box.appendChild(log);
    box.appendChild(choices);
    box.appendChild(restart);
    return box;
  }

  function renderPractice() {
    var roles = document.getElementById("roleplays");
    practice.roleplays.forEach(function (play) { roles.appendChild(renderRole(play)); });
    var drills = document.getElementById("drills");
    practice.drills.forEach(function (drill) {
      var details = document.createElement("details");
      details.className = "card answer";
      details.appendChild(el("summary", "", drill.prompt));
      details.appendChild(el("p", "bad", "Weak: " + drill.weak));
      details.appendChild(el("p", "good", "Stronger: " + drill.stronger));
      drills.appendChild(details);
    });
    var score = document.getElementById("scorecard");
    state.scores = state.scores || {};
    practice.scorecard.forEach(function (line, index) {
      var label = el("label", "");
      var select = document.createElement("select");
      ["0 not yet", "1 partly", "2 observable"].forEach(function (name, value) {
        var option = el("option", "", name);
        option.value = String(value);
        if (String(state.scores[index] || 0) === String(value)) option.selected = true;
        select.appendChild(option);
      });
      select.addEventListener("change", function () {
        state.scores[index] = Number(select.value);
        save();
        tally();
      });
      label.appendChild(select);
      label.appendChild(document.createTextNode(" " + line));
      score.appendChild(label);
    });
    var tallyText = el("p", "", "");
    score.appendChild(tallyText);
    function tally() {
      var total = practice.scorecard.reduce(function (sum, line, index) { return sum + Number(state.scores[index] || 0); }, 0);
      var fails = (state.fails || []).some(Boolean);
      tallyText.textContent = "Self-score " + total + " of " + (practice.scorecard.length * 2) + ". This is your count, not an employer's grade." + (fails ? " A critical fail is checked, so the practice bar is not met." : "");
    }
    var failBox = document.getElementById("fails");
    state.fails = state.fails || [];
    practice.criticalFails.forEach(function (line, index) {
      var label = el("label", "");
      var box = document.createElement("input");
      box.type = "checkbox";
      box.checked = !!state.fails[index];
      box.addEventListener("change", function () { state.fails[index] = box.checked; save(); tally(); });
      label.appendChild(box);
      label.appendChild(document.createTextNode(" " + line));
      failBox.appendChild(label);
    });
    tally();
  }

  function wireCase() {
    var form = document.getElementById("case-form");
    var out = document.getElementById("case-out");
    function run() {
      var data = {};
      Array.prototype.forEach.call(form.elements, function (node) { if (node.name) data[node.name] = node.value; });
      state.case = data;
      save();
      var result = math.businessCase(data);
      out.replaceChildren();
      if (!result.ok) {
        result.errors.forEach(function (error) { out.appendChild(el("p", "bad", error)); });
        return;
      }
      var r = result.results;
      var money = function (n) { return n.toLocaleString("en-US", { style: "currency", currency: "USD" }); };
      out.appendChild(el("p", "", "Hours freed: " + r.hoursFreed.toFixed(2) + ". Capacity, not cash: " + money(r.capacityDollars) + "."));
      out.appendChild(el("p", "", "Verified cash benefit: " + money(r.cashBenefit) + ". Monthly cost: " + money(r.cashCost) + ". Monthly net cash: " + money(r.monthlyNetCash) + "."));
      var pay = "Payback is blank because monthly net cash is not positive. Do not fill the blank with capacity dollars.";
      if (r.paybackStatus === "immediate") pay = "Payback is 0 months because implementation cash is 0 and monthly net cash is positive.";
      if (r.paybackStatus === "months") pay = "Payback is " + r.paybackMonths.toFixed(2) + " months. That is implementation divided by monthly net cash.";
      out.appendChild(el("p", "", pay));
      out.appendChild(el("p", "meta", "First-year net cash, twelve months minus implementation: " + money(r.firstYearNetCash) + "."));
    }
    form.addEventListener("input", run);
    document.getElementById("harbor-sample").addEventListener("click", function () {
      var sample = { ordersPerMonth: "1200", minutesNow: "8", minutesWithTool: "8", adoptionPct: "100", hourlyCashCost: "22", overtimeCash: "1200", avoidedHireCash: "0", cancelledToolCash: "600", nonLaborCash: "400", subscriptionMonthly: "1500", otherMonthlyCost: "0", implementationCash: "12000" };
      Object.keys(sample).forEach(function (key) { form.elements[key].value = sample[key]; });
      run();
    });
    if (state.case) Object.keys(state.case).forEach(function (key) { if (form.elements[key]) form.elements[key].value = state.case[key]; });
    run();
  }

  function wireMail() {
    var form = document.getElementById("mail-form");
    var out = document.getElementById("mail-out");
    function run() {
      var subject = form.subject.value.trim();
      var body = form.body.value;
      var problems = [];
      if (!subject) problems.push("The subject is empty.");
      if (/^\s*re:/i.test(subject)) problems.push("The subject starts like a reply. Use that only when they actually wrote first.");
      if (!/this is a sales email|this is an advertisement/i.test(body)) problems.push("Say, in the body, that this is a sales email or an advertisement.");
      if (!/reply stop|opt out|opt-out/i.test(body)) problems.push("Include a way to stop, such as reply STOP.");
      if (!/\[YOUR COMPANY STREET/i.test(body) && !/\d{2,} .+, [A-Z]{2} \d{5}/.test(body)) problems.push("Include the postal placeholder or a real street address. Do not invent one.");
      if (/\[YOUR COMPANY STREET/i.test(body)) problems.push("The postal line is still a placeholder, so this copy is not ready to send.");
      state.mail = { subject: subject, body: body };
      save();
      out.replaceChildren();
      if (!problems.length) out.appendChild(el("p", "good", "The teaching checks pass, and you still do not send it from this page."));
      problems.forEach(function (problem) { out.appendChild(el("p", "bad", problem)); });
    }
    form.addEventListener("input", run);
    run();
  }

  function wirePlans() {
    ["sdr", "ae", "plan"].forEach(function (name) {
      var box = document.getElementById(name + "-notes");
      if (!box) return;
      if (state[name]) box.value = state[name];
      box.addEventListener("input", function () { state[name] = box.value; save(); });
    });
  }

  function wireSearch() {
    var input = document.getElementById("search");
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      document.querySelectorAll("article.lesson, #glossary tr, .card").forEach(function (node) {
        if (!query) { node.classList.remove("hidden-hit"); return; }
        var hit = node.textContent.toLowerCase().indexOf(query) !== -1;
        node.classList.toggle("hidden-hit", !hit);
      });
    });
  }

  document.getElementById("export-json").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = el("a", "", "");
    link.href = url;
    link.download = "b2b-sales-practice.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });
  document.getElementById("reset-all").addEventListener("click", function () {
    if (!window.confirm("Erase the practice saved in this browser? The lessons stay on the page.")) return;
    try { localStorage.removeItem(KEY); } catch (err) {}
    window.location.reload();
  });
  document.getElementById("open-answers").addEventListener("click", function () {
    document.querySelectorAll("details").forEach(function (item) { item.open = true; });
  });
  window.addEventListener("beforeprint", function () {
    document.querySelectorAll("details").forEach(function (item) { item.open = true; });
  });

  renderLessons();
  renderGlossary();
  renderQuiz();
  renderPractice();
  renderProgress();
  wireCase();
  wireMail();
  wirePlans();
  wireSearch();
  setNote(true);
})();
