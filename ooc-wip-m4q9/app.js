(function () {
  var cards = window.OOC_CARDS || [];
  var art = [
    ["lore-dump.jpg", "Lore Dump"],
    ["that-weird-kid.jpg", "That Weird Kid"],
    ["banned-in-all-formats.jpg", "Banned in All Formats"],
    ["check-engine-light.jpg", "Check Engine Light"],
    ["overpowered-dragon.jpg", "Overpowered Dragon of Ultimate Destiny"],
    ["tax-evasion.jpg", "Tax Evasion"],
    ["your-ex-wants-you-back.jpg", "Your Ex Wants You Back"],
    ["honda-civic-mint.jpg", "1993 Honda Civic \"Mint\""],
    ["power-creep.jpg", "Power Creep"],
    ["social-anxiety.jpg", "Social Anxiety"],
    ["pocket-lint.jpg", "Pocket Lint and a Penny"],
    ["forbidden-spatula.jpg", "Ancient Forbidden Spatula of the Elder Realm"],
    ["400-reprint.jpg", "$400 Reprint"]
  ];
  var gallery = document.getElementById("gallery-grid");
  var tbody = document.querySelector("#card-table tbody");
  var count = document.getElementById("list-count");
  var empty = document.getElementById("list-empty");
  var zoom = document.getElementById("zoom");
  var zoomImg = document.getElementById("zoom-img");
  var color = document.getElementById("filter-color");
  var type = document.getElementById("filter-type");
  var rarity = document.getElementById("filter-rarity");

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  art.forEach(function (item) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = '<img alt="' + esc(item[1]) + ' card" src="cards/' + item[0] + '" width="750" height="1050">';
    btn.addEventListener("click", function () {
      zoomImg.alt = item[1] + " card";
      zoomImg.src = "cards/" + item[0];
      if (typeof zoom.showModal === "function") zoom.showModal();
    });
    gallery.appendChild(btn);
  });

  function render() {
    var shown = cards.filter(function (card) {
      if (color.value !== "all" && card.color !== color.value) return false;
      if (type.value !== "all" && card.type !== type.value) return false;
      if (rarity.value !== "all" && card.rarity !== rarity.value) return false;
      return true;
    });
    tbody.innerHTML = shown.map(function (card) {
      return "<tr><td>" + esc(card.name) + "</td><td>" + esc(card.color) + "</td><td>" + esc(card.type) +
        "</td><td>" + esc(card.cost) + "</td><td>" + esc(card.rarity) + "</td><td>" + esc(card.pt) +
        "</td><td>" + esc(card.rules) + "</td><td>" + esc(card.flavor) + "</td></tr>";
    }).join("");
    count.textContent = shown.length + " of " + cards.length;
    empty.hidden = shown.length !== 0;
  }

  [color, type, rarity].forEach(function (el) { el.addEventListener("change", render); });
  document.getElementById("zoom-close").addEventListener("click", function () { zoom.close(); });
  zoom.addEventListener("click", function (e) { if (e.target === zoom) zoom.close(); });
  render();
})();
