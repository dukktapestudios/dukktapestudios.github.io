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

  function horseSvg(card) {
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
    var bg = { History: "#1d3e52", Racing: "#6e3028", Breed: "#24543a" }[card.cat] || "#24543a";
    var spots = card.coat === "spotted"
      ? '<circle cx="78" cy="132" r="7" fill="' + light + '"/><circle cx="108" cy="124" r="5" fill="' + light + '"/><circle cx="96" cy="148" r="4" fill="' + light + '"/>'
      : "";
    return '<svg class="art" viewBox="0 0 220 250" role="img" aria-label="' + card.name + '">' +
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
      '<circle cx="168" cy="58" r="2.4" fill="#1a120c"/>' +
      "</svg>";
  }

  function bars(card) {
    function row(label, n) {
      return "<div>" + label + " " + n + '<div class="bar"><i style="width:' + (n * 10) + '%"></i></div></div>';
    }
    return '<div class="bars">' + row("Speed", card.speed) + row("Stamina", card.stamina) + row("Heart", card.heart) + "</div>";
  }

  function face(card) {
    return '<span class="num">' + card.n + "/" + total + "</span>" +
      '<span class="rarity">' + card.rarity + "</span>" +
      '<span class="artwin">' + horseSvg(card) + "</span>" +
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
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card " + card.rarity;
      btn.innerHTML = face(card);
      btn.addEventListener("click", function () { openZoom(card, btn); });
      grid.appendChild(btn);
    });
    empty.hidden = shown.length !== 0;
  }

  function openZoom(card, opener) {
    lastFocus = opener;
    zoomBody.innerHTML = '<div class="card ' + card.rarity + '">' + face(card) + "</div>";
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
  document.getElementById("q").addEventListener("input", function (e) {
    query = e.target.value.trim().toLowerCase();
    render();
  });
  document.getElementById("zoom-close").addEventListener("click", function () { zoom.close(); });
  zoom.addEventListener("click", function (e) { if (e.target === zoom) zoom.close(); });
  zoom.addEventListener("close", function () { if (lastFocus) lastFocus.focus(); });

  render();
})();
