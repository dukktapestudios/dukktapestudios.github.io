(function () {
  var data = window.DUKKTAPE_STORIES || {};
  var CLOTH = ["#7c2f2f", "#1e4d34", "#243e66", "#6b4423", "#5a3044", "#1f4a4a", "#6e3b22", "#3e3a55"];
  var SPINE_WIDTHS = [50, 56, 62, 52];
  var SCALES = [0.9, 0.96, 0.86, 0.93];
  var COVER_WIDTH = 108;

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
      return {
        key: "book-" + index,
        title: book.title.trim(),
        description: book.description.trim(),
        cover: cover,
        link: safeUrl(book.link),
        color: CLOTH[index % CLOTH.length],
        width: cover ? COVER_WIDTH : SPINE_WIDTHS[index % SPINE_WIDTHS.length],
        scale: SCALES[index % SCALES.length]
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
    return 3;
  }

  function pack(items, width) {
    var gap = pxVar("--book-gap", 14);
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
    var shelves = minShelves();
    while (rows.length < shelves) rows.push([]);
    return rows;
  }

  function linkLabel(url) {
    var path = url.split(/[?#]/)[0];
    if (/\.(pdf|epub|mobi|azw3?|djvu|doc|docx|txt|rtf|zip|mp3|m4b)$/i.test(path)) return "Download";
    return "Read";
  }

  function renderBook(item) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "book" + (item.cover ? " has-cover" : "");
    button.setAttribute("data-key", item.key);
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "book-modal");
    button.style.setProperty("--cloth", item.color);
    button.style.setProperty("--ink", inkFor(item.color));
    button.style.setProperty("--book-w", item.width + "px");
    button.style.setProperty("--book-scale", String(item.scale));

    var body = el("span", "book-body");
    var face = el("span", "book-face");
    var title = el("span", "spine-title", item.title);
    if (item.cover) {
      body.appendChild(el("span", "book-hinge"));
      var img = document.createElement("img");
      img.alt = "";
      img.src = item.cover;
      img.addEventListener("error", function () {
        button.classList.remove("has-cover");
        button.classList.add("cover-failed");
        img.remove();
        title.classList.remove("sr-only");
        var pages = body.querySelector(".book-pages");
        if (pages) pages.remove();
        fitSpine(button);
      });
      face.appendChild(img);
      title.classList.add("sr-only");
    }
    face.appendChild(title);
    body.appendChild(face);
    if (item.cover) body.appendChild(el("span", "book-pages"));
    button.appendChild(body);
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
    if (!title || title.classList.contains("sr-only")) return;
    var chars = Math.max(1, title.textContent.trim().length);
    var available = Math.max(40, book.clientHeight - 28);
    var size = Math.floor(available / (chars * 0.58));
    size = Math.max(12, Math.min(20, size));
    title.style.fontSize = size + "px";
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

  function paintCover(item) {
    modalCover.replaceChildren();
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
