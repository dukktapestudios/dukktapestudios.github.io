(function () {
  var engine = window.CLUCK_ENGINE;
  var art = window.CLUCK_ART;
  var youSel = document.getElementById("deck-you");
  var rivalSel = document.getElementById("deck-rival");
  var board = document.getElementById("board");
  var game = null;
  var fast = /[?&]fast=1/.test(location.search);
  var drag = null;
  var speechOk = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  var speakingKey = null;
  var speakToken = 0;

  function speakerIcon(stop) {
    if (stop) return '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="4" width="8" height="8" rx="1" fill="#1c140c"/></svg>';
    return '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="#1c140c" d="M2 6h2.2L8 3.2v9.6L4.2 10H2z"/><path fill="none" stroke="#1c140c" stroke-width="1.4" stroke-linecap="round" d="M10.2 6.2a2.6 2.6 0 0 1 0 3.6M12 4.4a5 5 0 0 1 0 7.2"/></svg>';
  }

  if (speechOk) {
    document.querySelectorAll(".speak[hidden]").forEach(function (btn) {
      btn.hidden = false;
      btn.innerHTML = speakerIcon(false);
    });
  }

  function speakBtn(key) {
    if (!speechOk) return "";
    var on = speakingKey === key;
    return '<button type="button" class="speak' + (on ? " is-speaking" : "") + '" data-speak="' + esc(key) + '" aria-pressed="' + (on ? "true" : "false") + '" aria-label="' + (on ? "Stop reading" : "Read aloud") + '">' + speakerIcon(on) + "</button>";
  }

  function plainText(el) {
    var bits = [];
    el.querySelectorAll("h2, p, li, .flock, .name, .hp, .meta, .special, .atk").forEach(function (node) {
      if (node.closest(".speak")) return;
      var t = (node.innerText || "").replace(/\s+/g, " ").trim();
      if (t) bits.push(t);
    });
    if (!bits.length) {
      var copy = el.cloneNode(true);
      copy.querySelectorAll(".speak, svg, .illu").forEach(function (n) { n.remove(); });
      return (copy.innerText || "").replace(/\s+/g, " ").trim();
    }
    return bits.join(". ");
  }

  function latestLogText() {
    if (!game) return "";
    var lines = game.logLines;
    var start = 0;
    for (var i = lines.length - 1; i >= 0; i--) {
      if (lines[i].indexOf("· turn") !== -1) { start = i; break; }
    }
    return lines.slice(start).slice(-6).join(" ");
  }

  function markSpeaking() {
    document.querySelectorAll(".speak").forEach(function (btn) {
      var on = btn.getAttribute("data-speak") === speakingKey;
      btn.classList.toggle("is-speaking", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.setAttribute("aria-label", on ? "Stop reading" : "Read aloud");
      btn.innerHTML = speakerIcon(on);
    });
  }

  function stopSpeech() {
    speakToken += 1;
    speakingKey = null;
    try { window.speechSynthesis.cancel(); } catch (err) {}
    markSpeaking();
  }

  function startSpeech(key, text) {
    stopSpeech();
    if (!text) return;
    var token = speakToken;
    speakingKey = key;
    markSpeaking();
    var utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1;
    utter.onend = utter.onerror = function () {
      if (token !== speakToken || speakingKey !== key) return;
      speakingKey = null;
      markSpeaking();
    };
    try { window.speechSynthesis.speak(utter); } catch (err) { stopSpeech(); }
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".speak");
    if (!btn || !speechOk) return;
    e.preventDefault();
    e.stopPropagation();
    var key = btn.getAttribute("data-speak");
    if (speakingKey === key) { stopSpeech(); return; }
    var text = key === "log" ? latestLogText() : plainText(btn.closest("[data-speak-root]") || btn.parentElement);
    startSpeech(key, text);
  });

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

  function roosterCard(r, activeId, owner) {
    var tags = [];
    if (r.burn) tags.push("Burn");
    if (r.gear) tags.push(r.gear.name);
    if (r.sigUsed) tags.push("Signature used");
    var grain = game.grainTotal(r);
    var isYou = owner === 0;
    var isActive = r.uid === activeId;
    var attrs = ' data-uid="' + esc(r.uid) + '"';
    if (!r.ko && isYou) {
      attrs += ' data-drop="ally"' + (isActive ? ' data-active="1"' : ' data-drag="bench"');
    }
    if (!r.ko && !isYou) attrs += ' data-drop="enemy"' + (isActive ? ' data-active="1"' : "");
    var attacks = r.attacks.map(function (a, idx) {
      var dragAtk = isYou && isActive && !r.ko ? ' data-drag="attack" data-index="' + idx + '"' : "";
      return '<div class="atk"' + dragAtk + '><b>' + esc(a.name) + " (" + a.cost + ").</b> " + esc(a.text) + " Hit " + a.hit + "+.</div>";
    }).join("");
    var specialDrag = isYou && isActive && !r.ko && r.special.type === "signature" && !r.sigUsed ? ' data-drag="signature"' : "";
    return '<article class="rooster' + (r.ko ? " ko" : "") + (isActive ? " is-active" : "") + '" data-speak-root' + attrs + ">" +
      '<div class="flock ' + esc(r.flock) + '"><span>' + esc(r.flock) + "</span></div>" +
      '<div class="art">' + art.forRooster(r.defId) + "</div>" +
      '<div class="speak-row">' + speakBtn("rooster-" + r.uid) + "</div>" +
      '<div class="name">' + esc(r.name) + "</div>" +
      '<div class="hp">' + (r.ko ? "KO" : remaining(r) + "/" + game.maxHp(r)) + " HP</div>" +
      '<div class="meta">Grain ' + grain + " · Switch " + game.retreatCost(r) + " · Weak " + esc(r.weak) + "</div>" +
      '<div class="special"' + specialDrag + "><b>" + esc(r.special.name) + ".</b> " + esc(r.special.text) + "</div>" +
      attacks +
      (tags.length ? '<div class="meta">' + esc(tags.join(" · ")) + "</div>" : "") +
      "</article>";
  }

  function handCard(c) {
    return '<article class="support" data-speak-root data-drag="hand" data-card="' + esc(c.id) + '">' +
      '<div class="art">' + art.forSupport(c.id) + "</div>" +
      '<div class="speak-row">' + speakBtn("card-" + c.id) + "</div>" +
      '<div class="name">' + esc(c.name) + "</div>" +
      '<div class="meta">' + esc(c.type) + " · " + esc(c.flock) + "</div>" +
      '<div class="atk">' + esc(c.text) + "</div></article>";
  }

  function render() {
    if (!game) return;
    var you = game.players[0];
    var rival = game.players[1];
    var log = game.logLines.slice(-80).map(function (line) { return "<p>" + esc(line) + "</p>"; }).join("");
    var choices = "";
    if (game.winner == null && game.pending && game.pending.player === 0) {
      choices = '<p class="prompt">' + esc(game.pending.prompt) + "</p>" +
        '<p class="drag-hint">Or drag: Grain onto a rooster, a card onto a gold outline, a bench rooster onto your active, or an attack onto the enemy.</p>' +
        game.pending.options.map(function (o) {
          return '<button type="button" data-choice="' + esc(o.id) + '">' + esc(o.label) + "</button>";
        }).join("");
    } else if (game.winner == null) {
      choices = '<p class="prompt">Rival is thinking…</p>';
    }
    var win = "";
    if (game.winner != null) {
      win = '<p class="winner">' + (game.winner === 0 ? "You win the coop!" : "Rival wins the coop.") + "</p><p>" + esc(game.winReason) + '</p><button type="button" id="again">Play again</button>';
    }
    var peek = game.peek === 1;
    board.hidden = false;
    board.innerHTML =
      '<div class="layout"><div class="play">' + win +
      '<section class="lane"><h2>Rival · ' + esc(rival.deckName) + " · deck " + rival.deck.length + " · discard " + rival.discard.length + (rival.coop ? " · Coop: " + esc(rival.coop.name) : "") + "</h2>" +
      '<div class="row">' + rival.lineup.map(function (r) { return roosterCard(r, rival.activeId, 1); }).join("") + "</div>" +
      (peek ? '<div class="row">' + rival.hand.map(handCard).join("") + "</div>" : '<p class="backs">Hand: ' + rival.hand.length + " card backs</p>") +
      "</section>" +
      '<section class="lane" id="you-lane"><h2>You · ' + esc(you.deckName) + " · main flock " + esc(you.mainFlock) + " · deck " + you.deck.length + (you.coop ? " · Coop: " + esc(you.coop.name) : "") + "</h2>" +
      '<div class="row">' + you.lineup.map(function (r) { return roosterCard(r, you.activeId, 0); }).join("") + "</div>" +
      '<div class="play-mat" data-drop="play">Drop a Coop or a ready Action here</div>' +
      '<div class="row" id="hand">' + you.hand.map(handCard).join("") + "</div></section>" +
      '<div class="choices" id="choices">' + choices + "</div></div>" +
      '<aside class="side"><div class="log-head"><h2>Game log</h2>' + speakBtn("log") + '</div><div class="log" id="log" aria-live="polite">' + log + "</div></aside></div>";
    var logEl = document.getElementById("log");
    if (logEl) logEl.scrollTop = logEl.scrollHeight;
    board.querySelectorAll("[data-choice]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (drag && drag.started) return;
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

  function zonesFor(info) {
    var pending = game && game.pending;
    if (!pending || pending.player !== 0) return [];
    var zones = [];
    if ((pending.kind === "feed" || pending.kind === "hoarder") && info.kind === "hand") {
      pending.options.forEach(function (o) {
        if (o.card === info.card) zones.push({ selector: '[data-drop="ally"][data-uid="' + o.uid + '"]', run: function () { game.choose(o.id); } });
      });
    }
    if (pending.kind === "support" && info.kind === "hand") {
      var opt = null;
      pending.options.forEach(function (o) { if (o.card === info.card) opt = o; });
      if (!opt) return zones;
      var card = null;
      game.players[0].hand.forEach(function (c) { if (c.id === info.card) card = c; });
      if (!card) return zones;
      var targets = game.playTargets(game.players[0], card);
      if (targets === "instant" || card.id === "bell") {
        zones.push({ selector: '[data-drop="play"]', run: function () { game.choose(opt.id); } });
      }
      if (targets !== "instant") {
        targets.forEach(function (t) {
          if (!t.uid) return;
          zones.push({
            selector: '[data-uid="' + t.uid + '"]',
            run: function () {
              game.choose(opt.id);
              if (game.pending && game.pending.kind === "target") {
                var next = null;
                game.pending.options.forEach(function (o) { if (o.id === t.id) next = o; });
                if (next) game.choose(next.id);
              }
            }
          });
        });
      }
    }
    if ((pending.kind === "switch" || pending.kind === "promote") && info.kind === "bench") {
      var sid = (pending.kind === "switch" ? "switch:" : "promote:") + info.uid;
      var found = null;
      pending.options.forEach(function (o) { if (o.id === sid) found = o; });
      if (found) zones.push({ selector: '[data-drop="ally"][data-active="1"]', run: function () { game.choose(found.id); } });
    }
    if (pending.kind === "attack" && info.kind === "attack") {
      var aid = "atk:" + info.index;
      var atk = null;
      pending.options.forEach(function (o) { if (o.id === aid) atk = o; });
      if (atk) zones.push({ selector: '[data-drop="enemy"][data-active="1"]', run: function () { game.choose(atk.id); } });
    }
    if (pending.kind === "signature" && info.kind === "signature") {
      zones.push({ selector: '[data-drop="enemy"][data-active="1"]', run: function () { game.choose("use"); } });
    }
    return zones;
  }

  function clearMarks() {
    board.querySelectorAll(".drop-ok, .drop-hot").forEach(function (el) { el.classList.remove("drop-ok", "drop-hot"); });
  }

  function markZones(zones) {
    clearMarks();
    zones.forEach(function (z) {
      board.querySelectorAll(z.selector).forEach(function (el) { el.classList.add("drop-ok"); });
    });
  }

  function zoneAt(x, y, zones) {
    var ghost = document.querySelector(".drag-ghost");
    if (ghost) ghost.style.visibility = "hidden";
    var under = document.elementFromPoint(x, y);
    if (ghost) ghost.style.visibility = "";
    if (!under) return null;
    for (var i = 0; i < zones.length; i++) {
      var matches = board.querySelectorAll(zones[i].selector);
      for (var j = 0; j < matches.length; j++) {
        if (matches[j] === under || matches[j].contains(under)) return zones[i];
      }
    }
    return null;
  }

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  board.addEventListener("pointerdown", function (e) {
    if (!game || e.button > 0) return;
    if (e.target.closest(".speak")) return;
    var handle = e.target.closest("[data-drag]");
    if (!handle || !board.contains(handle)) return;
    var rect = handle.getBoundingClientRect();
    drag = {
      handle: handle,
      kind: handle.getAttribute("data-drag"),
      card: handle.getAttribute("data-card"),
      uid: handle.getAttribute("data-uid"),
      index: handle.getAttribute("data-index"),
      x: e.clientX,
      y: e.clientY,
      pointerId: e.pointerId,
      started: false,
      origin: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      zones: []
    };
    try { handle.setPointerCapture(e.pointerId); } catch (err) {}
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
  });

  function onPointerMove(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    var dx = e.clientX - drag.x;
    var dy = e.clientY - drag.y;
    if (!drag.started) {
      if (dx * dx + dy * dy < 64) return;
      drag.started = true;
      drag.zones = zonesFor(drag);
      markZones(drag.zones);
      var ghost = drag.handle.cloneNode(true);
      ghost.classList.add("drag-ghost");
      ghost.style.width = drag.origin.width + "px";
      ghost.removeAttribute("data-drag");
      document.body.appendChild(ghost);
      drag.ghost = ghost;
    }
    if (!drag.ghost) return;
    drag.ghost.style.left = (e.clientX - drag.origin.width / 2) + "px";
    drag.ghost.style.top = (e.clientY - 24) + "px";
    var hot = zoneAt(e.clientX, e.clientY, drag.zones);
    board.querySelectorAll(".drop-hot").forEach(function (el) { el.classList.remove("drop-hot"); });
    if (hot) {
      board.querySelectorAll(hot.selector).forEach(function (el) { el.classList.add("drop-hot"); });
    }
    e.preventDefault();
  }

  function onPointerUp(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerUp);
    finishDrag(e);
  }

  function finishDrag(e) {
    if (!drag || (e && e.pointerId !== drag.pointerId)) return;
    var info = drag;
    drag = null;
    if (!info.started) return;
    var hit = zoneAt(e.clientX, e.clientY, info.zones);
    clearMarks();
    if (hit) {
      if (info.ghost) info.ghost.remove();
      hit.run();
      pump();
      return;
    }
    snapGhost(info);
  }

  function snapGhost(info) {
    var ghost = info.ghost;
    if (!ghost) return;
    if (reducedMotion()) { ghost.remove(); return; }
    ghost.classList.add("snap");
    ghost.style.left = info.origin.left + "px";
    ghost.style.top = info.origin.top + "px";
    var done = false;
    function remove() { if (done) return; done = true; ghost.remove(); }
    ghost.addEventListener("transitionend", remove);
    setTimeout(remove, 220);
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
