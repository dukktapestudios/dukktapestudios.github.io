(function () {
  var cards = window.HOOF_CARDS || [];
  var total = cards.length;
  var cat = "all";
  var rarity = "all";
  var query = "";
  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var zoom = document.getElementById("zoom");
  var zoomBody = document.getElementById("zoom-body");
  var lastFocus = null;

  var TIERS = [
    { id: "base", label: "Base", icon: "●" },
    { id: "silver", label: "Silver", icon: "◆" },
    { id: "gold", label: "Gold", icon: "★" },
    { id: "champion", label: "Champion", icon: "♛" }
  ];
  var tier = "base";
  var picks = {};

  function tierById(id) {
    for (var i = 0; i < TIERS.length; i++) if (TIERS[i].id === id) return TIERS[i];
    return TIERS[0];
  }

  function serialOf(card) {
    var h = 0;
    var i;
    for (i = 0; i < card.id.length; i++) h = (h * 33 + card.id.charCodeAt(i)) >>> 0;
    return ((h % 25) + 1) + "/25";
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
    var bg = which === "champion"
      ? "#1a1408"
      : ({ History: "#1d3e52", Racing: "#6e3028", Breed: "#24543a" }[card.cat] || "#24543a");
    var rim = which === "champion"
      ? '<rect x="8" y="8" width="204" height="234" rx="10" fill="none" stroke="#e2b143" stroke-width="4"/>'
      : "";
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

  var photoById = {};

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function artBlock(card) {
    var photo = photoById[card.id];
    if (!photo) return '<span class="artwin"><span class="needs-art">Needs art</span></span>';
    var creditText = (photo.author && photo.author.indexOf("Art:") === 0)
      ? photo.author
      : "Photo: " + (photo.author || "Wikimedia Commons") + ", " + (photo.license || "");
    return '<span class="artwin"><img class="photo" alt="' + esc(card.name) + '" src="' + photo.file + '"></span>' +
      '<span class="credit">' + esc(creditText) + "</span>";
  }

  function shoeMark(which) {
    if (which !== "silver" && which !== "gold") return "";
    var metal = which === "gold"
      ? { body: "#c9a227", edge: "#f4e4a8", hole: "#6a4c10", shade: "#8d6a12" }
      : { body: "#c5ced8", edge: "#f5f8fb", hole: "#5c6773", shade: "#8b97a6" };
    var band = "M30 10 C27 26 24 46 36 62 C44 74 56 74 64 62 C76 46 73 26 70 10";
    return '<span class="shoe">' +
      '<svg viewBox="0 0 100 86" aria-hidden="true">' +
      '<path d="' + band + '" fill="none" stroke="' + metal.shade + '" stroke-width="18" stroke-linecap="butt"/>' +
      '<path d="' + band + '" fill="none" stroke="' + metal.body + '" stroke-width="14" stroke-linecap="butt"/>' +
      '<path d="' + band + '" fill="none" stroke="' + metal.edge + '" stroke-width="4" stroke-linecap="butt" opacity=".7"/>' +
      '<circle cx="31" cy="22" r="2.5" fill="' + metal.hole + '"/>' +
      '<circle cx="29" cy="34" r="2.5" fill="' + metal.hole + '"/>' +
      '<circle cx="33" cy="46" r="2.4" fill="' + metal.hole + '"/>' +
      '<circle cx="69" cy="22" r="2.5" fill="' + metal.hole + '"/>' +
      '<circle cx="71" cy="34" r="2.5" fill="' + metal.hole + '"/>' +
      '<circle cx="67" cy="46" r="2.4" fill="' + metal.hole + '"/>' +
      "</svg></span>";
  }

  function face(card, which) {
    var spec = tierById(which);
    var serial = which === "champion" ? '<span class="serial">' + serialOf(card) + "</span>" : "";
    return '<span class="head"><span><span class="num">' + card.n + "/" + total + "</span>" +
      '<span class="rarity">' + card.rarity + "</span></span>" +
      '<span class="tier-mark"><span class="tier-icon" aria-hidden="true">' + spec.icon + "</span> " + spec.label + serial + "</span></span>" +
      artBlock(card) +
      '<span class="name">' + card.name + "</span>" +
      '<span class="fact">' + card.fact + "</span>" +
      shoeMark(which);
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
    shown.forEach(function (card) {
      var slot = document.createElement("div");
      slot.className = "slot";
      slot.setAttribute("data-id", card.id);
      slot.innerHTML = '<button type="button" class="card"></button><div class="tier-switch" role="group" aria-label="Tiers for ' + card.name + '"></div>';
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
    zoomBody.innerHTML = '<div class="' + cardClass(card, which) + '">' + face(card, which) + '</div><div class="tier-switch" role="group" aria-label="Tiers for ' + card.name + '">' + switcher(card) + "</div>";
  }

  function openZoom(card, opener) {
    lastFocus = opener;
    fillZoom(card);
    if (typeof zoom.showModal === "function") zoom.showModal();
    document.getElementById("zoom-close").focus();
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

  fetch("image-credits.json").then(function (res) { return res.json(); }).then(function (rows) {
    rows.forEach(function (row) {
      if (row.status === "found" && row.file) photoById[row.id] = row;
    });
    render();
  }).catch(function () { render(); });
})();
