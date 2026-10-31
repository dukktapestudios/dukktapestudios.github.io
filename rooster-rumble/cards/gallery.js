(function () {
  var data = window.CLUCK_CARDS;
  var art = window.CLUCK_ART;
  var total = data.roosters.length + data.supports.length;
  var flock = "all";
  var type = "all";
  var query = "";
  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var count = document.getElementById("count");
  var zoom = document.getElementById("zoom");
  var zoomBody = document.getElementById("zoom-body");
  var lastFocus = null;

  function artSrc(kind, id) {
    var html = kind === "rooster" ? art.forRooster(id, false) : art.forSupport(id, false);
    var match = /src="([^"]+)"/.exec(html);
    return "../" + match[1];
  }

  function labelType(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  var cards = data.roosters.map(function (r, i) {
    return {
      n: i + 1,
      id: r.id,
      type: "Rooster",
      name: r.name,
      flock: r.flock,
      hp: r.hp,
      retreat: r.retreat,
      weak: r.weak,
      energy: r.energy,
      special: r.special,
      attacks: r.attacks,
      text: "",
      flavor: r.flavor,
      src: artSrc("rooster", r.id)
    };
  }).concat(data.supports.map(function (s, i) {
    return {
      n: data.roosters.length + i + 1,
      id: s.id,
      type: s.type,
      name: s.name,
      flock: s.flock,
      hp: null,
      retreat: null,
      weak: null,
      special: null,
      attacks: [],
      text: s.text,
      flavor: s.flavor,
      energy: s.energy,
      src: artSrc("support", s.id)
    };
  }));

  function numberOf(card) {
    return card.n + "/" + total;
  }

  function haystack(card) {
    var bits = [card.name, card.flock, card.type, card.text, card.flavor, String(card.n)];
    if (card.energy != null) bits.push(String(card.energy));
    if (card.hp != null) bits.push(String(card.hp), card.weak, String(card.retreat));
    if (card.special) bits.push(card.special.name, card.special.text, card.special.type);
    card.attacks.forEach(function (a) {
      bits.push(a.name, a.text, String(a.cost), String(a.hit), String(a.dice));
    });
    return bits.join(" ").toLowerCase();
  }

  function matches(card) {
    if (flock !== "all" && card.flock !== flock) return false;
    if (type !== "all" && card.type !== type) return false;
    if (!query) return true;
    return haystack(card).indexOf(query) !== -1;
  }

  function addText(parent, className, text) {
    var el = document.createElement("span");
    el.className = className;
    el.textContent = text;
    parent.appendChild(el);
  }

  function escHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function fill(parent, card, big) {
    var body = document.createElement("div");
    addText(body, "stats", card.type + " · Energy " + (card.energy || 0));
    if (card.hp != null) {
      addText(body, "stats", card.hp + " HP · Switch " + card.retreat + " · Weak " + card.weak);
    }
    if (card.special) {
      addText(body, "ability", labelType(card.special.type) + ": " + card.special.name + ". " + card.special.text);
    }
    card.attacks.forEach(function (a) {
      addText(body, "atk", a.name + " (" + a.cost + " Grain). " + a.text + " Hit " + a.hit + "+. Dice " + a.dice + ".");
    });
    if (card.text) addText(body, "rules", card.text);
    if (card.flavor) addText(body, "flavor", card.flavor);
    var img = document.createElement("img");
    img.className = "illu";
    img.src = card.src;
    img.alt = card.name;
    img.width = 600;
    img.height = 800;
    img.decoding = "async";
    img.loading = big ? "eager" : "lazy";
    var keep = parent.classList.contains("card") ? "card " : "";
    parent.className = keep + window.CLUCK_FRAME.classes(card.flock, card.energy);
    parent.innerHTML = window.CLUCK_FRAME.html({
      esc: escHtml,
      name: card.name,
      nameTag: big ? "h2" : "div",
      nameId: big ? "zoom-title" : "",
      energy: card.energy || 0,
      typeLine: card.type + " · " + card.flock,
      artHtml: img.outerHTML,
      bodyHtml: body.innerHTML,
      number: numberOf(card)
    });
  }

  function render() {
    var shown = cards.filter(matches);
    grid.replaceChildren();
    shown.forEach(function (card) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card";
      btn.setAttribute("data-n", String(card.n));
      fill(btn, card, false);
      btn.addEventListener("click", function () { openZoom(card, btn); });
      grid.appendChild(btn);
    });
    empty.hidden = shown.length !== 0;
    count.textContent = shown.length + " of " + total;
  }

  function openZoom(card, opener) {
    lastFocus = opener;
    zoomBody.replaceChildren();
    fill(zoomBody, card, true);
    if (typeof zoom.showModal === "function" && !zoom.open) zoom.showModal();
    else zoom.setAttribute("open", "");
    document.getElementById("zoom-close").focus();
  }

  function closeZoom() {
    if (typeof zoom.close === "function" && zoom.open) zoom.close();
    else zoom.removeAttribute("open");
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll("[data-flock]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      flock = btn.getAttribute("data-flock");
      document.querySelectorAll("[data-flock]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      render();
    });
  });
  document.querySelectorAll("[data-type]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      type = btn.getAttribute("data-type");
      document.querySelectorAll("[data-type]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      render();
    });
  });
  document.getElementById("q").addEventListener("input", function (e) {
    query = e.target.value.trim().toLowerCase();
    render();
  });
  document.getElementById("zoom-close").addEventListener("click", closeZoom);
  zoom.addEventListener("click", function (e) {
    if (e.target === zoom) closeZoom();
  });
  zoom.addEventListener("cancel", function (e) {
    e.preventDefault();
    closeZoom();
  });

  render();
  window.FLOCK_GALLERY = { cards: cards, total: total };
})();
