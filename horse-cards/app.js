(function () {
  var cards = window.HOOF_CARDS || [];
  var total = cards.filter(function (card) { return !card.idCard; }).length;
  var idTotal = cards.filter(function (card) { return card.idCard; }).length;
  var setTotal = total + idTotal;
  var cat = "all";
  var rarity = "all";
  var query = "";
  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var zoom = document.getElementById("zoom");
  var zoomBody = document.getElementById("zoom-body");
  var lastFocus = null;

  var TIERS = [
    { id: "base", label: "Base", icon: "●" }
  ];
  // Horseshoe count and color per rarity. Open end points down.
  var RARITY_SHOES = {
    Common: 1,
    Uncommon: 2,
    Rare: 3,
    Legendary: 4
  };
  var tier = "base";
  var picks = {};

  function tierById(id) {
    for (var i = 0; i < TIERS.length; i++) if (TIERS[i].id === id) return TIERS[i];
    return TIERS[0];
  }

  function tierOf(card) {
    return picks[card.id] || tier;
  }

  function horseSvg(card, which) {
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
    var coat = pair[0];
    var mane = pair[1];
    var light = pair[2];
    var bg = ({ History: "#1d3e52", Racing: "#6e3028", Breed: "#24543a" }[card.cat] || "#24543a");
    var rim = "";
    var spots = card.coat === "spotted"
      ? '<circle cx="78" cy="132" r="7" fill="' + light + '"/><circle cx="108" cy="124" r="5" fill="' + light + '"/><circle cx="96" cy="148" r="4" fill="' + light + '"/>'
      : "";
    return '<svg class="art" viewBox="0 0 220 250" role="img" aria-label="' + card.name + '">' +
      '<rect width="220" height="250" rx="12" fill="' + bg + '"/>' + rim +
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
      '<circle cx="168" cy="58" r="2.4" fill="#1a120c"/>' +
      "</svg>";
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function artBlock(card) {
    return '<span class="artwin"><img class="photo" alt="' + esc(card.name) + '" src="photos/' + card.id + '.jpg?v=2026103133"></span>';
  }

  function shoeSvg() {
    return '<svg class="shoe" viewBox="0 0 18 16" aria-hidden="true"><path d="M3.2 1.4V7.8C3.2 12.2 14.8 12.2 14.8 7.8V1.4" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>';
  }

  function rarityMark(card) {
    var count = RARITY_SHOES[card.rarity];
    if (!count) return "";
    var shoes = "";
    for (var i = 0; i < count; i++) shoes += shoeSvg();
    return '<span class="shoes">' + shoes + '<span class="sr">' + esc(card.rarity) + "</span></span>";
  }

  function face(card) {
    var numText = (card.idCard ? total + card.n : card.n) + "/" + setTotal;
    var kind = card.idCard
      ? '<span class="kind">' + (card.idKind === "color" ? "ID · COLOR" : "ID") + "</span>"
      : "";
    return '<span class="name">' + card.name + "</span>" +
      kind +
      artBlock(card) +
      '<span class="fact">' + card.fact + "</span>" +
      '<span class="foot">' + rarityMark(card) +
      '<span class="num">' + numText + "</span></span>";
  }

  function switcher(card) {
    var which = tierOf(card);
    return TIERS.map(function (spec) {
      var on = spec.id === which;
      return '<button type="button" data-tier-pick="' + spec.id + '" aria-pressed="' + (on ? "true" : "false") + '" aria-label="' + spec.label + '">' + spec.icon + "</button>";
    }).join("");
  }

  function matches(card) {
    if (cat !== "all" && card.cat !== cat) return false;
    if (rarity !== "all" && card.rarity !== rarity) return false;
    if (!query) return true;
    return (card.name + " " + card.fact + " " + card.when + " " + card.cat).toLowerCase().indexOf(query) !== -1;
  }

  function cardClass(card, which) {
    return "card " + card.rarity + " tier-" + which;
  }

  function paintSlot(slot, card) {
    var which = tierOf(card);
    var btn = slot.querySelector(".card");
    btn.className = cardClass(card, which);
    btn.innerHTML = face(card, which);
    slot.querySelector(".tier-switch").innerHTML = switcher(card);
  }

  function render() {
    var shown = cards.filter(matches);
    grid.replaceChildren();
    var labeled = false;
    shown.forEach(function (card) {
      if (card.idCard && !labeled) {
        var heading = document.createElement("h2");
        heading.className = "group-label";
        heading.textContent = "Colors & Breeds";
        grid.appendChild(heading);
        labeled = true;
      }
      var slot = document.createElement("div");
      slot.className = "slot";
      slot.setAttribute("data-id", card.id);
      slot.innerHTML = '<div class="card-scale"><button type="button" class="card"></button></div><div class="tier-switch" role="group" aria-label="Tiers for ' + card.name + '"></div>';
      paintSlot(slot, card);
      slot.querySelector(".card").addEventListener("click", function () { openZoom(card, slot.querySelector(".card")); });
      slot.querySelector(".tier-switch").addEventListener("click", function (e) {
        var pick = e.target.closest("[data-tier-pick]");
        if (!pick) return;
        picks[card.id] = pick.getAttribute("data-tier-pick");
        paintSlot(slot, card);
        if (zoom.open && zoomBody.getAttribute("data-id") === card.id) fillZoom(card);
      });
      grid.appendChild(slot);
    });
    empty.hidden = shown.length !== 0;
  }

  function fillZoom(card) {
    var which = tierOf(card);
    zoomBody.setAttribute("data-id", card.id);
    zoomBody.innerHTML = '<div class="card-scale"><div class="' + cardClass(card, which) + '">' + face(card, which) + '</div></div><div class="tier-switch" role="group" aria-label="Tiers for ' + card.name + '">' + switcher(card) + "</div>";
  }

  function openZoom(card, opener) {
    lastFocus = opener;
    fillZoom(card);
    if (typeof zoom.showModal === "function") zoom.showModal();
    document.getElementById("zoom-close").focus();
  }

  var filtersToggle = document.getElementById("filters-toggle");
  var filterPanel = document.getElementById("filter-panel");
  filtersToggle.addEventListener("click", function () {
    var open = filtersToggle.getAttribute("aria-expanded") === "true";
    filtersToggle.setAttribute("aria-expanded", open ? "false" : "true");
    filterPanel.hidden = open;
    filtersToggle.querySelector(".filters-arrow").textContent = open ? "▼" : "▲";
  });

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
  document.querySelectorAll("[data-tier]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      tier = btn.getAttribute("data-tier");
      picks = {};
      document.querySelectorAll("[data-tier]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      render();
    });
  });
  zoomBody.addEventListener("click", function (e) {
    var pick = e.target.closest("[data-tier-pick]");
    if (!pick) return;
    var id = zoomBody.getAttribute("data-id");
    var card = null;
    cards.forEach(function (c) { if (c.id === id) card = c; });
    if (!card) return;
    picks[card.id] = pick.getAttribute("data-tier-pick");
    fillZoom(card);
    var slot = grid.querySelector('.slot[data-id="' + card.id + '"]');
    if (slot) paintSlot(slot, card);
  });
  document.getElementById("q").addEventListener("input", function (e) {
    query = e.target.value.trim().toLowerCase();
    render();
  });
  document.getElementById("zoom-close").addEventListener("click", function () { zoom.close(); });
  zoom.addEventListener("click", function (e) { if (e.target === zoom) zoom.close(); });
  zoom.addEventListener("close", function () { if (lastFocus) lastFocus.focus(); });

  render();
})();
