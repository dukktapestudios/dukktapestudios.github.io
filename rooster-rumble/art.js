(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CLUCK_ART = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var flock = {
    Sunfire: ["#e4572e", "#f6c28b", "#ffd166", "#c2410c"],
    Ironbeak: ["#9aa5b1", "#e7edf2", "#f2cc8f", "#495057"],
    Stormfeather: ["#3b5bdb", "#bac8ff", "#ffd43b", "#1864ab"],
    Wildroost: ["#2b8a3e", "#b2f2bb", "#e8590c", "#5c4b32"],
    Duskcomb: ["#5f3dc4", "#d0bfff", "#ff922b", "#2b2144"]
  };

  function svg(inner) {
    return '<svg class="illu" viewBox="0 0 80 64" aria-hidden="true">' + inner + "</svg>";
  }

  function bird(colors, comb, extra) {
    var b = colors[0], belly = colors[1], beak = colors[2], dark = colors[3];
    return svg(
      '<ellipse cx="34" cy="46" rx="16" ry="5" fill="' + dark + '" opacity=".25"/>' +
      '<ellipse cx="36" cy="40" rx="20" ry="14" fill="' + b + '"/>' +
      '<ellipse cx="34" cy="43" rx="12" ry="8" fill="' + belly + '"/>' +
      '<circle cx="56" cy="28" r="11" fill="' + b + '"/>' +
      comb +
      '<path d="M66 27 h10 l-8 4 z" fill="' + beak + '"/>' +
      '<circle cx="60" cy="26" r="1.7" fill="#1a120c"/>' +
      '<path d="M24 48 l-6 8 M32 50 l-2 8 M40 50 l4 8" stroke="' + dark + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      (extra || "")
    );
  }

  var combs = {
    blaze: '<path d="M50 16 l4-8 3 7 5-6 1 8 5-4 v8 h-18 z" fill="#ffd166"/>',
    hot: '<path d="M50 18 h16 v5 h-16 z" fill="#ffd166"/>',
    lava: '<ellipse cx="52" cy="18" rx="6" ry="4" fill="#ff6b6b"/>',
    helm: '<path d="M46 20 h18 v6 h-18 z" fill="#495057"/>',
    bow: '<path d="M48 18 h8 l2 4 h-12 z" fill="#e03131"/>',
    flat: '<rect x="48" y="18" width="14" height="3" fill="#ffd166"/>',
    bolt: '<path d="M54 12 l-4 8 h4 l-3 8 8-10 h-4 z" fill="#ffd43b"/>',
    puff: '<circle cx="50" cy="16" r="5" fill="#fff"/>',
    spike: '<path d="M48 20 l3-8 3 8 4-7 2 7 h-12 z" fill="#a5d8ff"/>',
    leaf: '<path d="M48 20 q8-12 14 0 q-8 2-14 0 z" fill="#2f9e44"/>',
    corn: '<rect x="50" y="14" width="8" height="8" rx="2" fill="#ffd43b"/>',
    seed: '<circle cx="52" cy="18" r="3" fill="#f4a261"/>',
    moon: '<path d="M52 14 a6 6 0 1 0 0 10 a4 4 0 1 1 0-10 z" fill="#f8f0c8"/>',
    bone: '<path d="M48 18 h12 M50 16 v6 M58 16 v6" stroke="#f8f4e8" stroke-width="2"/>',
    sly: '<path d="M56 22 h8" stroke="#1a120c" stroke-width="1"/>'
  };

  var roosters = {
    blazecomb: function (c) { return bird(c, combs.blaze, '<path d="M16 36 q-8 4 0 10 q6-4 0-10 z" fill="#ff922b"/>'); },
    hothead: function (c) { return bird(c, combs.hot, '<circle cx="22" cy="42" r="5" fill="#e03131"/><circle cx="48" cy="44" r="5" fill="#e03131"/>'); },
    molten: function (c) { return bird(c, combs.lava, '<ellipse cx="34" cy="44" rx="8" ry="5" fill="#ff6b6b"/>'); },
    grizzle: function (c) { return bird(c, combs.helm, '<path d="M18 34 h10 v12 h-10 z" fill="#ced4da" stroke="#495057"/>'); },
    steel: function (c) { return bird(c, combs.bow, '<path d="M22 36 q10 8 0 14 q8-6 0-14 z" fill="#dee2e6"/>'); },
    fence: function (c) { return bird(c, combs.flat, '<rect x="30" y="30" width="8" height="22" fill="#8d6e63"/>'); },
    zephra: function (c) { return bird(c, combs.bolt, '<path d="M18 34 l8 6-6 2 8 8" stroke="#ffd43b" stroke-width="2" fill="none"/>'); },
    cloud: function (c) { return bird(c, combs.puff, '<ellipse cx="22" cy="36" rx="8" ry="4" fill="#fff"/>'); },
    pullet: function (c) { return bird(c, combs.spike, '<circle cx="70" cy="20" r="2" fill="#ffd43b"/>'); },
    mama: function (c) { return bird(c, combs.leaf, '<ellipse cx="36" cy="52" rx="16" ry="4" fill="#5c4b32"/>'); },
    charger: function (c) { return bird(c, combs.corn, '<circle cx="24" cy="40" r="3" fill="#ffd43b"/>'); },
    seed: function (c) { return bird(c, combs.seed, '<circle cx="72" cy="30" r="2" fill="#f4a261"/>'); },
    nightspur: function (c) { return bird(c, combs.moon, '<path d="M20 30 l6 14" stroke="#2b2144" stroke-width="2"/>'); },
    grave: function (c) { return bird(c, combs.bone, '<circle cx="58" cy="27" r="1.4" fill="#1a120c"/>'); },
    bantam: function (c) { return bird(c, combs.sly, '<path d="M16 44 h12 v8 h-8 z" fill="#6b4f3a"/>'); }
  };

  function icon(bg, inner) {
    return svg('<rect x="8" y="6" width="64" height="52" rx="8" fill="' + bg + '"/>' + inner);
  }

  var supports = {
    grain: function () { return icon("#f4e4b0", '<path d="M40 46 V18 M40 22 q-8-2-6 6 M40 28 q8-2 6 6 M40 34 q-8-2-6 6" stroke="#c2410c" stroke-width="2" fill="none"/>'); },
    golden: function () { return icon("#ffe8a3", '<path d="M40 46 V18 M40 24 q-8-2-6 6 M40 32 q8-2 6 6" stroke="#e67700" stroke-width="2" fill="none"/><path d="M54 14 l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1 z" fill="#ffd43b"/>'); },
    sunrise: function () { return icon("#ffd8a8", '<circle cx="40" cy="30" r="10" fill="#ff922b"/><path d="M40 14 v6 M40 40 v6 M24 30 h6 M50 30 h6" stroke="#f08c00" stroke-width="2"/>'); },
    flame: function () { return icon("#ffc9c9", '<path d="M40 44 c8-8 4-16 0-22 c-2 8-8 10-6 18 c4 2 8 2 6 4 z" fill="#e03131"/>'); },
    phoenix: function () { return icon("#ffd8a8", '<path d="M24 40 h32 v8 h-32 z" fill="#e8590c"/><path d="M30 40 v-8 h6 v8 M44 40 v-10 h6 v10" fill="#f08c00"/>'); },
    lockdown: function () { return icon("#dee2e6", '<path d="M28 20 h24 v22 h-24 z" fill="none" stroke="#495057" stroke-width="3"/><path d="M40 28 v8" stroke="#495057" stroke-width="3"/>'); },
    shield: function () { return icon("#e9ecef", '<path d="M40 16 l14 6 v10 c0 8-6 14-14 16 c-8-2-14-8-14-16 v-10 z" fill="#ced4da" stroke="#495057"/>'); },
    ironroost: function () { return icon("#dee2e6", '<path d="M22 40 l18-14 18 14 v12 h-36 z" fill="#868e96"/>'); },
    squawk: function () { return icon("#d0ebff", '<path d="M22 36 q10-16 22-6 q8 2 10 10 q-12 2-18 8 q-6-4-14-12 z" fill="#fff" stroke="#1c7ed6"/>'); },
    gust: function () { return icon("#d0ebff", '<path d="M18 28 h28 M16 36 h34 M20 44 h24" stroke="#1c7ed6" stroke-width="3" stroke-linecap="round"/>'); },
    stormloft: function () { return icon("#d0ebff", '<path d="M24 40 l16-12 16 12 v10 h-32 z" fill="#4dabf7"/><path d="M48 22 l-3 6 h4 l-3 6" stroke="#ffd43b" stroke-width="2" fill="none"/>'); },
    frenzy: function () { return icon("#d3f9d8", '<circle cx="32" cy="32" r="6" fill="#f4a261"/><circle cx="48" cy="34" r="6" fill="#e67700"/>'); },
    root: function () { return icon("#d3f9d8", '<path d="M40 18 v12 M40 30 q-10 8-8 16 M40 30 q10 8 8 16 M40 34 v14" stroke="#2b8a3e" stroke-width="3" fill="none"/>'); },
    thorn: function () { return icon("#d3f9d8", '<path d="M28 40 q12-16 24 0 q-12 6-24 0 z" fill="#8ce99a" stroke="#2b8a3e"/><path d="M32 36 l-4-6 M40 32 v-6 M48 36 l4-6" stroke="#2b8a3e" stroke-width="2"/>'); },
    scratch: function () { return icon("#e5dbff", '<path d="M30 20 l-6 24 M40 16 l-2 28 M50 20 l4 24" stroke="#5f3dc4" stroke-width="3" stroke-linecap="round"/>'); },
    hexward: function () { return icon("#e5dbff", '<circle cx="40" cy="32" r="10" fill="none" stroke="#7048e8" stroke-width="3"/><circle cx="40" cy="32" r="3" fill="#7048e8"/>'); },
    moonless: function () { return icon("#d0bfff", '<path d="M26 40 l14-12 14 12 v12 h-28 z" fill="#5f3dc4"/><path d="M52 16 a5 5 0 1 0 0 8 a3 3 0 1 1 0-8 z" fill="#f8f0c8"/>'); },
    thanks: function () { return icon("#fff3bf", '<path d="M28 34 h24 v10 h-24 z" fill="#f08c00"/><path d="M30 34 q10-10 20 0" fill="#ffe8cc" stroke="#e67700"/>'); },
    trough: function () { return icon("#d0ebff", '<path d="M22 36 h36 v6 c0 6-8 10-18 10 s-18-4-18-10 z" fill="#4dabf7"/>'); },
    horseshoe: function () { return icon("#fff3bf", '<path d="M30 22 h6 v16 h-6 z M44 22 h6 v16 h-6 z M30 18 h20 v8 h-20 z" fill="#868e96"/>'); },
    dummy: function () { return icon("#fff3bf", '<circle cx="40" cy="32" r="12" fill="none" stroke="#e67700" stroke-width="3"/><circle cx="40" cy="32" r="4" fill="#e03131"/>'); },
    swap: function () { return icon("#fff3bf", '<path d="M24 28 h28 l-6-6 M56 40 h-28 l6 6" stroke="#e67700" stroke-width="3" fill="none"/>'); },
    feather: function () { return icon("#fff3bf", '<path d="M48 16 q-16 10-20 28 q14-4 20-28 z" fill="#fff" stroke="#868e96"/>'); },
    scarecrow: function () { return icon("#ffe8cc", '<circle cx="40" cy="24" r="6" fill="#f4a261"/><path d="M24 34 h32 M40 30 v16" stroke="#5c4b32" stroke-width="3"/>'); },
    bell: function () { return icon("#fff3bf", '<path d="M32 28 q0-10 8-10 t8 10 v10 h-16 z" fill="#ffd43b" stroke="#e67700"/><circle cx="40" cy="42" r="2" fill="#e67700"/>'); }
  };

  function forRooster(id) {
    var card = globalThis.CLUCK_CARDS && globalThis.CLUCK_CARDS.roosterById[id];
    var colors = flock[(card && card.flock) || "Sunfire"];
    var draw = roosters[id] || roosters.blazecomb;
    return draw(colors);
  }

  function forSupport(id) {
    var draw = supports[id] || supports.grain;
    return draw();
  }

  return { forRooster: forRooster, forSupport: forSupport };
});
