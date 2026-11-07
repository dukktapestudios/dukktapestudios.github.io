/* Checklist marks only: known ids, true, and packet status words.
   No document text, names, or secrets belong in this object. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.DocStore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var KEY = "dukktape-documents-checklist-v1";
  var MAX_IMPORT = 100000;
  var STATUSES = { blank: true, partial: true, filed: true };

  function empty() {
    return { v: 1, checks: {}, status: {} };
  }

  function sanitize(raw, known) {
    var checkIds = {};
    var catIds = {};
    (known && known.checks ? known.checks : []).forEach(function (id) { checkIds[id] = true; });
    (known && known.categories ? known.categories : []).forEach(function (id) { catIds[id] = true; });
    var checks = {};
    var status = {};
    var src = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    var inChecks = src.checks && typeof src.checks === "object" && !Array.isArray(src.checks) ? src.checks : {};
    Object.keys(inChecks).forEach(function (id) {
      if (checkIds[id] && inChecks[id] === true) checks[id] = true;
    });
    var inStatus = src.status && typeof src.status === "object" && !Array.isArray(src.status) ? src.status : {};
    Object.keys(inStatus).forEach(function (id) {
      var value = inStatus[id];
      if (catIds[id] && STATUSES[value] && value !== "blank") status[id] = value;
    });
    return { v: 1, checks: checks, status: status };
  }

  function acceptedImport(raw, known) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, reason: "shape" };
    var hasChecks = !!raw.checks && typeof raw.checks === "object" && !Array.isArray(raw.checks);
    var hasStatus = !!raw.status && typeof raw.status === "object" && !Array.isArray(raw.status);
    if (raw.v !== 1 || !hasChecks || !hasStatus) return { ok: false, reason: "shape" };
    var clean = sanitize(raw, known);
    var incoming = Object.keys(raw.checks).length + Object.keys(raw.status).length;
    var recognized = Object.keys(clean.checks).length + Object.keys(clean.status).length;
    if (incoming > 0 && recognized === 0) return { ok: false, reason: "unrecognized" };
    return { ok: true, state: clean };
  }

  var SCHEDULE_KEY = "dukktape-documents-checklist-schedule-v1";
  var TOKEN = {
    day: /^\d{4}-\d{2}-\d{2}$/,
    month: /^\d{4}-\d{2}$/,
    quarter: /^\d{4}-Q[1-4]$/,
    half: /^\d{4}-H[12]$/,
    year: /^\d{4}$/
  };
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function periodToken(kind, date) {
    var y = date.getFullYear();
    var m = date.getMonth();
    if (kind === "day") return y + "-" + pad(m + 1) + "-" + pad(date.getDate());
    if (kind === "month") return y + "-" + pad(m + 1);
    if (kind === "quarter") return y + "-Q" + (Math.floor(m / 3) + 1);
    if (kind === "half") return y + "-H" + (m < 6 ? "1" : "2");
    if (kind === "year") return String(y);
    return "";
  }

  function periodLabel(kind, date) {
    var y = date.getFullYear();
    var m = date.getMonth();
    if (kind === "day") return "Today, " + MONTHS[m] + " " + date.getDate() + ", " + y + ". Clears the next day.";
    if (kind === "month") return MONTHS[m] + " " + y + ". Clears next month.";
    if (kind === "quarter") return "Q" + (Math.floor(m / 3) + 1) + " " + y + ". Clears next quarter.";
    if (kind === "half") return (m < 6 ? "Jan-Jun " : "Jul-Dec ") + y + ". Clears next half.";
    if (kind === "year") return y + ". Clears next year.";
    return "";
  }

  function sanitizeSchedule(raw, kinds) {
    var out = {};
    var src = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    Object.keys(src).forEach(function (id) {
      var kind = kinds[id];
      var value = src[id];
      if (!kind || typeof value !== "string" || !TOKEN[kind] || !TOKEN[kind].test(value)) return;
      out[id] = value;
    });
    return out;
  }

  function activeSchedule(raw, kinds, date) {
    var clean = sanitizeSchedule(raw, kinds);
    var active = {};
    Object.keys(clean).forEach(function (id) {
      if (clean[id] === periodToken(kinds[id], date)) active[id] = clean[id];
    });
    return active;
  }

  return {
    KEY: KEY,
    SCHEDULE_KEY: SCHEDULE_KEY,
    MAX_IMPORT: MAX_IMPORT,
    empty: empty,
    sanitize: sanitize,
    acceptedImport: acceptedImport,
    periodToken: periodToken,
    periodLabel: periodLabel,
    sanitizeSchedule: sanitizeSchedule,
    activeSchedule: activeSchedule
  };
});
