/* Published mold-level rule. The same function scores every person.
   Component points are rounded to one decimal (halves round up), then capped.
   Mold level is the sum of available component points, rounded to an integer
   (halves round up). If a component is no data, it is left out and the sum is
   scaled to 100 by the remaining maximums. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MoldScore = api;
})(typeof self !== "undefined" ? self : this, function () {
  var MAX = { pac_share: 50, missed_votes: 35, ethics: 15 };
  var MISSED_MULTIPLIER = 3.5;
  var ETHICS = { none: 0, finding: 8, sanction: 15 };

  function round1(n) {
    return Math.round((n + Number.EPSILON) * 10) / 10;
  }

  function sumTenths(values) {
    var tenths = 0;
    values.forEach(function (value) {
      tenths += Math.round((value + Number.EPSILON) * 10);
    });
    return tenths / 10;
  }

  function ethicsPoints(tier) {
    if (tier === "no_data" || tier === undefined || tier === null) return null;
    if (Object.prototype.hasOwnProperty.call(ETHICS, tier)) return ETHICS[tier];
    return null;
  }

  function scorePolitician(person) {
    var pacRaw = null;
    var pacRounded = null;
    var pacPts = null;
    var receipts = person.pac ? Number(person.pac.total_receipts) : 0;
    if (person.pac && receipts > 0 && person.pac.other_committee !== undefined && person.pac.other_committee !== null) {
      pacRaw = (Number(person.pac.other_committee) / receipts) * 100;
      pacRounded = round1(pacRaw);
      pacPts = Math.min(MAX.pac_share, pacRounded);
    }

    var missedRaw = null;
    var missedProduct = null;
    var missedRounded = null;
    var missedPts = null;
    if (person.votes && person.votes.eligible > 0 && person.votes.missed !== undefined && person.votes.missed !== null) {
      missedRaw = (person.votes.missed / person.votes.eligible) * 100;
      missedProduct = missedRaw * MISSED_MULTIPLIER;
      missedRounded = round1(missedProduct);
      missedPts = Math.min(MAX.missed_votes, missedRounded);
    }

    var ethicsPts = ethicsPoints(person.ethics && person.ethics.tier);
    var parts = [
      { id: "pac_share", points: pacPts, max: MAX.pac_share, raw: pacRaw, rounded: pacRounded },
      { id: "missed_votes", points: missedPts, max: MAX.missed_votes, raw: missedRaw, product: missedProduct, rounded: missedRounded },
      { id: "ethics", points: ethicsPts, max: MAX.ethics }
    ];
    var available = parts.filter(function (part) { return part.points !== null && part.points !== undefined; });
    if (!available.length) {
      return { parts: parts, sum: null, max: 0, mold: null, complete: false };
    }
    var sum = sumTenths(available.map(function (part) { return part.points; }));
    var max = available.reduce(function (total, part) { return total + part.max; }, 0);
    var scaled = max === 100 ? sum : (100 * sum / max);
    return {
      parts: parts,
      sum: sum,
      max: max,
      mold: Math.round(scaled),
      complete: available.length === parts.length
    };
  }

  return {
    MAX: MAX,
    MISSED_MULTIPLIER: MISSED_MULTIPLIER,
    ETHICS: ETHICS,
    round1: round1,
    sumTenths: sumTenths,
    ethicsPoints: ethicsPoints,
    scorePolitician: scorePolitician
  };
});
