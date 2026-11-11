(function () {
  var dataSet = null;
  var form = document.getElementById("compare-form");
  var selectA = document.getElementById("person-a");
  var selectB = document.getElementById("person-b");
  var summary = document.getElementById("comparison-summary");
  var cards = document.getElementById("cards");

  function money(value) {
    var parts = String(value).split(".");
    var cents = (parts[1] || "00").padEnd(2, "0").slice(0, 2);
    var whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return "$" + whole + "." + cents;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pointsText(points) {
    if (points === null || points === undefined) return "no data";
    return points.toFixed(1);
  }

  function fruitSvg(kind, mold, label) {
    var bodies = {
      apple: '<ellipse cx="80" cy="112" rx="46" ry="48" fill="#c4473a"/><ellipse cx="64" cy="96" rx="14" ry="10" fill="#e07a6a" fill-opacity="0.45"/>',
      pear: '<ellipse cx="80" cy="128" rx="40" ry="42" fill="#d2b84a"/><ellipse cx="80" cy="86" rx="26" ry="30" fill="#d2b84a"/><ellipse cx="68" cy="78" rx="10" ry="8" fill="#ead98a" fill-opacity="0.5"/>',
      peach: '<ellipse cx="80" cy="114" rx="46" ry="46" fill="#e39a6b"/><path d="M80 70 C86 100 86 140 80 158" fill="none" stroke="#c4784e" stroke-width="3"/>',
      plum: '<ellipse cx="80" cy="116" rx="42" ry="50" fill="#7d3f6c"/><ellipse cx="66" cy="100" rx="12" ry="9" fill="#a86b96" fill-opacity="0.45"/>',
      lemon: '<ellipse cx="80" cy="116" rx="52" ry="36" fill="#e2c84a" transform="rotate(-18 80 116)"/><ellipse cx="62" cy="104" rx="12" ry="8" fill="#f3e59a" fill-opacity="0.45" transform="rotate(-18 62 104)"/>',
      orange: '<circle cx="80" cy="116" r="46" fill="#e07a32"/><circle cx="80" cy="78" r="5" fill="#c4621e"/><ellipse cx="64" cy="100" rx="12" ry="8" fill="#f0a56a" fill-opacity="0.4"/>'
    };
    var spots = [[72, 100], [104, 92], [88, 124], [58, 118], [112, 126], [78, 80], [98, 142], [60, 140], [92, 108]];
    var count = Math.max(0, Math.min(spots.length, Math.round((mold || 0) / 100 * spots.length)));
    var spotSvg = spots.slice(0, count).map(function (spot, index) {
      var radius = 6 + (index % 3);
      return '<ellipse cx="' + spot[0] + '" cy="' + spot[1] + '" rx="' + radius + '" ry="' + (radius - 1) + '" fill="#3e5a34" fill-opacity="0.78"/>';
    }).join("");
    var wash = ((mold || 0) / 100 * 0.38).toFixed(3);
    return '<svg viewBox="0 0 160 190" role="img" aria-label="' + escapeHtml(label) + '">' +
      '<path d="M80 58 C80 40 96 36 100 24" fill="none" stroke="#6a4a32" stroke-width="3" stroke-linecap="round"/>' +
      '<ellipse cx="98" cy="40" rx="14" ry="8" fill="#6f8f4e" transform="rotate(-30 98 40)"/>' +
      (bodies[kind] || bodies.apple) +
      '<ellipse cx="80" cy="116" rx="34" ry="36" fill="#5d7344" fill-opacity="' + wash + '"/>' +
      spotSvg +
      "</svg>";
  }

  function linkList(items) {
    return items.map(function (item) {
      return '<li><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.label) + "</a></li>";
    }).join("");
  }

  function renderPerson(person, result) {
    var pac = result.parts[0];
    var missed = result.parts[1];
    var ethics = result.parts[2];
    var mold = result.mold;
    var moldLabel = mold === null ? "no data" : String(mold);
    var illustration = person.name + " illustrated as a " + person.fruit + ". Mold level " + moldLabel + " of 100. The fruit shape is decoration and is not part of the score.";
    var math = "no data";
    if (result.sum !== null) {
      var shown = result.parts.filter(function (part) { return part.points !== null; }).map(function (part) { return pointsText(part.points); });
      math = shown.join(" + ") + " = " + result.sum.toFixed(1);
      if (result.complete) math += ", which rounds to " + mold + ".";
      else math += ". With a missing component, that is " + result.sum.toFixed(1) + " of " + result.max + ", scaled to " + mold + ".";
    }

    var pacRaw = "no data";
    if (pac.points !== null) {
      pacRaw = money(person.pac.other_committee) + " other committee contributions out of " + money(person.pac.total_receipts) + " total receipts. Rounded share " + pac.rounded.toFixed(1) + " before the cap of 50.";
    }
    var missedRaw = "no data";
    if (missed.points !== null) {
      missedRaw = person.votes.missed + " Not Voting out of " + person.votes.eligible + " roll calls. " +
        person.votes.missed + " / " + person.votes.eligible + " × 100 × 3.5 rounds to " + missed.rounded.toFixed(1) + " before the cap of 35.";
    }
    var ethicsRaw = ethics.points === null ? "no data" : (ethics.points === 0 ? "No public finding or sanction on the sources checked." : "Documented tier on the sources checked.");

    var missedLinks = "";
    if (person.votes && person.votes.missed_roll_calls) {
      if (person.votes.missed_roll_calls.length) {
        missedLinks = '<details><summary>' + person.votes.missed_roll_calls.length + ' roll calls recorded as Not Voting</summary><ul>' +
          person.votes.missed_roll_calls.map(function (item) {
            return '<li><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.label) + "</a> — " + escapeHtml(item.question) + "</li>";
          }).join("") + "</ul></details>";
      } else if (missed.points !== null) {
        missedLinks = "<p>No roll call in this set records Not Voting.</p>";
      }
      var denom = (person.votes.denominator || []).slice();
      if (person.votes.speaker) denom.push(person.votes.speaker);
      if (denom.length) missedLinks += "<ul>" + linkList(denom) + "</ul>";
    }

    var context = "";
    if (person.pac && person.pac.individual) {
      context = "<p class=\"context\">Not scored, same FEC page: individual contributions " + money(person.pac.individual) +
        " (unitemized " + money(person.pac.unitemized_individual) + "), party committee contributions " + money(person.pac.party_committee) +
        ", transfers from other authorized committees " + money(person.pac.transfers) + ".</p>";
    }

    function metric(title, raw, points, recordHtml) {
      var pointLabel = points === null || points === undefined ? "no data" : points.toFixed(1) + " points";
      return '<section class="metric"><h3>' + escapeHtml(title) + ' <span class="pts">' + pointLabel + "</span></h3><p>" + escapeHtml(raw) + "</p>" + recordHtml + "</section>";
    }

    var pacRecord = person.pac
      ? '<p><a href="' + escapeHtml(person.pac.url) + '">' + escapeHtml(person.pac.label) + "</a></p>" + context
      : "<p>no data</p>";
    var ethicsRecord = "<ul>" + linkList(person.ethics.sources || []) + "</ul>";

    return '<article class="card">' +
      "<h2>" + escapeHtml(person.name) + "</h2>" +
      "<p class=\"who\">" + escapeHtml(person.office) + ", " + escapeHtml(person.district) + " · " + escapeHtml(person.party) + "</p>" +
      '<p class="identity"><a href="' + escapeHtml(person.identity.url) + '">' + escapeHtml(person.identity.label) + "</a></p>" +
      '<div class="fruit">' + fruitSvg(person.fruit, mold || 0, illustration) + "</div>" +
      '<p class="fruit-note">Illustration only. The fruit does not change the score.</p>' +
      '<p class="level"><span class="level-num">' + escapeHtml(moldLabel) + '</span> <span class="level-caption">mold level</span></p>' +
      '<p class="math">' + escapeHtml(math) + "</p>" +
      '<h3 class="breakdown-title">Score breakdown</h3>' +
      metric("Other-committee share of receipts, up to 50", pacRaw, pac.points, pacRecord) +
      metric("Missed-vote rate, up to 35", missedRaw, missed.points, missedLinks || "<p>no data</p>") +
      metric("Public ethics finding or sanction, up to 15", ethicsRaw, ethics.points, ethicsRecord) +
      '<p class="rule-link"><a href="methodology.html">Published rule</a></p></article>';
  }

  function personById(id) {
    return dataSet.politicians.filter(function (person) { return person.id === id; })[0] || null;
  }

  function fillSelect(select, selected) {
    select.innerHTML = dataSet.politicians.slice().sort(function (a, b) {
      return a.sort.localeCompare(b.sort);
    }).map(function (person) {
      return '<option value="' + escapeHtml(person.id) + '">' + escapeHtml(person.name) + " (" + escapeHtml(person.party) + ")</option>";
    }).join("");
    select.value = selected;
  }

  function compare(pushUrl) {
    if (!dataSet) return;
    var left = personById(selectA.value);
    var right = personById(selectB.value);
    if (!left || !right) return;
    if (left.id === right.id) {
      summary.textContent = "Choose two different people.";
      cards.innerHTML = "";
      return;
    }
    var a = MoldScore.scorePolitician(left);
    var b = MoldScore.scorePolitician(right);
    if (a.mold === null || b.mold === null) {
      summary.textContent = "One of these records is no data, so this pair cannot be scored.";
    } else if (a.mold === b.mold) {
      summary.textContent = "On this scale, both mold levels are " + a.mold + ".";
    } else if (a.mold < b.mold) {
      summary.textContent = "On this scale, " + left.name + " has a lower mold level (" + a.mold + ") than " + right.name + " (" + b.mold + ").";
    } else {
      summary.textContent = "On this scale, " + right.name + " has a lower mold level (" + b.mold + ") than " + left.name + " (" + a.mold + ").";
    }
    cards.innerHTML = renderPerson(left, a) + renderPerson(right, b);
    if (pushUrl && window.history && window.history.replaceState) {
      var url = "?a=" + encodeURIComponent(left.id) + "&b=" + encodeURIComponent(right.id);
      window.history.replaceState(null, "", url);
    }
  }

  function params() {
    var search = new URLSearchParams(window.location.search);
    return { a: search.get("a"), b: search.get("b") };
  }

  fetch("data.json")
    .then(function (response) {
      if (!response.ok) throw new Error("status " + response.status);
      return response.json();
    })
    .then(function (data) {
      dataSet = data;
      var query = params();
      var ids = data.politicians.map(function (person) { return person.id; });
      var first = ids.indexOf("bost") === -1 ? data.politicians.slice().sort(function (a, b) { return a.sort.localeCompare(b.sort); })[0].id : "bost";
      var second = ids.indexOf("budzinski") === -1 ? data.politicians.slice().sort(function (a, b) { return a.sort.localeCompare(b.sort); })[1].id : "budzinski";
      if (ids.indexOf(query.a) !== -1) first = query.a;
      if (ids.indexOf(query.b) !== -1) second = query.b;
      fillSelect(selectA, first);
      fillSelect(selectB, second);
      selectA.disabled = false;
      selectB.disabled = false;
      form.querySelector("button").disabled = false;
      compare(false);
    })
    .catch(function () {
      summary.textContent = "The records file did not load. Refresh the page.";
    });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    compare(true);
  });
  selectA.addEventListener("change", function () { compare(true); });
  selectB.addEventListener("change", function () { compare(true); });
})();
