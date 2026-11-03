(function () {
  var data = window.DUKKTAPE_STORIES || {};
  var CLOTH = ["#7c2f2f", "#1e4d34", "#243e66", "#6b4423", "#5a3044", "#1f4a4a", "#8a4b22", "#3e3a55", "#6e2e3c", "#2c4a6e"];
  var SPINE_WIDTHS = [48, 58, 44, 64, 52, 46, 60, 50];
  var SCALES = [0.97, 0.84, 0.92, 0.78, 0.88, 0.81, 0.94, 0.86];

  var bookcase = document.getElementById("bookcase");
  var scrim = document.getElementById("scrim");
  var modal = document.getElementById("book-modal");
  var modalCover = document.getElementById("modal-cover");
  var modalTitle = document.getElementById("book-title");
  var modalDescription = document.getElementById("book-description");
  var modalActions = document.getElementById("modal-actions");
  var closeButton = document.getElementById("modal-close");

  var signature = "";
  var activeKey = null;
  var lastFocus = null;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function pxVar(name, fallback) {
    var raw = getComputedStyle(document.documentElement).getPropertyValue(name);
    var value = parseFloat(raw);
    return isNaN(value) ? fallback : value;
  }

  function inkFor(color) {
    var match = /^#([0-9a-f]{6})$/i.exec(color || "");
    if (!match) return "#fff8ee";
    var n = parseInt(match[1], 16);
    var r = (n >> 16) & 255;
    var g = (n >> 8) & 255;
    var b = n & 255;
    var luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.62 ? "#2a2118" : "#fff8ee";
  }

  function safeUrl(url) {
    if (typeof url !== "string") return "";
    var value = url.trim();
    if (!value || /^(javascript|data|vbscript):/i.test(value)) return "";
    return value;
  }

  function shelfItems() {
    var books = (data.books || []).filter(function (book) {
      return book &&
        typeof book.title === "string" && book.title.trim() &&
        typeof book.description === "string" && book.description.trim();
    }).map(function (book, index) {
      var cover = safeUrl(book.cover);
      var title = book.title.trim();
      var dusty = book.dusty === true;
      var longTitle = title.length > 24;
      var splitTitle = !dusty && title.indexOf(":") > 0 && title.length > 22;
      var width = dusty ? 52 : SPINE_WIDTHS[index % SPINE_WIDTHS.length];
      if (!dusty && longTitle) width = Math.max(width, splitTitle ? 68 : 58);
      var scale = dusty ? 0.78 : SCALES[index % SCALES.length];
      if (!dusty && longTitle) scale = Math.max(scale, 0.96);
      var pin = "";
      if (book.shelf === "bottom") pin = book.align === "end" ? "bottom-end" : "bottom";
      return {
        key: "book-" + index,
        title: title,
        description: book.description.trim(),
        cover: cover,
        link: safeUrl(book.link),
        color: dusty ? "#2a1810" : CLOTH[index % CLOTH.length],
        width: width,
        scale: scale,
        dusty: dusty,
        pin: pin,
        bands: index % 3,
        splitTitle: splitTitle
      };
    });
    if (books.length) return books;
    return [{
      key: "placeholder",
      title: "Coming soon",
      description: typeof data.placeholderNote === "string" && data.placeholderNote.trim()
        ? data.placeholderNote.trim()
        : "Coming soon.",
      cover: "",
      link: "",
      color: "#7c2f2f",
      width: 68,
      scale: 0.92
    }];
  }

  function usableWidth() {
    if (!bookcase) return 280;
    var pad = pxVar("--case-pad-x", 22) * 2;
    var bay = pxVar("--bay-inset", 10) * 2;
    var books = pxVar("--books-pad-x", 16) * 2;
    return Math.max(120, bookcase.clientWidth - pad - bay - books);
  }

  function minShelves() {
    if (window.innerHeight > 1100 && window.innerWidth >= 720) return 4;
    if (window.innerHeight < 720) return 2;
    return 3;
  }

  function packRow(items, width) {
    var gap = pxVar("--book-gap", 4);
    var rows = [];
    var row = [];
    var used = 0;
    items.forEach(function (item) {
      var needed = item.width + (row.length ? gap : 0);
      if (row.length && used + needed > width) {
        rows.push(row);
        row = [];
        used = 0;
        needed = item.width;
      }
      row.push(item);
      used += needed;
    });
    if (row.length) rows.push(row);
    return rows;
  }

  function pack(items, width) {
    var flow = [];
    var pinned = [];
    items.forEach(function (item) {
      item.pinEnd = false;
      if (item.pin) pinned.push(item);
      else flow.push(item);
    });
    var rows = packRow(flow, width);
    var shelves = minShelves();
    while (rows.length < shelves) rows.push([]);
    if (pinned.length) {
      var last = rows[rows.length - 1];
      var marked = false;
      pinned.forEach(function (item) {
        if (item.pin === "bottom-end" && !marked) {
          item.pinEnd = true;
          marked = true;
        }
        last.push(item);
      });
    }
    return rows;
  }

  function linkLabel(url) {
    var path = url.split(/[?#]/)[0];
    if (/\.(pdf|epub|mobi|azw3?|djvu|doc|docx|txt|rtf|zip|mp3|m4b)$/i.test(path)) return "Download";
    return "Read";
  }

  function dustLayer() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "dust");
    svg.setAttribute("viewBox", "0 0 40 160");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var specks = [
      [4, 10, 0.7], [11, 16, 0.45], [18, 8, 0.55], [27, 18, 0.4], [34, 12, 0.6],
      [7, 28, 0.4], [15, 34, 0.7], [24, 26, 0.35], [33, 38, 0.5], [5, 48, 0.55],
      [13, 56, 0.4], [22, 50, 0.65], [30, 62, 0.35], [36, 54, 0.5], [8, 72, 0.6],
      [16, 78, 0.4], [26, 70, 0.55], [34, 84, 0.4], [6, 92, 0.45], [14, 100, 0.7],
      [23, 94, 0.35], [31, 108, 0.55], [10, 118, 0.4], [19, 124, 0.6], [28, 132, 0.4],
      [36, 122, 0.5], [4, 140, 0.45], [15, 148, 0.35], [25, 142, 0.6], [33, 152, 0.4]
    ];
    specks.forEach(function (spec) {
      var dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", String(spec[0]));
      dot.setAttribute("cy", String(spec[1]));
      dot.setAttribute("r", String(spec[2]));
      dot.setAttribute("fill", "rgba(236, 230, 214, 0.9)");
      svg.appendChild(dot);
    });
    return svg;
  }

  function cobweb(shelf) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", shelf ? "cobweb cobweb-shelf" : "cobweb");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    return svg;
  }

  function drawCobweb(svg) {
    var box = svg.getBoundingClientRect();
    var w = box.width;
    var h = box.height;
    if (w < 8 || h < 8) return;
    var drape = svg.classList.contains("cobweb-shelf");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("preserveAspectRatio", "none");
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var ns = "http://www.w3.org/2000/svg";
    function add(d, sw, op) {
      var path = document.createElementNS(ns, "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "rgba(236, 232, 220, " + op + ")");
      path.setAttribute("stroke-width", String(sw));
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      svg.appendChild(path);
    }
    function fan(hx, hy, tips, rings) {
      tips.forEach(function (tip) {
        add("M" + hx + " " + hy + " L" + tip[0] + " " + tip[1], 1.15, 0.9);
      });
      rings.forEach(function (t) {
        var d = "";
        tips.forEach(function (tip, i) {
          var x = hx + (tip[0] - hx) * t;
          var y = hy + (tip[1] - hy) * t;
          d += (i ? " L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
        });
        add(d, 1.05, 0.82);
      });
    }
    if (!drape) {
      var hx = w * 0.9;
      var hy = h * 0.1;
      fan(hx, hy, [
        [w * 0.08, h * 0.16],
        [w * 0.06, h * 0.48],
        [w * 0.22, h * 0.86],
        [w * 0.58, h * 0.96],
        [w * 0.94, h * 0.62]
      ], [0.34, 0.58, 0.82]);
      return;
    }
    /* Hub sits on the book's top-right corner. CSS pulls the svg 12px above the book. */
    var hubX = w - 18;
    var hubY = 14;
    var floor = h - 1;
    fan(hubX, hubY, [
      [hubX - 26, hubY - 8],
      [hubX - 22, hubY + 14],
      [hubX - 8, hubY + 30],
      [hubX + 8, hubY + 36],
      [w - 2, hubY + 18],
      [w - 1, hubY - 6]
    ], [0.3, 0.52, 0.74, 0.92]);
    add("M" + (hubX + 6) + " " + (hubY + 26) + " Q " + (w - 2) + " " + (h * 0.46).toFixed(1) + " " + (w - 7) + " " + floor, 1.45, 0.9);
    add("M" + hubX + " " + (hubY + 20) + " Q " + (hubX - 1) + " " + (h * 0.58).toFixed(1) + " " + (hubX - 6) + " " + floor, 1.35, 0.84);
  }

  function layoutWebs(root) {
    var scope = root || bookcase;
    Array.prototype.forEach.call(scope.querySelectorAll(".cobweb"), function (svg) {
      drawCobweb(svg);
    });
  }

  function spineLabel(item) {
    var title = el("span", "spine-title");
    var colon = item.title.indexOf(":");
    if (item.splitTitle && colon > 0) {
      title.classList.add("spine-double");
      title.appendChild(el("span", "spine-line", item.title.slice(0, colon + 1).trim()));
      title.appendChild(el("span", "spine-line spine-sub", item.title.slice(colon + 1).trim()));
    } else {
      title.classList.add("spine-single");
      title.textContent = item.title;
    }
    return title;
  }

  function renderBook(item) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "book" + (item.dusty ? " book-dusty" : "");
    if (item.pinEnd) button.classList.add("pin-end");
    button.setAttribute("data-key", item.key);
    button.setAttribute("data-bands", String(item.bands || 0));
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "book-modal");
    button.style.setProperty("--cloth", item.color);
    button.style.setProperty("--ink", item.dusty ? "#c6aa6c" : inkFor(item.color));
    button.style.setProperty("--book-w", item.width + "px");
    button.style.setProperty("--book-scale", String(item.scale));

    var body = el("span", "book-body");
    var face = el("span", "book-face");
    face.appendChild(spineLabel(item));
    if (item.dusty) face.appendChild(dustLayer());
    body.appendChild(face);
    body.appendChild(el("span", "book-pages"));
    button.appendChild(body);
    if (item.dusty) button.appendChild(cobweb(true));
    button.addEventListener("click", function () { openBook(item, button); });
    return button;
  }

  function renderBay(row) {
    var bay = el("div", "bay");
    var books = el("div", "bay-books");
    row.forEach(function (item) { books.appendChild(renderBook(item)); });
    bay.appendChild(books);
    bay.appendChild(el("div", "board"));
    return bay;
  }

  function markOpen(key) {
    Array.prototype.forEach.call(bookcase.querySelectorAll(".book"), function (book) {
      var open = !!key && book.getAttribute("data-key") === key;
      book.classList.toggle("is-open", open);
      book.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function fitSpine(book) {
    var title = book.querySelector(".spine-title");
    var face = book.querySelector(".book-face");
    if (!title || !face || face.clientHeight < 40) return;
    var availableH = Math.max(36, face.clientHeight - 32);
    var lines = title.querySelectorAll(".spine-line");
    var targets = lines.length ? Array.prototype.slice.call(lines) : [title];
    var size = 18;
    var min = 12;
    function apply(px) {
      targets.forEach(function (node) {
        var next = node.classList.contains("spine-sub") ? Math.max(min, px - 2) : px;
        node.style.fontSize = next + "px";
      });
    }
    function tooTall() {
      return targets.some(function (node) { return node.scrollHeight > availableH + 1; });
    }
    apply(size);
    while (size > min && tooTall()) {
      size -= 0.5;
      apply(size);
    }
  }

  function sizeBooks() {
    Array.prototype.forEach.call(bookcase.querySelectorAll(".bay-books"), function (bay) {
      var room = bay.clientHeight;
      if (room < 40) return;
      Array.prototype.forEach.call(bay.querySelectorAll(".book"), function (book) {
        var scale = parseFloat(book.style.getPropertyValue("--book-scale")) || 0.9;
        var height = Math.max(132, Math.floor(room * scale) - 4);
        if (Math.abs(book.offsetHeight - height) > 1) book.style.height = height + "px";
        fitSpine(book);
      });
    });
    layoutWebs(bookcase);
  }

  function paint(rows) {
    var focusKey = null;
    var current = document.activeElement;
    if (current && current.getAttribute && current.classList.contains("book")) {
      focusKey = current.getAttribute("data-key");
    }
    bookcase.replaceChildren();
    bookcase.appendChild(el("div", "crown"));
    var bays = el("div", "bays");
    rows.forEach(function (row) { bays.appendChild(renderBay(row)); });
    bookcase.appendChild(bays);
    bookcase.appendChild(el("div", "plinth"));
    if (activeKey) markOpen(activeKey);
    if (scrim.hidden && focusKey) {
      var again = bookcase.querySelector('[data-key="' + focusKey + '"]');
      if (again) again.focus();
    }
  }

  function render() {
    var rows = pack(shelfItems(), usableWidth());
    var next = rows.map(function (row) {
      return row.map(function (item) { return item.key; }).join("+");
    }).join("|");
    if (next !== signature) {
      signature = next;
      paint(rows);
    }
    sizeBooks();
  }

  function clothCover(item) {
    var cover = el("div", "cloth-cover", item.title);
    cover.style.setProperty("--cloth", item.color);
    cover.style.setProperty("--ink", inkFor(item.color));
    return cover;
  }

  function leatherCover(item) {
    var cover = el("div", "leather-cover");
    cover.appendChild(el("span", "leather-title", item.title));
    cover.appendChild(dustLayer());
    cover.appendChild(cobweb(false));
    return cover;
  }

  function paintCover(item) {
    modalCover.replaceChildren();
    if (item.dusty) {
      modalCover.appendChild(leatherCover(item));
      layoutWebs(modalCover);
      return;
    }
    if (!item.cover) {
      modalCover.appendChild(clothCover(item));
      return;
    }
    var img = document.createElement("img");
    img.alt = "";
    img.src = item.cover;
    img.addEventListener("error", function () {
      modalCover.replaceChildren(clothCover(item));
    });
    modalCover.appendChild(img);
    layoutWebs(modalCover);
  }

  function setPageInert(on) {
    Array.prototype.forEach.call(document.querySelectorAll("header, main, footer"), function (node) {
      if (on) node.setAttribute("inert", "");
      else node.removeAttribute("inert");
    });
  }

  function openBook(item, trigger) {
    lastFocus = trigger || document.activeElement;
    activeKey = item.key;
    markOpen(item.key);
    modalTitle.textContent = item.title;
    modalDescription.textContent = item.description;
    paintCover(item);
    modalActions.replaceChildren();
    if (item.link) {
      var link = document.createElement("a");
      link.className = "btn";
      link.href = item.link;
      link.textContent = linkLabel(item.link);
      if (/^https?:\/\//i.test(item.link)) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      } else if (link.textContent === "Download") {
        link.setAttribute("download", "");
      }
      modalActions.appendChild(link);
    }
    scrim.hidden = false;
    document.body.classList.add("modal-open");
    setPageInert(true);
    layoutWebs(modalCover);
    closeButton.focus();
  }

  function closeBook() {
    if (scrim.hidden) return;
    var returnTo = lastFocus;
    scrim.hidden = true;
    document.body.classList.remove("modal-open");
    setPageInert(false);
    activeKey = null;
    markOpen(null);
    function restore() {
      if (returnTo && typeof returnTo.focus === "function") returnTo.focus();
    }
    restore();
    window.requestAnimationFrame(restore);
  }

  function focusables() {
    return Array.prototype.filter.call(modal.querySelectorAll("button, a[href]"), function (node) {
      return !node.disabled && node.offsetParent !== null;
    });
  }

  closeButton.addEventListener("click", closeBook);
  scrim.addEventListener("click", function (event) {
    if (event.target === scrim) closeBook();
  });
  document.addEventListener("keydown", function (event) {
    if (scrim.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeBook();
      return;
    }
    if (event.key !== "Tab") return;
    var items = focusables();
    if (!items.length) {
      event.preventDefault();
      modal.focus();
      return;
    }
    var first = items[0];
    var last = items[items.length - 1];
    var active = document.activeElement;
    if (event.shiftKey && (active === first || active === modal || !modal.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !modal.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  });

  render();
  if (window.ResizeObserver) {
    new ResizeObserver(function () { render(); }).observe(bookcase);
  } else {
    window.addEventListener("resize", render);
  }
})();
