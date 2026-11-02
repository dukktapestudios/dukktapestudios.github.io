(function () {
  var data = window.DUKKTAPE_STORIES;
  if (!data) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SPINE_COLORS = ["#7c2f2f", "#1f5c3a", "#2a4468", "#8a5a2b", "#6b3a4a", "#3f5344"];
  var selectedKey = null;
  var perRow = 0;

  var beatsRoot = document.getElementById("beats");
  var conceptGrid = document.getElementById("concept-grid");
  var copyButton = document.getElementById("copy-template");
  var copyStatus = document.getElementById("copy-status");
  var toggleBeats = document.getElementById("toggle-beats");
  var printButton = document.getElementById("print-journey");
  var stackButton = document.getElementById("stack-btn");
  var bookcase = document.getElementById("bookcase");
  var bookDetail = document.getElementById("book-detail");
  var printShelf = document.getElementById("print-shelf");

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function renderBeats() {
    (data.beats || []).forEach(function (beat, index) {
      var details = document.createElement("details");
      details.className = "beat";
      var summary = document.createElement("summary");
      summary.appendChild(el("span", "num", String(index + 1)));
      summary.appendChild(el("span", "label", beat.name));
      details.appendChild(summary);
      details.appendChild(el("p", "meaning", beat.meaning));
      var list = document.createElement("ul");
      list.className = "examples";
      [
        ["Star Wars", beat.starWars],
        ["Harry Potter", beat.harryPotter]
      ].forEach(function (pair) {
        var item = document.createElement("li");
        item.appendChild(el("span", "who", pair[0] + ". "));
        item.appendChild(document.createTextNode(pair[1]));
        list.appendChild(item);
      });
      details.appendChild(list);
      beatsRoot.appendChild(details);
    });
  }

  function allBeats() {
    return Array.prototype.slice.call(beatsRoot.querySelectorAll("details"));
  }

  function everyBeatOpen() {
    var beats = allBeats();
    return beats.length > 0 && beats.every(function (beat) { return beat.open; });
  }

  function updateToggleLabel() {
    var open = everyBeatOpen();
    toggleBeats.textContent = open ? "Collapse all" : "Expand all";
    toggleBeats.setAttribute("aria-pressed", open ? "true" : "false");
  }

  function renderConcepts() {
    (data.concepts || []).forEach(function (concept) {
      if (!concept || !concept.title) return;
      var card = el("article", "concept");
      card.appendChild(el("h3", null, concept.title));
      var notes = (concept.notes || "").trim();
      card.appendChild(el("p", notes ? "notes" : "notes soon", notes || "Notes coming soon."));
      conceptGrid.appendChild(card);
    });
  }

  function inkFor(color) {
    var match = /^#([0-9a-f]{6})$/i.exec(color || "");
    if (!match) return "#fff8ee";
    var n = parseInt(match[1], 16);
    var r = (n >> 16) & 255;
    var g = (n >> 8) & 255;
    var b = n & 255;
    var luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.64 ? "#2a2118" : "#fff8ee";
  }

  function finishedBooks() {
    return (data.books || []).filter(function (book) {
      return book && typeof book.title === "string" && book.title.trim() && typeof book.description === "string" && book.description.trim();
    }).map(function (book, index) {
      return {
        key: "book-" + index,
        title: book.title.trim(),
        description: book.description.trim(),
        pdf: typeof book.pdf === "string" ? book.pdf.trim() : "",
        spine: book.spine || SPINE_COLORS[index % SPINE_COLORS.length],
        placeholder: false
      };
    });
  }

  function shelfItems() {
    var books = finishedBooks();
    if (books.length) return books;
    return [{
      key: "placeholder",
      title: "Coming soon",
      description: data.placeholderNote,
      pdf: "",
      spine: "#7c2f2f",
      placeholder: true
    }];
  }

  function safePdf(url) {
    if (!url || /^javascript:/i.test(url)) return "";
    return url;
  }

  function showDetail(item) {
    selectedKey = item.key;
    bookDetail.replaceChildren();
    if (!item.placeholder) {
      bookDetail.appendChild(el("h3", null, item.title));
    }
    bookDetail.appendChild(el("p", null, item.description));
    var pdf = safePdf(item.pdf);
    if (pdf) {
      var link = el("a", "btn btn-primary", "Download PDF");
      link.href = pdf;
      if (/^https?:\/\//i.test(pdf)) {
        link.target = "_blank";
        link.rel = "noopener";
      } else {
        link.setAttribute("download", "");
      }
      bookDetail.appendChild(link);
    }
    bookDetail.hidden = false;
    Array.prototype.forEach.call(bookcase.querySelectorAll(".spine"), function (spine) {
      var open = spine.getAttribute("data-key") === item.key;
      spine.classList.toggle("is-open", open);
      spine.setAttribute("aria-pressed", open ? "true" : "false");
    });
  }

  function clearDetail() {
    selectedKey = null;
    bookDetail.hidden = true;
    bookDetail.replaceChildren();
  }

  function booksPerRow() {
    var width = bookcase.clientWidth || 640;
    var usable = Math.max(80, width - 72);
    return Math.max(1, Math.floor(usable / 66));
  }

  function buildCase(items) {
    bookcase.replaceChildren();
    bookcase.appendChild(el("div", "case-crown"));
    bookcase.appendChild(el("p", "case-name", "Stories"));
    var capacity = booksPerRow();
    perRow = capacity;
    var rows = Math.max(3, Math.ceil(items.length / capacity));
    var index = 0;
    for (var row = 0; row < rows; row += 1) {
      var bay = el("div", "bay");
      var bayBooks = el("div", "bay-books");
      var count = Math.min(capacity, items.length - index);
      for (var i = 0; i < count; i += 1) {
        var item = items[index];
        index += 1;
        var spine = document.createElement("button");
        spine.type = "button";
        spine.className = "spine";
        spine.style.setProperty("--spine", item.spine);
        spine.style.setProperty("--spine-ink", inkFor(item.spine));
        spine.setAttribute("data-key", item.key);
        spine.setAttribute("aria-pressed", "false");
        spine.title = item.title;
        spine.appendChild(el("span", null, item.title));
        spine.addEventListener("click", function (book) {
          return function () {
            if (selectedKey === book.key) {
              clearDetail();
              Array.prototype.forEach.call(bookcase.querySelectorAll(".spine"), function (node) {
                node.classList.remove("is-open");
                node.setAttribute("aria-pressed", "false");
              });
              return;
            }
            showDetail(book);
          };
        }(item));
        bayBooks.appendChild(spine);
      }
      bay.appendChild(bayBooks);
      bay.appendChild(el("div", "board"));
      bookcase.appendChild(bay);
    }
    var close = el("button", "close-shelf", "Close the bookshelf");
    close.type = "button";
    close.addEventListener("click", function () { setShelfOpen(false); });
    bookcase.appendChild(close);

    if (selectedKey) {
      var still = items.filter(function (item) { return item.key === selectedKey; })[0];
      if (still) showDetail(still);
      else clearDetail();
    }
  }

  function setShelfOpen(open) {
    stackButton.setAttribute("aria-expanded", open ? "true" : "false");
    stackButton.hidden = open;
    bookcase.hidden = !open;
    if (!open) {
      clearDetail();
      stackButton.focus();
      return;
    }
    buildCase(shelfItems());
    if (!reduceMotion) {
      bookcase.classList.remove("is-opening");
      void bookcase.offsetWidth;
      bookcase.classList.add("is-opening");
    }
    var firstSpine = bookcase.querySelector(".spine");
    if (firstSpine) firstSpine.focus();
  }

  function renderPrintShelf() {
    var items = shelfItems();
    printShelf.replaceChildren();
    items.forEach(function (item) {
      var block = el("p");
      if (!item.placeholder) {
        block.appendChild(el("strong", null, item.title + ". "));
      }
      block.appendChild(document.createTextNode(item.description));
      if (item.pdf) {
        block.appendChild(document.createTextNode(" PDF: " + item.pdf));
      }
      printShelf.appendChild(block);
    });
  }

  function copyTemplate() {
    var text = data.blankTemplate || "";
    function done() {
      copyStatus.textContent = "Copied. Paste it anywhere and fill one line.";
    }
    function fallback() {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
      area.remove();
      if (ok) done();
      else copyStatus.textContent = "Copy didn't go through. Download the PDF and copy from there.";
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }

  var printSnapshot = null;
  window.addEventListener("beforeprint", function () {
    if (printSnapshot) return;
    printSnapshot = allBeats().map(function (beat) { return beat.open; });
    allBeats().forEach(function (beat) { beat.open = true; });
  });
  window.addEventListener("afterprint", function () {
    if (!printSnapshot) return;
    allBeats().forEach(function (beat, index) { beat.open = printSnapshot[index]; });
    printSnapshot = null;
    updateToggleLabel();
  });

  renderBeats();
  renderConcepts();
  renderPrintShelf();
  updateToggleLabel();

  beatsRoot.addEventListener("toggle", function (event) {
    if (event.target && event.target.tagName === "DETAILS") updateToggleLabel();
  }, true);

  toggleBeats.addEventListener("click", function () {
    var open = !everyBeatOpen();
    allBeats().forEach(function (beat) { beat.open = open; });
    updateToggleLabel();
  });

  copyButton.addEventListener("click", copyTemplate);
  printButton.addEventListener("click", function () { window.print(); });
  stackButton.addEventListener("click", function () { setShelfOpen(true); });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || bookcase.hidden) return;
    if (selectedKey) {
      clearDetail();
      Array.prototype.forEach.call(bookcase.querySelectorAll(".spine"), function (node) {
        node.classList.remove("is-open");
        node.setAttribute("aria-pressed", "false");
      });
      return;
    }
    setShelfOpen(false);
  });

  if (window.ResizeObserver) {
    var observer = new ResizeObserver(function () {
      if (bookcase.hidden) return;
      var next = booksPerRow();
      if (next !== perRow) buildCase(shelfItems());
    });
    observer.observe(bookcase);
  }
})();
