(function () {
  var TILE = 16;
  var COLS = 16;
  var ROWS = 12;
  var SCALE = 2;
  var SAVE_KEY = "coop-quest-save-v1";
  var BEATS = { fire: "wind", wind: "earth", earth: "water", water: "fire" };
  var DIRS = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };
  var KEY_DIR = {
    ArrowUp: "n", ArrowDown: "s", ArrowLeft: "w", ArrowRight: "e",
    w: "n", a: "w", s: "s", d: "e",
    W: "n", A: "w", S: "s", D: "e"
  };

  var MOVES = {
    beak: { name: "Beak Tap", elem: "plain", power: 8 },
    flare: { name: "Comb Flare", elem: "fire", power: 14 },
    cinder: { name: "Cinder Peck", elem: "fire", power: 11 },
    hearth: { name: "Hearth Burst", elem: "fire", power: 18 },
    draft: { name: "Draft Slap", elem: "wind", power: 12 },
    gale: { name: "Gale Ruffle", elem: "wind", power: 16 },
    tail: { name: "Tail Gust", elem: "wind", power: 10 },
    clod: { name: "Clod Toss", elem: "earth", power: 12 },
    burrow: { name: "Burrow Kick", elem: "earth", power: 16 },
    stomp: { name: "Yard Stomp", elem: "earth", power: 18 },
    dew: { name: "Dew Flick", elem: "water", power: 12 },
    dunk: { name: "Puddle Dunk", elem: "water", power: 16 },
    brook: { name: "Brook Soak", elem: "water", power: 18 }
  };

  var SPECIES = {
    sunpeck: { name: "Sunpeck", elem: "fire", hp: 22, body: "#e85d04", comb: "#ffba08", moves: [["beak", 1], ["flare", 1], ["cinder", 4], ["hearth", 8]] },
    wift: { name: "Wift", elem: "wind", hp: 20, body: "#8ecae6", comb: "#caf0f8", moves: [["beak", 1], ["draft", 1], ["gale", 4], ["tail", 7]] },
    cob: { name: "Cob", elem: "earth", hp: 26, body: "#bc6c25", comb: "#dda15e", moves: [["beak", 1], ["clod", 1], ["burrow", 4], ["stomp", 8]] },
    dripple: { name: "Dripple", elem: "water", hp: 24, body: "#1d7874", comb: "#90e0ef", moves: [["beak", 1], ["dew", 1], ["dunk", 4], ["brook", 8]] },
    sootling: { name: "Sootling", elem: "fire", hp: 18, body: "#6a040f", comb: "#e85d04", moves: [["beak", 1], ["cinder", 1], ["flare", 5], ["hearth", 8]] },
    skirl: { name: "Skirl", elem: "wind", hp: 18, body: "#adb5bd", comb: "#f8f9fa", moves: [["beak", 1], ["draft", 1], ["gale", 4], ["tail", 7]] },
    loamhen: { name: "Loamhen", elem: "earth", hp: 28, body: "#606c38", comb: "#dda15e", moves: [["beak", 1], ["clod", 1], ["burrow", 5], ["stomp", 8]] },
    brookbit: { name: "Brookbit", elem: "water", hp: 21, body: "#1b4965", comb: "#90e0ef", moves: [["beak", 1], ["dew", 1], ["dunk", 4], ["brook", 8]] }
  };

  var STARTERS = ["sunpeck", "wift", "cob", "dripple"];
  var WILD = { C: ["sunpeck", "wift", "sootling", "skirl"], T: ["cob", "dripple", "loamhen", "brookbit"] };

  var MAP = [
    "################",
    "#HHH......BBBB.#",
    "#H.h......B..b.#",
    "#HHH..,,,,,,,,.#",
    "#......CCCC....#",
    "#......CCCC.TT.#",
    "#..~~~~..,,.TT.#",
    "#..~~~~..,,.TT.#",
    "#......n..,,...#",
    "#..............#",
    "#..............#",
    "################"
  ];

  var canvas = document.getElementById("view");
  var ctx = canvas.getContext("2d");
  var lineEl = document.getElementById("line");
  var panel = document.getElementById("panel");
  var sacksEl = document.getElementById("sacks");
  var held = {};
  var moveTimer = 0;

  var state = {
    mode: "pick",
    x: 8,
    y: 3,
    dir: "s",
    party: [],
    sacks: 8,
    battle: null,
    menu: null
  };

  function say(text) { lineEl.textContent = text; }

  function xpNeed(level) { return level * 12; }

  function learnMoves(bird) {
    var spec = SPECIES[bird.id];
    spec.moves.forEach(function (pair) {
      if (pair[1] > bird.level) return;
      if (bird.moves.indexOf(pair[0]) >= 0) return;
      if (bird.moves.length >= 4) bird.moves.shift();
      bird.moves.push(pair[0]);
    });
  }

  function makeBird(id, level) {
    var spec = SPECIES[id];
    var maxHp = spec.hp + (level - 1) * 3;
    var bird = { id: id, name: spec.name, elem: spec.elem, level: level, xp: 0, hp: maxHp, maxHp: maxHp, moves: [] };
    learnMoves(bird);
    return bird;
  }

  function living(list) {
    return list.filter(function (b) { return b.hp > 0; });
  }

  function firstReady() {
    for (var i = 0; i < state.party.length; i++) if (state.party[i].hp > 0) return i;
    return -1;
  }

  function tile(x, y) {
    if (y < 0 || x < 0 || y >= ROWS || x >= COLS) return "#";
    return MAP[y].charAt(x);
  }

  function blocked(ch) { return ch === "#" || ch === "H" || ch === "B" || ch === "~" || ch === "h"; }

  function advantage(atk, def) {
    if (!atk || atk === "plain") return 1;
    if (BEATS[atk] === def) return 1.5;
    if (BEATS[def] === atk) return 0.75;
    return 1;
  }

  function autosave() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (err) {}
  }

  function loadGame() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) { say("No flock is saved in this browser."); return false; }
      var data = JSON.parse(raw);
      if (!data || !data.party || !data.party.length) { say("That save is empty."); return false; }
      state.mode = "walk";
      state.x = data.x;
      state.y = data.y;
      state.dir = data.dir || "s";
      state.party = data.party;
      state.sacks = data.sacks || 0;
      state.battle = null;
      state.menu = null;
      say("The saved flock is back on the lane.");
      renderPanel();
      draw();
      return true;
    } catch (err) {
      say("That save could not be read.");
      return false;
    }
  }

  function saveGame() {
    if (!state.party.length) { say("Pick a first bird before saving."); return; }
    autosave();
    say("Flock saved in this browser.");
  }

  function healFlock(reason) {
    state.party.forEach(function (b) { b.hp = b.maxHp; });
    say(reason);
    autosave();
  }

  function wakeAtBarn() {
    state.x = 12;
    state.y = 3;
    state.dir = "n";
    state.battle = null;
    state.mode = "walk";
    healFlock("The flock was too tired. You wake in the straw, every bird patched up.");
    renderPanel();
    draw();
  }

  function grantXp(bird, amount) {
    bird.xp += amount;
    var notes = [];
    while (bird.xp >= xpNeed(bird.level) && bird.level < 16) {
      bird.xp -= xpNeed(bird.level);
      bird.level += 1;
      var before = bird.moves.slice();
      bird.maxHp += 3;
      bird.hp = bird.maxHp;
      learnMoves(bird);
      notes.push(bird.name + " grew sturdier. Level " + bird.level + ".");
      bird.moves.forEach(function (id) {
        if (before.indexOf(id) < 0) notes.push(bird.name + " learned " + MOVES[id].name + ".");
      });
    }
    return notes;
  }

  function startBattle(id, level) {
    state.mode = "battle";
    state.battle = {
      foe: makeBird(id, level),
      phase: "main",
      index: firstReady(),
      note: "A clover rustle! A stray " + SPECIES[id].name + " hops out."
    };
    say(state.battle.note);
    renderPanel();
    draw();
  }

  function activeBird() {
    if (!state.battle) return null;
    return state.party[state.battle.index];
  }

  function endBattle(text) {
    state.battle = null;
    state.mode = "walk";
    say(text);
    if (firstReady() < 0) wakeAtBarn();
    else autosave();
    renderPanel();
    draw();
  }

  function strike(attacker, defender, moveId) {
    var move = MOVES[moveId];
    var mul = advantage(move.elem, defender.elem);
    var roll = 0.85 + Math.random() * 0.3;
    var dmg = Math.max(1, Math.floor((move.power + attacker.level) * mul * roll));
    defender.hp = Math.max(0, defender.hp - dmg);
    var tone = mul > 1 ? " That lands hard." : (mul < 1 ? " That barely ruffles a feather." : " That connects.");
    var who = state.battle && attacker === state.battle.foe ? "The stray " + attacker.name : "Your " + attacker.name;
    return who + " uses " + move.name + " for " + dmg + " HP." + tone;
  }

  function foeTurn(prefix) {
    var b = state.battle;
    if (!b) return;
    var foe = b.foe;
    var you = activeBird();
    if (!you || foe.hp <= 0) return;
    var moveId = foe.moves[Math.floor(Math.random() * foe.moves.length)];
    var text = strike(foe, you, moveId);
    if (you.hp <= 0) {
      text += " " + you.name + " needs a rest.";
      var next = firstReady();
      if (next < 0) {
        say((prefix ? prefix + " " : "") + text);
        wakeAtBarn();
        return;
      }
      b.index = next;
      text += " " + state.party[next].name + " hops in.";
    }
    say((prefix ? prefix + " " : "") + text);
    b.phase = "main";
    renderPanel();
    draw();
  }

  function afterPlayerHit(text) {
    var b = state.battle;
    if (b.foe.hp <= 0) {
      var notes = grantXp(activeBird(), 8 + b.foe.level * 4);
      endBattle(text + " The stray bird hustles off. " + notes.join(" "));
      return;
    }
    say(text);
    foeTurn(text);
  }

  function useMove(moveId) {
    var b = state.battle;
    var you = activeBird();
    afterPlayerHit(strike(you, b.foe, moveId));
  }

  function tryCatch() {
    var b = state.battle;
    if (state.sacks <= 0) { say("No feed sacks left. The bin by the lane has more."); return; }
    state.sacks -= 1;
    if (state.party.length >= 6) {
      say("The flock already has six birds. The sack spills.");
      foeTurn("The flock already has six birds. The sack spills.");
      return;
    }
    var ratio = b.foe.hp / b.foe.maxHp;
    var chance = 0.3 + 0.6 * (1 - ratio);
    if (Math.random() < chance) {
      b.foe.hp = b.foe.maxHp;
      state.party.push(b.foe);
      endBattle("The feed sack lands in the grass. " + b.foe.name + " settles into your flock.");
      return;
    }
    say("The feed sack lands, but " + b.foe.name + " flaps off it.");
    foeTurn("The feed sack lands, but " + b.foe.name + " flaps off it.");
  }

  function tryRun() {
    var b = state.battle;
    var you = activeBird();
    var chance = 0.5 + 0.04 * (you.level - b.foe.level);
    if (Math.random() < chance) {
      endBattle("You duck back toward the lane.");
      return;
    }
    say("It hops into your path.");
    foeTurn("It hops into your path.");
  }

  function stepOn(ch) {
    if (ch === "b") healFlock("Warm straw and quiet. The whole flock is mended.");
    if (ch === "n") {
      if (state.sacks < 8) {
        state.sacks = 8;
        say("You fill your pockets from the feed bin. Eight sacks ready.");
        autosave();
      } else say("The bin is there if your sacks run low.");
    }
    if ((ch === "C" || ch === "T") && state.party.length && firstReady() >= 0) {
      var rate = ch === "T" ? 0.28 : 0.2;
      if (Math.random() < rate) {
        var pool = WILD[ch];
        var id = pool[Math.floor(Math.random() * pool.length)];
        var level = ch === "T" ? 3 + Math.floor(Math.random() * 3) : 2 + Math.floor(Math.random() * 2);
        startBattle(id, level);
      }
    }
  }

  function tryStep(dir) {
    if (state.mode !== "walk") return;
    state.dir = dir;
    var d = DIRS[dir];
    var nx = state.x + d[0];
    var ny = state.y + d[1];
    var ch = tile(nx, ny);
    if (blocked(ch)) { draw(); return; }
    state.x = nx;
    state.y = ny;
    stepOn(ch);
    if (state.mode === "walk") draw();
    refreshHud();
  }

  function interact() {
    if (state.mode === "pick") return;
    if (state.mode === "battle") return;
    if (state.menu) { state.menu = null; state.mode = "walk"; renderPanel(); return; }
    var d = DIRS[state.dir];
    var front = tile(state.x + d[0], state.y + d[1]);
    var here = tile(state.x, state.y);
    if (front === "h" || here === "h") {
      say("Bram's note: clover and thicket hide stray birds. The barn mends a tired flock. The bin keeps feed sacks.");
      return;
    }
    if (here === "n" || front === "n") stepOn("n");
    else if (here === "b" || front === "b") {
      if (front === "b") { state.x += d[0]; state.y += d[1]; }
      stepOn("b");
      draw();
    } else say("The lane is quiet.");
  }

  function openSwap() {
    var ready = [];
    state.party.forEach(function (b, i) { if (b.hp > 0 && i !== state.battle.index) ready.push(i); });
    if (!ready.length) { say("No other bird is ready."); return; }
    state.battle.phase = "swap";
    renderPanel();
  }

  function renderPanel() {
    panel.innerHTML = "";
    refreshHud();
    if (state.mode === "pick") {
      say("Choose a first bird. Each one favors a different element.");
      STARTERS.forEach(function (id) {
        var spec = SPECIES[id];
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = spec.name + " (" + spec.elem + ")";
        btn.addEventListener("click", function () {
          state.party = [makeBird(id, 5)];
          state.mode = "walk";
          state.sacks = 8;
          say(spec.name + " joins you on the lane. Walk into the clover when you are ready.");
          autosave();
          renderPanel();
          draw();
        });
        panel.appendChild(btn);
      });
      return;
    }
    if (state.mode === "battle" && state.battle) {
      var b = state.battle;
      if (b.phase === "moves") {
        activeBird().moves.forEach(function (id) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.textContent = MOVES[id].name;
          btn.addEventListener("click", function () { useMove(id); });
          panel.appendChild(btn);
        });
        addButton("Back", function () { b.phase = "main"; renderPanel(); });
        return;
      }
      if (b.phase === "swap") {
        state.party.forEach(function (bird, i) {
          if (bird.hp <= 0 || i === b.index) return;
          addButton(bird.name + " " + bird.hp + "/" + bird.maxHp, function () {
            b.index = i;
            b.phase = "main";
            say(bird.name + " hops in.");
            foeTurn(bird.name + " hops in.");
          });
        });
        addButton("Back", function () { b.phase = "main"; renderPanel(); });
        return;
      }
      addButton("Fight", function () { b.phase = "moves"; renderPanel(); });
      addButton("Feed sack", tryCatch);
      addButton("Call bird", openSwap);
      addButton("Slip away", tryRun);
    }
  }

  function addButton(label, fn) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.addEventListener("click", fn);
    panel.appendChild(btn);
  }

  function refreshHud() {
    sacksEl.textContent = state.party.length ? ("Feed sacks: " + state.sacks + " · Flock " + state.party.length + "/6") : "";
  }

  function px(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
  }

  function blot(ox, oy, rows, palette) {
    for (var y = 0; y < rows.length; y++) {
      for (var x = 0; x < rows[y].length; x++) {
        var color = palette[rows[y].charAt(x)];
        if (color) px(ox + x, oy + y, color);
      }
    }
  }

  function drawTile(ch, x, y) {
    var ox = x * TILE;
    var oy = y * TILE;
    var grass = ch === "C" || ch === "T" ? "#7fbf4a" : "#9ccc65";
    if (ch === "~") grass = "#4ea0c8";
    if (ch === "," ) grass = "#e6d3a1";
    if (ch === "b") grass = "#f0d9a0";
    if (ch === "#" || ch === "H" || ch === "B" || ch === "h") grass = "#6b4423";
    ctx.fillStyle = grass;
    ctx.fillRect(ox * SCALE, oy * SCALE, TILE * SCALE, TILE * SCALE);
    if (ch === "C" || ch === "T") {
      ctx.fillStyle = ch === "T" ? "#3d6b2a" : "#4f8f32";
      for (var i = 0; i < 4; i++) ctx.fillRect((ox + 2 + i * 4) * SCALE, (oy + 4) * SCALE, SCALE, 8 * SCALE);
    }
    if (ch === "H") {
      ctx.fillStyle = "#f4e1c1";
      ctx.fillRect((ox + 2) * SCALE, (oy + 4) * SCALE, 12 * SCALE, 8 * SCALE);
      ctx.fillStyle = "#c4522a";
      ctx.fillRect(ox * SCALE, (oy + 2) * SCALE, 16 * SCALE, 4 * SCALE);
    }
    if (ch === "h") {
      ctx.fillStyle = "#8d5a32";
      ctx.fillRect((ox + 5) * SCALE, (oy + 4) * SCALE, 6 * SCALE, 12 * SCALE);
    }
    if (ch === "B") {
      ctx.fillStyle = "#a33b32";
      ctx.fillRect(ox * SCALE, oy * SCALE, 16 * SCALE, 16 * SCALE);
      ctx.fillStyle = "#f6f1e7";
      ctx.fillRect((ox + 3) * SCALE, (oy + 6) * SCALE, 4 * SCALE, 4 * SCALE);
    }
    if (ch === "b") {
      ctx.fillStyle = "#6b3f22";
      ctx.fillRect((ox + 4) * SCALE, (oy + 2) * SCALE, 8 * SCALE, 14 * SCALE);
    }
    if (ch === "n") {
      ctx.fillStyle = "#c48a3a";
      ctx.fillRect((ox + 4) * SCALE, (oy + 6) * SCALE, 8 * SCALE, 8 * SCALE);
    }
    if (ch === "#") {
      ctx.fillStyle = "#8d6a43";
      ctx.fillRect(ox * SCALE, (oy + 6) * SCALE, 16 * SCALE, 4 * SCALE);
    }
    if (ch === "~") {
      ctx.fillStyle = "#d7f3ff";
      ctx.fillRect((ox + 2) * SCALE, (oy + 8) * SCALE, 6 * SCALE, 2 * SCALE);
    }
  }

  function drawChicken(id, ox, oy, big) {
    var spec = SPECIES[id];
    var s = big ? 2 : 1;
    var body = spec.body;
    var comb = spec.comb;
    blot(ox, oy, [
      "..ccc...",
      ".cbbbc..",
      "cbbbbbc.",
      ".bbbbb..",
      "..b..b.."
    ], { c: comb, b: body });
    if (big) {
      ctx.save();
      ctx.translate(ox * SCALE, oy * SCALE);
      ctx.scale(3, 3);
      ctx.restore();
    }
  }

  function drawBigChicken(id, px0, py0) {
    var spec = SPECIES[id];
    ctx.save();
    ctx.translate(px0, py0);
    ctx.scale(6, 6);
    ctx.fillStyle = spec.comb;
    ctx.fillRect(3, 0, 2, 2);
    ctx.fillRect(2, 1, 1, 2);
    ctx.fillStyle = spec.body;
    ctx.fillRect(1, 3, 6, 4);
    ctx.fillRect(5, 2, 3, 3);
    ctx.fillStyle = "#2b2118";
    ctx.fillRect(7, 3, 1, 1);
    ctx.fillStyle = "#f4d35e";
    ctx.fillRect(8, 3, 2, 1);
    ctx.fillStyle = spec.comb;
    ctx.fillRect(2, 7, 1, 2);
    ctx.fillRect(5, 7, 1, 2);
    ctx.restore();
  }

  function drawPlayer(ox, oy) {
    blot(ox, oy, [
      "..hhh...",
      ".hhhhh..",
      "..sss...",
      ".sssss..",
      ".s.s.s..",
      "..p.p..."
    ], { h: "#f4d35e", s: "#386641", p: "#3d405b" });
  }

  function drawWorld() {
    for (var y = 0; y < ROWS; y++) {
      for (var x = 0; x < COLS; x++) drawTile(tile(x, y), x, y);
    }
    drawPlayer(state.x * TILE + 4, state.y * TILE + 2);
  }

  function drawBattle() {
    ctx.fillStyle = "#e7d7b1";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#c4a574";
    ctx.fillRect(0, 210, canvas.width, 174);
    var foe = state.battle.foe;
    var you = activeBird();
    drawBigChicken(foe.id, 70, 70);
    if (you) drawBigChicken(you.id, 300, 150);
    ctx.fillStyle = "#2b2118";
    ctx.font = "16px Trebuchet MS, Verdana, sans-serif";
    ctx.fillText(foe.name + "  Lv " + foe.level + "  " + foe.elem, 24, 36);
    ctx.fillText("HP " + foe.hp + "/" + foe.maxHp, 24, 58);
    if (you) {
      ctx.fillText(you.name + "  Lv " + you.level + "  " + you.elem, 250, 130);
      ctx.fillText("HP " + you.hp + "/" + you.maxHp, 250, 152);
    }
  }

  function draw() {
    if (state.mode === "battle" && state.battle) drawBattle();
    else drawWorld();
  }

  function tick() {
    if (state.mode === "walk" && held.dir && Date.now() > moveTimer) {
      tryStep(held.dir);
      moveTimer = Date.now() + 160;
    }
    requestAnimationFrame(tick);
  }

  document.addEventListener("keydown", function (e) {
    var dir = KEY_DIR[e.key];
    if (dir) {
      e.preventDefault();
      if (!held.dir) { tryStep(dir); moveTimer = Date.now() + 160; }
      held.dir = dir;
      return;
    }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); interact(); }
    if (e.key === "Escape") {
      if (state.battle && state.battle.phase !== "main") {
        state.battle.phase = "main";
        renderPanel();
      }
    }
  });
  document.addEventListener("keyup", function (e) {
    var dir = KEY_DIR[e.key];
    if (dir && held.dir === dir) held.dir = null;
  });

  document.querySelectorAll("[data-dir]").forEach(function (btn) {
    var dir = btn.getAttribute("data-dir");
    function press(ev) {
      ev.preventDefault();
      held.dir = dir;
      tryStep(dir);
      moveTimer = Date.now() + 160;
    }
    btn.addEventListener("pointerdown", press);
    btn.addEventListener("pointerup", function () { if (held.dir === dir) held.dir = null; });
    btn.addEventListener("pointerleave", function () { if (held.dir === dir) held.dir = null; });
  });
  document.getElementById("btn-a").addEventListener("click", interact);
  document.getElementById("btn-b").addEventListener("click", function () {
    if (state.battle && state.battle.phase !== "main") {
      state.battle.phase = "main";
      renderPanel();
      return;
    }
    if (!state.party.length) return;
    var text = state.party.map(function (b) { return b.name + " Lv" + b.level + " " + b.hp + "/" + b.maxHp; }).join(" · ");
    say(text);
  });
  document.getElementById("save").addEventListener("click", saveGame);
  document.getElementById("load").addEventListener("click", loadGame);

  renderPanel();
  draw();
  requestAnimationFrame(tick);
})();
