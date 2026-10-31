(function () {
  var KEY = "clutch-coop-save-v1";
  var SCOOP_MS = 6 * 60 * 60 * 1000;
  var FEEDS_TO_GROW = 3;
  var MAX_COOPS = 4;
  var BASES = [
    { id: "buff", name: "Buff", hex: "#e2b15a", pts: 0 },
    { id: "slate", name: "Slate", hex: "#6e7c8a", pts: 1 },
    { id: "snow", name: "Snow", hex: "#f4f1ea", pts: 0 },
    { id: "ember", name: "Ember", hex: "#d4653a", pts: 2 },
    { id: "moss", name: "Moss", hex: "#6d8a4e", pts: 1 },
    { id: "ink", name: "Ink", hex: "#2a2624", pts: 3 }
  ];
  var MARKS = [
    { id: "cream", name: "Cream", hex: "#f6e7c1", pts: 0 },
    { id: "rust", name: "Rust", hex: "#a3472c", pts: 1 },
    { id: "coal", name: "Coal", hex: "#2c2a28", pts: 2 },
    { id: "honey", name: "Honey", hex: "#e6a317", pts: 0 },
    { id: "lilac", name: "Lilac", hex: "#b9a0c9", pts: 3 },
    { id: "tide", name: "Tide", hex: "#3e8f95", pts: 1 }
  ];
  var PATTERNS = [
    { id: "plain", name: "Plain", pts: 0 },
    { id: "fleck", name: "Fleck", pts: 1 },
    { id: "ladder", name: "Ladder", pts: 2 },
    { id: "rim", name: "Rim", pts: 3 },
    { id: "patch", name: "Patch", pts: 4 }
  ];
  var COOP_NAMES = ["Straw Run", "Shade Pen", "Orchard Box", "Rain Nook"];
  var PAY = { Common: 16, Uncommon: 30, Rare: 52, Legendary: 90 };
  var SELL = { Common: 10, Uncommon: 18, Rare: 32, Legendary: 55 };

  var view = "yard";
  var bookFilter = "all";
  var state = null;
  var toast = "";

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0];
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function keyOf(base, mark, pattern) { return base + "|" + mark + "|" + pattern; }
  function score(base, mark, pattern) {
    return byId(BASES, base).pts + byId(MARKS, mark).pts + byId(PATTERNS, pattern).pts;
  }
  function rarity(base, mark, pattern) {
    var n = score(base, mark, pattern);
    if (n >= 7) return "Legendary";
    if (n >= 4) return "Rare";
    if (n >= 2) return "Uncommon";
    return "Common";
  }
  function breedTitle(base, pattern) {
    return byId(BASES, base).name + " " + byId(PATTERNS, pattern).name;
  }
  function markTitle(mark) { return byId(MARKS, mark).name + " marks"; }

  function catalog() {
    var out = [];
    BASES.forEach(function (b) {
      MARKS.forEach(function (m) {
        PATTERNS.forEach(function (p) {
          out.push({ base: b.id, mark: m.id, pattern: p.id, rarity: rarity(b.id, m.id, p.id) });
        });
      });
    });
    return out;
  }

  function bird(base, mark, pattern, stage) {
    var item = { id: state.nextId++, base: base, mark: mark, pattern: pattern, stage: stage, feeds: stage === "adult" ? FEEDS_TO_GROW : 0 };
    state.book[keyOf(base, mark, pattern)] = true;
    return item;
  }

  function fresh() {
    state = { coins: 40, grain: 6, nextId: 1, coops: [], book: {}, orders: [], scoopedAt: Date.now(), log: [] };
    state.coops.push({ name: COOP_NAMES[0], birds: [], egg: null });
    state.coops.push({ name: COOP_NAMES[1], birds: [], egg: null });
    state.coops[0].birds.push(bird("buff", "cream", "plain", "adult"));
    state.coops[0].birds.push(bird("slate", "rust", "fleck", "adult"));
    state.orders = [
      makeOrder("buff", "cream", "plain"),
      makeOrder("moss", "tide", "ladder"),
      makeOrder("ink", "lilac", "patch")
    ];
    say("Two grown birds are waiting in Straw Run.");
  }

  function makeOrder(base, mark, pattern) {
    return { id: "o" + Math.floor(Math.random() * 1e9), base: base, mark: mark, pattern: pattern, pay: PAY[rarity(base, mark, pattern)] };
  }

  function randomOrder() {
    var all = catalog();
    var pick = all[Math.floor(Math.random() * all.length)];
    var guard = 0;
    while (guard < 20 && state.orders.some(function (o) { return keyOf(o.base, o.mark, o.pattern) === keyOf(pick.base, pick.mark, pick.pattern); })) {
      pick = all[Math.floor(Math.random() * all.length)];
      guard++;
    }
    return makeOrder(pick.base, pick.mark, pick.pattern);
  }

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!raw || !raw.coops || !raw.book) return fresh();
      state = raw;
    } catch (err) { fresh(); }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (err) {}
  }

  function say(text) { toast = text; }

  function findBird(id) {
    for (var i = 0; i < state.coops.length; i++) {
      for (var j = 0; j < state.coops[i].birds.length; j++) {
        if (String(state.coops[i].birds[j].id) === String(id)) return { coop: state.coops[i], index: j, bird: state.coops[i].birds[j] };
      }
    }
    return null;
  }

  function adults(coop) {
    return coop.birds.filter(function (b) { return b.stage === "adult"; });
  }

  function inheritGene(a, b, list) {
    var pick = Math.random() < 0.5 ? a : b;
    if (Math.random() < 0.08) {
      var others = list.filter(function (item) { return item.id !== pick; });
      return { id: others[Math.floor(Math.random() * others.length)].id, mutated: true };
    }
    return { id: pick, mutated: false };
  }

  function setClutch(coopIndex) {
    var coop = state.coops[coopIndex];
    var grown = adults(coop);
    if (coop.egg) return say("This pen already has an egg.");
    if (grown.length < 2) return say("A clutch needs two grown birds in the same pen.");
    if (coop.birds.length >= 4) return say("This pen is full. Sell a bird or move one first.");
    var base = inheritGene(grown[0].base, grown[1].base, BASES);
    var mark = inheritGene(grown[0].mark, grown[1].mark, MARKS);
    var pattern = inheritGene(grown[0].pattern, grown[1].pattern, PATTERNS);
    coop.egg = { base: base.id, mark: mark.id, pattern: pattern.id };
    var bits = [];
    if (base.mutated) bits.push("base color");
    if (mark.mutated) bits.push("mark color");
    if (pattern.mutated) bits.push("pattern");
    say(bits.length ? "An egg is in the nest. A rare shift touched the " + bits.join(" and ") + "." : "An egg is in the nest. Warm it when you are ready.");
  }

  function hatch(coopIndex) {
    var coop = state.coops[coopIndex];
    if (!coop.egg) return;
    if (coop.birds.length >= 4) return say("No empty roost for the chick.");
    var egg = coop.egg;
    coop.egg = null;
    coop.birds.push(bird(egg.base, egg.mark, egg.pattern, "chick"));
    say("A " + breedTitle(egg.base, egg.pattern) + " chick hatched, with " + markTitle(egg.mark) + ".");
  }

  function feed(id) {
    var hit = findBird(id);
    if (!hit || hit.bird.stage !== "chick") return;
    if (state.grain < 1) return say("You need grain. Scoop the yard or buy some in the shop.");
    state.grain -= 1;
    hit.bird.feeds += 1;
    if (hit.bird.feeds >= FEEDS_TO_GROW) {
      hit.bird.stage = "adult";
      say(breedTitle(hit.bird.base, hit.bird.pattern) + " grew up.");
    } else {
      say("Fed the chick. " + (FEEDS_TO_GROW - hit.bird.feeds) + " meals to go.");
    }
  }

  function sell(id) {
    var hit = findBird(id);
    if (!hit || hit.bird.stage !== "adult") return say("Only a grown bird can be sold.");
    var pay = SELL[rarity(hit.bird.base, hit.bird.mark, hit.bird.pattern)];
    state.coins += pay;
    hit.coop.birds.splice(hit.index, 1);
    say("Sold for " + pay + " coins.");
  }

  function toFront(id) {
    var hit = findBird(id);
    if (!hit || hit.index === 0) return;
    var birdItem = hit.coop.birds.splice(hit.index, 1)[0];
    hit.coop.birds.unshift(birdItem);
    say(breedTitle(birdItem.base, birdItem.pattern) + " is now at the front of the pen.");
  }

  function moveBird(id, coopIndex) {
    var hit = findBird(id);
    var dest = state.coops[coopIndex];
    if (!hit || !dest || dest === hit.coop) return;
    if (dest.birds.length >= 4) return say(dest.name + " is full.");
    dest.birds.push(hit.coop.birds.splice(hit.index, 1)[0]);
    say("Moved to " + dest.name + ".");
  }

  function deliver(orderId) {
    var order = null;
    state.orders.forEach(function (o) { if (o.id === orderId) order = o; });
    if (!order) return;
    var hit = null;
    state.coops.forEach(function (coop) {
      if (hit) return;
      coop.birds.forEach(function (b, index) {
        if (hit) return;
        if (b.stage === "adult" && b.base === order.base && b.mark === order.mark && b.pattern === order.pattern) {
          hit = { coop: coop, index: index, bird: b };
        }
      });
    });
    if (!hit) return say("No grown bird matches that order yet.");
    hit.coop.birds.splice(hit.index, 1);
    state.coins += order.pay;
    var spot = state.orders.indexOf(order);
    state.orders[spot] = randomOrder();
    say("Order filled for " + order.pay + " coins.");
  }

  function buyGrain() {
    if (state.coins < 5) return say("Grain costs 5 coins.");
    state.coins -= 5;
    state.grain += 1;
    say("Bought 1 grain.");
  }

  function buyCoop() {
    if (state.coops.length >= MAX_COOPS) return say("The yard is full of pens.");
    if (state.coins < 75) return say("A new pen costs 75 coins.");
    state.coins -= 75;
    state.coops.push({ name: COOP_NAMES[state.coops.length], birds: [], egg: null });
    say(state.coops[state.coops.length - 1].name + " is ready.");
  }

  function scoop() {
    var left = SCOOP_MS - (Date.now() - state.scoopedAt);
    if (left > 0) return say("The yard was just scooped. Try again later.");
    state.grain += 4;
    state.scoopedAt = Date.now();
    say("Scooped up 4 grain.");
  }

  function scoopLabel() {
    var left = SCOOP_MS - (Date.now() - state.scoopedAt);
    if (left <= 0) return "Scoop the yard (4 grain)";
    var hours = Math.ceil(left / (60 * 60 * 1000));
    return "Next scoop in about " + hours + "h";
  }

  function chickenSvg(base, mark, pattern, stage) {
    var body = byId(BASES, base).hex;
    var ink = byId(MARKS, mark).hex;
    var chick = stage === "chick";
    var marks = "";
    if (pattern === "fleck") {
      marks = '<circle cx="78" cy="78" r="4" fill="' + ink + '"/><circle cx="96" cy="70" r="3" fill="' + ink + '"/><circle cx="88" cy="90" r="3.5" fill="' + ink + '"/>';
    } else if (pattern === "ladder") {
      marks = '<path d="M70 68 h34 M70 80 h34 M70 92 h30" stroke="' + ink + '" stroke-width="3" fill="none"/>';
    } else if (pattern === "rim") {
      marks = '<ellipse cx="92" cy="82" rx="30" ry="20" fill="none" stroke="' + ink + '" stroke-width="4"/>';
    } else if (pattern === "patch") {
      marks = '<path d="M74 74 q16 -16 28 2 q8 18 -6 22 q-24 2 -22 -24z" fill="' + ink + '"/>';
    } else {
      marks = '<circle cx="118" cy="58" r="4" fill="' + ink + '"/>';
    }
    var comb = chick ? "" : '<path d="M112 40 q6 -14 12 0 q6 -12 10 2" fill="#c43630"/>';
    var scale = chick ? ' transform="translate(18 16) scale(.82)"' : "";
    return '<svg class="art" viewBox="0 0 160 110" role="img" aria-label="' + esc(breedTitle(base, pattern)) + '">' +
      '<g' + scale + '>' +
      '<ellipse cx="78" cy="78" rx="36" ry="24" fill="' + body + '"/>' +
      marks +
      '<ellipse cx="112" cy="62" rx="22" ry="16" fill="' + body + '"/>' +
      comb +
      '<polygon points="132,60 148,66 132,72" fill="#e2a03a"/>' +
      '<circle cx="118" cy="58" r="2.2" fill="#24180f"/>' +
      '<path d="M62 98 v10 M84 100 v10" stroke="#e2a03a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      "</g></svg>";
  }

  function eggSvg() {
    return '<svg class="art" viewBox="0 0 160 110" aria-hidden="true"><ellipse cx="80" cy="64" rx="26" ry="34" fill="#f7efe0" stroke="#2a2118" stroke-width="3"/></svg>';
  }

  function foundCount() { return Object.keys(state.book).length; }

  function yardHTML() {
    var pens = state.coops.map(function (coop, index) {
      var grown = adults(coop);
      var birds = coop.birds.map(function (b) {
        var rare = rarity(b.base, b.mark, b.pattern);
        var moves = state.coops.map(function (other, otherIndex) {
          if (other === coop) return "";
          return '<option value="' + otherIndex + '">' + esc(other.name) + "</option>";
        }).join("");
        return '<article class="bird">' +
          chickenSvg(b.base, b.mark, b.pattern, b.stage) +
          "<h4>" + esc(breedTitle(b.base, b.pattern)) + "</h4>" +
          '<p class="meta">' + esc(markTitle(b.mark)) + " · " + (b.stage === "adult" ? "Grown" : "Chick " + b.feeds + "/" + FEEDS_TO_GROW) + "</p>" +
          '<p class="rarity ' + rare + '">' + rare + "</p>" +
          '<div class="row">' +
          (b.stage === "chick" ? '<button type="button" data-act="feed" data-id="' + b.id + '">Feed</button>' : '<button type="button" data-act="sell" data-id="' + b.id + '">Sell ' + SELL[rare] + "</button>") +
          (b.stage === "adult" && coop.birds[0] !== b ? '<button type="button" data-act="front" data-id="' + b.id + '">To the front</button>' : "") +
          "</div>" +
          '<label class="meta">Move <select data-move="' + b.id + '"><option value="">Stay</option>' + moves + "</select></label>" +
          "</article>";
      }).join("");
      var egg = "";
      if (coop.egg) {
        egg = '<div class="egg">' + eggSvg() + "<p>A warm egg is in the nest.</p>" +
          '<button type="button" data-act="hatch" data-coop="' + index + '">Hatch the chick</button></div>';
      }
      var breed = '<button type="button" data-act="breed" data-coop="' + index + '"' + (grown.length < 2 || coop.egg || coop.birds.length >= 4 ? " disabled" : "") + ">Set a clutch</button>";
      return '<section class="coop"><h3>' + esc(coop.name) + "</h3>" +
        "<p class=\"meta\">" + coop.birds.length + "/4 roosts. The first two grown birds set a clutch.</p>" +
        '<div class="birds">' + (birds || "<p>Empty pen.</p>") + "</div>" + egg +
        '<div class="row">' + breed + "</div></section>";
    }).join("");
    return '<section class="panel"><h2>Yard</h2>' +
      '<details class="help"><summary>How the yard works</summary>' +
      "<p>Each chicken carries a base color, a mark color, and a pattern. Set two grown birds in one pen to lay an egg. The chick inherits one gene from each parent, and a gene sometimes shifts. Feed a chick three times to raise it. Sell grown birds, or fill a delivery order for more coins. The book tracks every mix.</p></details>" +
      '<div class="coops">' + pens + "</div></section>";
  }

  function bookHTML() {
    var rows = catalog().filter(function (item) {
      if (bookFilter === "found") return !!state.book[keyOf(item.base, item.mark, item.pattern)];
      if (bookFilter === "missing") return !state.book[keyOf(item.base, item.mark, item.pattern)];
      if (bookFilter === "all") return true;
      return item.rarity === bookFilter;
    });
    var tools = ["all", "found", "missing", "Common", "Uncommon", "Rare", "Legendary"].map(function (name) {
      var label = name === "all" ? "All" : name.charAt(0).toUpperCase() + name.slice(1);
      return '<button type="button" data-book="' + name + '" aria-pressed="' + (bookFilter === name ? "true" : "false") + '">' + label + "</button>";
    }).join("");
    var cells = rows.map(function (item) {
      var have = !!state.book[keyOf(item.base, item.mark, item.pattern)];
      return '<article class="book-cell' + (have ? "" : " missing") + '">' +
        (have ? chickenSvg(item.base, item.mark, item.pattern, "adult") : eggSvg()) +
        "<p><b>" + esc(breedTitle(item.base, item.pattern)) + "</b></p>" +
        "<p>" + esc(markTitle(item.mark)) + "</p>" +
        '<p class="rarity ' + item.rarity + '">' + item.rarity + (have ? "" : " · not hatched") + "</p></article>";
    }).join("");
    return '<section class="panel"><h2>Yard book ' + foundCount() + "/" + catalog().length + "</h2>" +
      '<div class="book-tools">' + tools + "</div><div class=\"book\">" + cells + "</div></section>";
  }

  function ordersHTML() {
    var cards = state.orders.map(function (order) {
      var rare = rarity(order.base, order.mark, order.pattern);
      var ready = state.coops.some(function (coop) {
        return coop.birds.some(function (b) {
          return b.stage === "adult" && b.base === order.base && b.mark === order.mark && b.pattern === order.pattern;
        });
      });
      return '<article class="order">' + chickenSvg(order.base, order.mark, order.pattern, "adult") +
        "<h3>" + esc(breedTitle(order.base, order.pattern)) + "</h3>" +
        "<p class=\"meta\">" + esc(markTitle(order.mark)) + "</p>" +
        '<p class="rarity ' + rare + '">' + rare + " · pays " + order.pay + " coins</p>" +
        '<button type="button" data-act="deliver" data-id="' + esc(order.id) + '"' + (ready ? "" : " disabled") + ">Send a match</button></article>";
    }).join("");
    return '<section class="panel"><h2>Delivery orders</h2><p class="meta">Send a grown bird that matches. A new request takes its place.</p><div class="orders">' + cards + "</div></section>";
  }

  function shopHTML() {
    var coopOff = state.coops.length >= MAX_COOPS ? " disabled" : "";
    var scoopOff = SCOOP_MS - (Date.now() - state.scoopedAt) > 0 ? " disabled" : "";
    return '<section class="panel"><h2>Shop</h2><div class="shop">' +
      '<article class="shop-row"><div><h3>Grain</h3><p class="meta">One meal for a chick. 5 coins.</p></div><button type="button" data-act="buy-grain">Buy grain</button></article>' +
      '<article class="shop-row"><div><h3>New pen</h3><p class="meta">' + state.coops.length + "/" + MAX_COOPS + ' pens. 75 coins.</p></div><button type="button" data-act="buy-coop"' + coopOff + '>Build a pen</button></article>' +
      '<article class="shop-row"><div><h3>Yard scoop</h3><p class="meta">4 grain, about every 6 hours.</p></div><button type="button" data-act="scoop"' + scoopOff + '>' + esc(scoopLabel()) + '</button></article>' +
      '</div></section>';
  }

  function paint() {
    document.getElementById("coins").textContent = state.coins;
    document.getElementById("grain").textContent = state.grain;
    document.getElementById("toast").textContent = toast;
    var root = document.getElementById("view");
    if (view === "book") root.innerHTML = bookHTML();
    else if (view === "orders") root.innerHTML = ordersHTML();
    else if (view === "shop") root.innerHTML = shopHTML();
    else root.innerHTML = yardHTML();
    document.querySelectorAll("[data-view]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-view") === view ? "true" : "false");
    });
    save();
  }

  document.getElementById("view").addEventListener("click", function (e) {
    var bookBtn = e.target.closest("[data-book]");
    if (bookBtn) {
      bookFilter = bookBtn.getAttribute("data-book");
      paint();
      return;
    }
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var act = btn.getAttribute("data-act");
    if (act === "breed") setClutch(Number(btn.getAttribute("data-coop")));
    else if (act === "hatch") hatch(Number(btn.getAttribute("data-coop")));
    else if (act === "feed") feed(btn.getAttribute("data-id"));
    else if (act === "sell") sell(btn.getAttribute("data-id"));
    else if (act === "front") toFront(btn.getAttribute("data-id"));
    else if (act === "deliver") deliver(btn.getAttribute("data-id"));
    else if (act === "buy-grain") buyGrain();
    else if (act === "buy-coop") buyCoop();
    else if (act === "scoop") scoop();
    paint();
  });

  document.getElementById("view").addEventListener("change", function (e) {
    var sel = e.target.closest("[data-move]");
    if (!sel || sel.value === "") return;
    moveBird(sel.getAttribute("data-move"), Number(sel.value));
    paint();
  });

  document.querySelector(".tabs").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-view]");
    if (!btn) return;
    view = btn.getAttribute("data-view");
    paint();
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }

  load();
  paint();
})();
