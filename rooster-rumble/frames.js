(function (root) {
  function rarityFor(energy) {
    var n = energy || 0;
    if (n >= 5) return "legendary";
    if (n >= 3) return "rare";
    if (n >= 2) return "uncommon";
    return "common";
  }

  function rarityLabel(rarity) {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  }

  function mark(rarity) {
    if (rarity === "legendary") return "✦";
    if (rarity === "rare") return "★";
    if (rarity === "uncommon") return "◆";
    return "●";
  }

  function classes(flock, energy) {
    return "tcard flock-" + flock + " rarity-" + rarityFor(energy);
  }

  var setMark = '<svg class="setmark" viewBox="0 0 16 16" aria-label="First Flock"><title>First Flock</title><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path fill="currentColor" d="M7.2 4.2h1.7V12H7.2z"/></svg>';

  function html(o) {
    var e = o.esc;
    var rarity = rarityFor(o.energy);
    var tag = o.nameTag === "h2" ? "h2" : "div";
    var idAttr = o.nameId ? ' id="' + e(o.nameId) + '"' : "";
    return '<span class="gem" aria-label="Energy ' + e(o.energy || 0) + '">' + e(o.energy || 0) + "</span>" +
      '<div class="face">' +
      '<div class="namebar"><' + tag + ' class="cname"' + idAttr + ">" + e(o.name) + "</" + tag + "></div>" +
      '<div class="artwin">' + o.artHtml + "</div>" +
      '<div class="typeline">' + e(o.typeLine) + "</div>" +
      '<div class="textbox">' + o.bodyHtml + "</div>" +
      '<div class="footbar"><span class="cnum">' + e(o.number) + "</span>" + setMark +
      '<span class="rmark" title="' + rarityLabel(rarity) + '">' + mark(rarity) + "</span></div>" +
      "</div>";
  }

  root.CLUCK_FRAME = {
    rarityFor: rarityFor,
    classes: classes,
    html: html
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
