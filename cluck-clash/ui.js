(function () {
  var engine = window.CLUCK_ENGINE;
  var youSel = document.getElementById("deck-you");
  var rivalSel = document.getElementById("deck-rival");
  var board = document.getElementById("board");
  var game = null;
  var fast = /[?&]fast=1/.test(location.search);

  engine.decks.forEach(function (d) {
    var o = document.createElement("option");
    o.value = d.id;
    o.textContent = d.name;
    youSel.appendChild(o);
    rivalSel.appendChild(o.cloneNode(true));
  });
  youSel.value = "dawn";
  rivalSel.value = "night";
  var youBlurb = document.createElement("p");
  var rivalBlurb = document.createElement("p");
  youBlurb.className = "blurb";
  rivalBlurb.className = "blurb";
  youSel.parentNode.appendChild(youBlurb);
  rivalSel.parentNode.appendChild(rivalBlurb);
  function showBlurbs() {
    var y = engine.decks.filter(function (d) { return d.id === youSel.value; })[0];
    var r = engine.decks.filter(function (d) { return d.id === rivalSel.value; })[0];
    youBlurb.textContent = y.blurb;
    rivalBlurb.textContent = r.blurb;
  }
  youSel.addEventListener("change", showBlurbs);
  rivalSel.addEventListener("change", showBlurbs);
  showBlurbs();

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function remaining(r) { return Math.max(0, game.remaining(r)); }

  function roosterCard(r, activeId) {
    var tags = [];
    if (r.burn) tags.push("Burn");
    if (r.gear) tags.push(r.gear.name);
    if (r.sigUsed) tags.push("Signature used");
    var grain = game.grainTotal(r);
    return '<article class="rooster' + (r.ko ? " ko" : "") + (r.uid === activeId ? " is-active" : "") + '">' +
      '<div class="flock ' + esc(r.flock) + '"><span>' + esc(r.flock) + '</span><span>' + esc(r.emoji) + '</span></div>' +
      '<div class="art" aria-hidden="true">' + r.emoji + '</div>' +
      '<div class="name">' + esc(r.name) + '</div>' +
      '<div class="hp">' + (r.ko ? "KO" : remaining(r) + "/" + game.maxHp(r)) + ' HP</div>' +
      '<div class="meta">Grain ' + grain + ' · Switch ' + game.retreatCost(r) + ' · Weak ' + esc(r.weak) + '</div>' +
      '<div class="special"><b>' + esc(r.special.name) + '.</b> ' + esc(r.special.text) + '</div>' +
      r.attacks.map(function (a) {
        return '<div class="atk"><b>' + esc(a.name) + ' (' + a.cost + ').</b> ' + esc(a.text) + ' Hit ' + a.hit + '+.</div>';
      }).join("") +
      (tags.length ? '<div class="meta">' + esc(tags.join(" · ")) + '</div>' : '') +
      '</article>';
  }

  function handCard(c) {
    return '<article class="support"><div class="art" aria-hidden="true">' + c.emoji + '</div><div class="name">' + esc(c.name) + '</div><div class="meta">' + esc(c.type) + ' · ' + esc(c.flock) + '</div><div class="atk">' + esc(c.text) + '</div></article>';
  }

  function render() {
    if (!game) return;
    var you = game.players[0];
    var rival = game.players[1];
    var log = game.logLines.slice(-80).map(function (line) { return "<p>" + esc(line) + "</p>"; }).join("");
    var choices = "";
    if (game.winner == null && game.pending && game.pending.player === 0) {
      choices = '<p class="prompt">' + esc(game.pending.prompt) + '</p>' +
        game.pending.options.map(function (o) {
          return '<button type="button" data-choice="' + esc(o.id) + '">' + esc(o.label) + '</button>';
        }).join("");
    } else if (game.winner == null) {
      choices = '<p class="prompt">Rival is thinking…</p>';
    }
    var win = "";
    if (game.winner != null) {
      win = '<p class="winner">' + (game.winner === 0 ? "You win the coop!" : "Rival wins the coop.") + '</p><p>' + esc(game.winReason) + '</p><button type="button" id="again">Play again</button>';
    }
    var peek = game.peek === 1;
    board.hidden = false;
    board.innerHTML =
      '<div class="layout"><div class="play">' + win +
      '<section class="lane"><h2>Rival · ' + esc(rival.deckName) + ' · deck ' + rival.deck.length + ' · discard ' + rival.discard.length + (rival.coop ? " · Coop: " + esc(rival.coop.name) : "") + '</h2>' +
      '<div class="row">' + rival.lineup.map(function (r) { return roosterCard(r, rival.activeId); }).join("") + '</div>' +
      (peek ? '<div class="row">' + rival.hand.map(handCard).join("") + '</div>' : '<p class="backs">Hand: ' + rival.hand.length + ' card backs</p>') +
      '</section>' +
      '<section class="lane"><h2>You · ' + esc(you.deckName) + ' · main flock ' + esc(you.mainFlock) + ' · deck ' + you.deck.length + (you.coop ? " · Coop: " + esc(you.coop.name) : "") + '</h2>' +
      '<div class="row">' + you.lineup.map(function (r) { return roosterCard(r, you.activeId); }).join("") + '</div>' +
      '<div class="row">' + you.hand.map(handCard).join("") + '</div></section>' +
      '<div class="choices" id="choices">' + choices + '</div></div>' +
      '<aside class="side"><h2>Game log</h2><div class="log" id="log" aria-live="polite">' + log + '</div></aside></div>';
    var logEl = document.getElementById("log");
    if (logEl) logEl.scrollTop = logEl.scrollHeight;
    board.querySelectorAll("[data-choice]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        game.choose(btn.getAttribute("data-choice"));
        pump();
      });
    });
    var again = document.getElementById("again");
    if (again) again.addEventListener("click", start);
  }

  function pump() {
    render();
    if (!game || game.winner != null) return;
    if (game.pending && game.pending.player === 1) {
      setTimeout(function () {
        if (!game.pending || game.pending.player !== 1) return;
        game.choose(game.pickAi(game.pending));
        pump();
      }, fast ? 0 : 450);
    }
  }

  function start() {
    game = engine.createGame({
      seed: (Date.now() ^ (Math.floor(Math.random() * 99999))) >>> 0,
      deck0: youSel.value,
      deck1: rivalSel.value,
      human: 0
    });
    window.CLUCK_GAME = game;
    pump();
  }

  document.getElementById("start").addEventListener("click", start);
  window.CLUCK_UI = { start: start, get game() { return game; }, pump: pump };
})();
