(function () {
  var cards = window.HOOF_CARDS || [];
  var total = cards.length;
  var KEY = "hoofprint-legends-owned-v1";
  var WEIGHT = { Common: 40, Uncommon: 14, Rare: 5, Legendary: 1 };
  var cat = "all";
  var rarity = "all";
  var query = "";
  var owned = {};
  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var countEl = document.getElementById("count");
  var zoom = document.getElementById("zoom");
  var zoomBody = document.getElementById("zoom-body");
  var packDialog = document.getElementById("pack-dialog");
  var packBody = document.getElementById("pack-body");
  var lastFocus = null;

  try {
    JSON.parse(localStorage.getItem(KEY) || "[]").forEach(function (id) { owned[id] = true; });
  } catch (err) {}

  function save() {
    var ids = Object.keys(owned);
    try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch (err) {}
    countEl.textContent = ids.length + "/" + total;
  }

  function hash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
    return h;
  }

  function horseSvg(card, shadow) {
    var coats = {
      bay: ["#6e3d22", "#2a160e", "#e0b07a"],
      chestnut: ["#a34d2c", "#3d1a10", "#f0c49a"],
      black: ["#241c18", "#0c0a09", "#6b625a"],
      gray: ["#d9d3c8", "#6a645c", "#f7f4ee"],
      dun: ["#c6a56e", "#3a3124", "#8d6b38"],
      palomino: ["#e0b25c", "#f4e4b4", "#fff6dc"],
      spotted: ["#f6f1e6", "#2b241c", "#fff"],
      cream: ["#f3e2b6", "#fff8ea", "#fffdf8"],
      roan: ["#8d5b5a", "#3a2424", "#e4c2ba"],
      white: ["#f7f4ee", "#d5cbb8", "#fff"],
      brown: ["#5a3a26", "#24160e", "#c49262"],
      buckskin: ["#c4924a", "#1c140c", "#efd39a"]
    };
    var pair = coats[card.coat] || coats.bay;
    var coat = shadow ? "#2a241c" : pair[0];
    var mane = shadow ? "#1a1612" : pair[1];
    var light = shadow ? "#3a342c" : pair[2];
    var bg = shadow ? "#cbbfa6" : ({ History: "#1d3e52", Racing: "#6e3028", Breed: "#24543a" }[card.cat] || "#24543a");
    var spots = !shadow && card.coat === "spotted"
      ? '<circle cx="78" cy="132" r="7" fill="' + light + '"/><circle cx="108" cy="124" r="5" fill="' + light + '"/><circle cx="96" cy="148" r="4" fill="' + light + '"/>'
      : "";
    var eye = shadow ? "" : '<circle cx="168" cy="58" r="2.4" fill="#1a120c"/>';
    return '<svg class="art" viewBox="0 0 220 250" role="img" aria-label="' + (shadow ? "Uncollected horse" : card.name) + '">' +
      '<rect width="220" height="250" rx="12" fill="' + bg + '"/>' +
      '<ellipse cx="110" cy="214" rx="74" ry="10" fill="rgba(0,0,0,.28)"/>' +
      '<path d="M58 132 C24 150 22 196 46 214" stroke="' + mane + '" stroke-width="12" fill="none" stroke-linecap="round"/>' +
      '<path d="M70 168 v46 M90 174 v44" stroke="' + coat + '" stroke-width="11" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="104" cy="142" rx="58" ry="36" fill="' + coat + '"/>' +
      spots +
      '<path d="M128 170 v48 M150 164 v50" stroke="' + coat + '" stroke-width="11" fill="none" stroke-linecap="round"/>' +
      '<path d="M146 118 C170 96 176 70 158 46 L132 72 C156 88 150 108 136 126 Z" fill="' + coat + '"/>' +
      '<ellipse cx="162" cy="58" rx="30" ry="16" transform="rotate(-18 162 58)" fill="' + coat + '"/>' +
      '<path d="M146 40 L154 16 L168 42 Z" fill="' + coat + '"/>' +
      '<path d="M150 34 C128 62 130 102 140 128" stroke="' + mane + '" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      eye +
      "</svg>";
  }

  function bars(card) {
    function row(label, n) {
      return "<div>" + label + " " + n + "<div class=\"bar\"><i style=\"width:" + (n * 10) + "%\"></i></div></div>";
    }
    return "<div class=\"bars\">" + row("Speed", card.speed) + row("Stamina", card.stamina) + row("Heart", card.heart) + "</div>";
  }

  function face(card, shadow) {
    var num = card.n + "/" + total;
    if (shadow) {
      return '<span class="num">' + num + "</span>" +
        '<span class="rarity">' + card.rarity + "</span>" +
        horseSvg(card, true) +
        '<span class="name">?</span>' +
        '<span class="meta">' + card.cat + "</span>";
    }
    return '<span class="num">' + num + "</span>" +
      '<span class="rarity">' + card.rarity + "</span>" +
      horseSvg(card, false) +
      '<span class="name">' + card.name + "</span>" +
      '<span class="meta">' + card.cat + " · " + card.when + "</span>" +
      bars(card) +
      '<span class="fact">' + card.fact + "</span>";
  }

  function matches(card) {
    if (cat !== "all" && card.cat !== cat) return false;
    if (rarity !== "all" && card.rarity !== rarity) return false;
    if (!query) return true;
    return (card.name + " " + card.fact + " " + card.when + " " + card.cat).toLowerCase().indexOf(query) !== -1;
  }

  function render() {
    var shown = cards.filter(matches);
    grid.replaceChildren();
    shown.forEach(function (card) {
      var have = !!owned[card.id];
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card " + card.rarity + (have ? "" : " locked");
      btn.innerHTML = face(card, !have);
      btn.addEventListener("click", function () { openZoom(card, btn); });
      grid.appendChild(btn);
    });
    empty.hidden = shown.length !== 0;
  }

  function openZoom(card, opener) {
    lastFocus = opener;
    var have = !!owned[card.id];
    zoomBody.innerHTML = have ? face(card, false) : (face(card, true) + '<p class="fact">Not in your collection yet. Open a pack.</p>');
    if (typeof zoom.showModal === "function") zoom.showModal();
    document.getElementById("zoom-close").focus();
  }

  function drawPack() {
    var pool = cards.slice();
    var out = [];
    var i, j, acc, roll, sum;
    for (i = 0; i < 5 && pool.length; i++) {
      sum = 0;
      for (j = 0; j < pool.length; j++) sum += WEIGHT[pool[j].rarity] || 1;
      roll = Math.random() * sum;
      acc = 0;
      for (j = 0; j < pool.length; j++) {
        acc += WEIGHT[pool[j].rarity] || 1;
        if (roll <= acc) { out.push(pool.splice(j, 1)[0]); break; }
      }
    }
    return out;
  }

  function openPack() {
    var pulled = drawPack();
    packBody.replaceChildren();
    pulled.forEach(function (card) {
      var isNew = !owned[card.id];
      owned[card.id] = true;
      var div = document.createElement("div");
      div.className = "pack-card" + (isNew ? " new" : "");
      div.innerHTML = '<div class="tag">' + (isNew ? "New" : "Already owned") + "</div>" + face(card, false);
      packBody.appendChild(div);
    });
    save();
    render();
    if (typeof packDialog.showModal === "function") packDialog.showModal();
  }

  document.querySelectorAll("[data-cat]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      cat = btn.getAttribute("data-cat");
      document.querySelectorAll("[data-cat]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      render();
    });
  });
  document.querySelectorAll("[data-rarity]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      rarity = btn.getAttribute("data-rarity");
      document.querySelectorAll("[data-rarity]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      render();
    });
  });
  document.getElementById("q").addEventListener("input", function (e) {
    query = e.target.value.trim().toLowerCase();
    render();
  });
  document.getElementById("pack").addEventListener("click", openPack);
  document.getElementById("zoom-close").addEventListener("click", function () { zoom.close(); });
  document.getElementById("pack-close").addEventListener("click", function () { packDialog.close(); });
  zoom.addEventListener("click", function (e) { if (e.target === zoom) zoom.close(); });
  packDialog.addEventListener("click", function (e) { if (e.target === packDialog) packDialog.close(); });
  zoom.addEventListener("close", function () { if (lastFocus) lastFocus.focus(); });

  save();
  render();
})();
