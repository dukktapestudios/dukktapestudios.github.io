/* Shared rules for the One Small Win checklist.
   The browser lesson and the tests use this file.
   The Expo starter repeats the same limits in starter/src/lib/wins.ts. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.OneSmallWin = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var MAX = 120;
  var MAX_ITEMS = 200;

  function normalizeText(text) {
    return String(text == null ? "" : text).replace(/\s+/g, " ").trim();
  }

  function validItem(item) {
    if (!item || typeof item !== "object") return false;
    if (typeof item.id !== "string" || !item.id) return false;
    if (typeof item.text !== "string") return false;
    var text = normalizeText(item.text);
    if (!text || text.length > MAX) return false;
    return true;
  }

  function addWin(list, text, now) {
    var source = Array.isArray(list) ? list.slice() : [];
    var clean = normalizeText(text);
    if (!clean) return { ok: false, error: "empty", list: source };
    if (clean.length > MAX) return { ok: false, error: "long", list: source };
    if (source.length >= MAX_ITEMS) return { ok: false, error: "full", list: source };
    var stamp = typeof now === "number" && isFinite(now) ? now : Date.now();
    var win = {
      id: stamp + "-" + source.length + "-" + Math.floor(Math.random() * 1000),
      text: clean,
      done: false,
      created: stamp
    };
    source.push(win);
    return { ok: true, error: "", list: source, item: win };
  }

  function toggleWin(list, id) {
    return (Array.isArray(list) ? list : []).map(function (item) {
      if (!item || item.id !== id) return item;
      return {
        id: item.id,
        text: item.text,
        done: !item.done,
        created: item.created
      };
    });
  }

  function removeWin(list, id) {
    return (Array.isArray(list) ? list : []).filter(function (item) {
      return item && item.id !== id;
    });
  }

  function openWins(list) {
    return (Array.isArray(list) ? list : []).filter(function (item) {
      return item && !item.done;
    });
  }

  function parseWins(raw) {
    if (typeof raw !== "string" || !raw) return [];
    try {
      var data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      return data.filter(validItem).slice(0, MAX_ITEMS).map(function (item) {
        return {
          id: item.id,
          text: normalizeText(item.text),
          done: !!item.done,
          created: typeof item.created === "number" ? item.created : 0
        };
      });
    } catch (err) {
      return [];
    }
  }

  function serialize(list) {
    return JSON.stringify(Array.isArray(list) ? list : []);
  }

  return {
    MAX: MAX,
    MAX_ITEMS: MAX_ITEMS,
    normalizeText: normalizeText,
    addWin: addWin,
    toggleWin: toggleWin,
    removeWin: removeWin,
    openWins: openWins,
    parseWins: parseWins,
    serialize: serialize
  };
});
