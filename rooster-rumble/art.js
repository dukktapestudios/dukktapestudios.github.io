(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CLUCK_ART = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var roosters = {
    blazecomb: "art/blazecomb-dawn-champion.webp",
    hothead: "art/hothead-brawler.webp",
    molten: "art/molten-wattle-bruiser.webp",
    grizzle: "art/old-guard-grizzlecrest.webp",
    steel: "art/steel-feather-hen.webp",
    fence: "art/fence-post-sentry.webp",
    zephra: "art/thunderwing-zephra.webp",
    cloud: "art/cloud-strutter.webp",
    pullet: "art/static-pullet.webp",
    mama: "art/big-mama-mossfeather.webp",
    charger: "art/corn-field-charger.webp",
    seed: "art/seed-pecker.webp",
    nightspur: "art/nightspur-the-shade.webp",
    grave: "art/graveyard-rooster.webp",
    bantam: "art/shadow-bantam.webp"
  };
  var supports = {
    grain: "art/grain.webp",
    golden: "art/golden-grain.webp",
    sunrise: "art/sunrise-crow.webp",
    flame: "art/flame-spur-kick.webp",
    phoenix: "art/phoenix-coop.webp",
    lockdown: "art/coop-lockdown.webp",
    shield: "art/shield-of-straw-and-steel.webp",
    ironroost: "art/iron-roost.webp",
    squawk: "art/squawk-back.webp",
    gust: "art/gust-of-feathers.webp",
    stormloft: "art/storm-loft.webp",
    frenzy: "art/feed-frenzy.webp",
    root: "art/root-and-rumble.webp",
    thorn: "art/thorn-hedge-nest.webp",
    scratch: "art/midnight-scratch.webp",
    hexward: "art/hex-ward.webp",
    moonless: "art/moonless-henhouse.webp",
    thanks: "art/farmers-thanks.webp",
    trough: "art/water-trough.webp",
    horseshoe: "art/lucky-horseshoe.webp",
    dummy: "art/training-dummy.webp",
    swap: "art/coop-swap.webp",
    feather: "art/lucky-feather.webp",
    scarecrow: "art/scarecrow-decoy.webp",
    bell: "art/wake-up-bell.webp"
  };

  function picture(src, lazy) {
    return '<img class="illu" src="' + src + '" alt="" width="600" height="800" draggable="false" decoding="async" loading="' + (lazy ? "lazy" : "eager") + '">';
  }

  function forRooster(id, lazy) {
    return picture(roosters[id] || roosters.blazecomb, lazy !== false);
  }

  function forSupport(id, lazy) {
    return picture(supports[id] || supports.grain, lazy !== false);
  }

  return { forRooster: forRooster, forSupport: forSupport };
});
