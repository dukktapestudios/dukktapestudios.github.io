/* Horse Watch behavior. Thresholds and labels live in config.js. */
(function () {
  var cfg = window.HORSE_WATCH;
  var video = document.getElementById("video");
  var still = document.getElementById("still");
  var canvas = document.getElementById("overlay");
  var placeholder = document.getElementById("placeholder");
  var methodEl = document.getElementById("method");
  var mode = "none";
  var model = null;
  var modelState = "loading";
  var activePoint = cfg.points[0].id;
  var points = {};
  var box = null;
  var steps = [];
  var samples = [];
  var cameraStream = null;
  var detectTimer = 0;
  var detecting = false;
  var watchStart = 0;

  function methodText() {
    var base = "The picture stays on this device. Joints and saddle points are placed by tapping. Stride times come from the footfall buttons. ";
    if (modelState === "ready") {
      return base + "A COCO-SSD model (TensorFlow.js) has been downloaded into this browser. It only draws a box around an object it classes as a horse. It does not find joints. People-pose models are not used, because they are trained on human bodies.";
    }
    if (modelState === "failed") {
      return base + "The horse-box model did not load. Tapping, footfalls, and the checklists still work. Nothing is uploaded.";
    }
    return base + "The horse-box model is loading into this browser. It will not upload the picture.";
  }

  function setMethod() { methodEl.textContent = methodText(); }

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = url;
      script.onload = function () { resolve(); };
      script.onerror = function () { reject(new Error("Could not load " + url)); };
      document.head.appendChild(script);
    });
  }

  function startModel() {
    setMethod();
    loadScript(cfg.model.tfjsUrl).then(function () {
      return loadScript(cfg.model.cocoUrl);
    }).then(function () {
      return window.cocoSsd.load();
    }).then(function (loaded) {
      model = loaded;
      modelState = "ready";
      setMethod();
      detectOnce();
    }).catch(function () {
      modelState = "failed";
      setMethod();
    });
  }

  function stopCamera() {
    if (!cameraStream) return;
    cameraStream.getTracks().forEach(function (track) { track.stop(); });
    cameraStream = null;
  }

  function showMedia(nextMode) {
    mode = nextMode;
    var hasPicture = nextMode !== "none";
    placeholder.hidden = hasPicture;
    document.getElementById("frame").hidden = !hasPicture;
    video.hidden = nextMode === "photo" || !hasPicture;
    still.hidden = nextMode !== "photo";
    if (nextMode !== "photo") watchStart = 0;
  }

  function mediaEl() { return mode === "photo" ? still : video; }

  function syncCanvas() {
    var el = mediaEl();
    var width = el && (el.videoWidth || el.naturalWidth);
    var height = el && (el.videoHeight || el.naturalHeight);
    if (!width || !height) return;
    canvas.width = width;
    canvas.height = height;
    draw();
  }

  function nowSeconds() {
    if (mode === "video" || mode === "camera") return video.currentTime || 0;
    if (!watchStart) watchStart = performance.now();
    return (performance.now() - watchStart) / 1000;
  }

  function pointById(id) {
    for (var i = 0; i < cfg.points.length; i++) if (cfg.points[i].id === id) return cfg.points[i];
    return null;
  }

  function draw() {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (box) {
      ctx.strokeStyle = "#f4efe6";
      ctx.lineWidth = Math.max(2, canvas.width / 180);
      ctx.strokeRect(box.x * canvas.width, box.y * canvas.height, box.w * canvas.width, box.h * canvas.height);
    }
    cfg.points.forEach(function (spec) {
      var point = points[spec.id];
      if (!point) return;
      var x = point.x * canvas.width;
      var y = point.y * canvas.height;
      ctx.beginPath();
      ctx.fillStyle = spec.color;
      ctx.arc(x, y, Math.max(5, canvas.width / 80), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff8ea";
      ctx.font = Math.max(12, canvas.width / 40) + "px Georgia, serif";
      ctx.fillText(spec.label, x + 8, y - 8);
    });
    var front = points[cfg.saddle.frontId];
    var back = points[cfg.saddle.backId];
    if (front && back) {
      ctx.strokeStyle = "#8d3e16";
      ctx.lineWidth = Math.max(2, canvas.width / 200);
      ctx.beginPath();
      ctx.moveTo(front.x * canvas.width, front.y * canvas.height);
      ctx.lineTo(back.x * canvas.width, back.y * canvas.height);
      ctx.stroke();
    }
  }

  function rememberSample() {
    if (!box) return;
    samples.push({ t: nowSeconds(), y: box.y, h: box.h });
    var cutoff = nowSeconds() - 20;
    samples = samples.filter(function (sample) { return sample.t >= cutoff; });
  }

  function detectOnce() {
    if (!model || detecting) return Promise.resolve();
    var el = mediaEl();
    if (!el || mode === "none") return Promise.resolve();
    if (el.tagName === "VIDEO" && el.readyState < 2) return Promise.resolve();
    detecting = true;
    return model.detect(el).then(function (preds) {
      var horses = preds.filter(function (pred) {
        return pred.class === cfg.model.className && pred.score >= cfg.model.scoreMin;
      });
      horses.sort(function (a, b) { return b.score - a.score; });
      var width = el.videoWidth || el.naturalWidth;
      var height = el.videoHeight || el.naturalHeight;
      if (horses.length && width && height) {
        var found = horses[0].bbox;
        box = { x: found[0] / width, y: found[1] / height, w: found[2] / width, h: found[3] / height };
        if (mode !== "photo") rememberSample();
      } else {
        box = null;
      }
      syncCanvas();
      renderGait();
    }).catch(function () {
      box = null;
    }).then(function () { detecting = false; });
  }

  function scheduleDetect() {
    clearTimeout(detectTimer);
    if (mode === "photo" || mode === "none") return;
    detectTimer = setTimeout(function () {
      detectOnce().then(scheduleDetect);
    }, cfg.gait.sampleMs);
  }

  function useFile(file, nextMode) {
    if (!file) return;
    stopCamera();
    points = {};
    box = null;
    samples = [];
    var url = URL.createObjectURL(file);
    if (nextMode === "photo") {
      video.removeAttribute("src");
      still.onload = function () {
        showMedia("photo");
        syncCanvas();
        detectOnce();
      };
      still.src = url;
      return;
    }
    still.removeAttribute("src");
    video.onloadeddata = function () {
      showMedia("video");
      syncCanvas();
      video.play().catch(function () {});
      scheduleDetect();
    };
    video.src = url;
  }

  function useCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      methodEl.textContent = methodText() + " This browser did not open a camera. You can still choose a video or a photo.";
      return;
    }
    stopCamera();
    points = {};
    box = null;
    samples = [];
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false }).then(function (stream) {
      cameraStream = stream;
      still.removeAttribute("src");
      video.srcObject = stream;
      video.onloadeddata = function () {
        showMedia("camera");
        syncCanvas();
        video.play().catch(function () {});
        scheduleDetect();
      };
    }).catch(function () {
      methodEl.textContent = methodText() + " The camera permission was not granted. You can still choose a video or a photo.";
    });
  }

  function tapPoint(event) {
    if (mode === "none" || !activePoint) return;
    var rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    points[activePoint] = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height
    };
    draw();
    renderSaddle();
  }

  function intervals(id) {
    var times = steps.filter(function (step) { return step.limb === id; }).map(function (step) { return step.t; }).sort(function (a, b) { return a - b; });
    var gaps = [];
    for (var i = 1; i < times.length; i++) gaps.push(times[i] - times[i - 1]);
    return gaps;
  }

  function mean(values) {
    if (!values.length) return 0;
    return values.reduce(function (sum, value) { return sum + value; }, 0) / values.length;
  }

  function pairReport(label, leftId, rightId) {
    var left = intervals(leftId);
    var right = intervals(rightId);
    if (left.length < 2 || right.length < 2) {
      return "<p>" + label + ": mark at least three landings on each side.</p>";
    }
    var leftMean = mean(left);
    var rightMean = mean(right);
    var gap = Math.abs(leftMean - rightMean) / ((leftMean + rightMean) / 2);
    var flagged = gap > cfg.gait.symmetryFlag;
    return "<p>" + label + ": near " + leftMean.toFixed(2) + "s, off " + rightMean.toFixed(2) + "s, gap " + Math.round(gap * 100) + "%." +
      (flagged ? " Possible unevenness. This is a timing hint, not a diagnosis." : " Inside the set limit.") + "</p>";
  }

  function renderGait() {
    var report = document.getElementById("gait-report");
    var counts = cfg.gait.limbs.map(function (limb) {
      var n = steps.filter(function (step) { return step.limb === limb.id; }).length;
      return limb.label + " " + n;
    }).join(" · ");
    report.innerHTML = "<p>" + counts + "</p>" +
      pairReport("Fore strides", "nearFore", "offFore") +
      pairReport("Hind strides", "nearHind", "offHind");
    drawBob();
  }

  function drawBob() {
    var chart = document.getElementById("bob-chart");
    var note = document.getElementById("bob-note");
    var ctx = chart.getContext("2d");
    ctx.clearRect(0, 0, chart.width, chart.height);
    ctx.strokeStyle = "#cfc3ae";
    ctx.strokeRect(0, 0, chart.width, chart.height);
    if (samples.length < 4) {
      note.textContent = "Head line: play a video or use the camera. The chart starts after the horse box is seen a few times. A photo has no head-bob over time.";
      return;
    }
    var ys = samples.map(function (sample) { return sample.y; });
    var drift = mean(ys);
    var shifted = ys.map(function (y) { return (y - drift) / Math.max(0.05, mean(samples.map(function (sample) { return sample.h; }))); });
    var low = Math.min.apply(null, shifted);
    var high = Math.max.apply(null, shifted);
    var span = Math.max(0.02, high - low);
    ctx.beginPath();
    ctx.strokeStyle = "#1d4e89";
    ctx.lineWidth = 2;
    shifted.forEach(function (value, index) {
      var x = (index / (shifted.length - 1)) * (chart.width - 16) + 8;
      var y = 12 + ((high - value) / span) * (chart.height - 24);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    var amp = high - low;
    if (amp > cfg.gait.headBobFlag) {
      note.textContent = "Possible unevenness: the top of the horse box moved more than the set limit. This can be a head bob, a camera shake, or the box jumping. It is not a diagnosis.";
    } else {
      note.textContent = "Head line is inside the set limit for this clip. That does not mean the gait is sound.";
    }
  }

  function tiltSentence() {
    var front = points[cfg.saddle.frontId];
    var back = points[cfg.saddle.backId];
    if (!front || !back) {
      return "Tap Saddle front and Saddle back on a side view. The horse box alone cannot show tilt.";
    }
    var rise = back.y - front.y;
    var run = Math.abs(back.x - front.x) || 0.0001;
    var degrees = Math.atan2(rise, run) * 180 / Math.PI;
    if (Math.abs(degrees) <= cfg.saddle.levelDegrees) {
      return "From those two taps, the saddle line is about level (" + degrees.toFixed(1) + "°). This is not a fitting.";
    }
    var which = degrees > 0 ? "The front sits higher than the back" : "The back sits higher than the front";
    return which + " by about " + Math.abs(degrees).toFixed(1) + "° on this side view. This is not a fitting.";
  }

  function renderSaddle() {
    document.getElementById("tilt-note").textContent = tiltSentence();
    renderSaddleLog();
  }

  function readList(key) {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch (err) { return []; }
  }

  function writeList(key, rows) {
    localStorage.setItem(key, JSON.stringify(rows));
  }

  function saddlePayload() {
    var checks = {};
    cfg.saddle.checks.forEach(function (check) {
      checks[check.id] = document.getElementById("saddle-" + check.id).checked;
    });
    return {
      date: new Date().toISOString(),
      tilt: tiltSentence(),
      checks: checks,
      notes: document.getElementById("saddle-notes").value
    };
  }

  function renderSaddleLog() {
    var host = document.getElementById("saddle-log");
    var rows = readList(cfg.saddleStorageKey);
    host.innerHTML = rows.slice().reverse().map(function (row, index) {
      var real = rows.length - 1 - index;
      return "<article class=\"log-item\"><p><b>" + row.date.slice(0, 10) + "</b> " + row.tilt + "</p><p>" + (row.notes || "") + "</p><button type=\"button\" data-saddle-del=\"" + real + "\">Delete</button></article>";
    }).join("");
  }

  function buildSaddleChecks() {
    document.getElementById("saddle-checks").innerHTML = cfg.saddle.checks.map(function (check) {
      return "<label class=\"check\"><input type=\"checkbox\" id=\"saddle-" + check.id + "\"> " + check.label + "</label>";
    }).join("");
  }

  function today() {
    var now = new Date();
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var day = String(now.getDate()).padStart(2, "0");
    return now.getFullYear() + "-" + month + "-" + day;
  }

  function buildHealthForm() {
    var bcs = document.getElementById("bcs");
    for (var score = 1; score <= 9; score++) {
      var option = document.createElement("option");
      option.value = String(score);
      option.textContent = String(score);
      if (score === 5) option.selected = true;
      bcs.appendChild(option);
    }
    document.getElementById("health-date").value = today();
    document.getElementById("health-fields").innerHTML = cfg.health.fields.map(function (field) {
      var options = cfg.health.choices.map(function (choice) {
        return "<option>" + choice + "</option>";
      }).join("");
      return "<div class=\"health-row\"><label for=\"health-" + field.id + "\">" + field.label + "</label><select id=\"health-" + field.id + "\">" + options + "</select></div>";
    }).join("");
  }

  function healthPayload() {
    var row = {
      date: document.getElementById("health-date").value,
      bodyCondition: document.getElementById("bcs").value,
      notes: document.getElementById("health-notes").value
    };
    cfg.health.fields.forEach(function (field) {
      row[field.id] = document.getElementById("health-" + field.id).value;
    });
    return row;
  }

  function renderHealth() {
    var host = document.getElementById("health-log");
    var rows = readList(cfg.healthStorageKey);
    host.innerHTML = rows.slice().reverse().map(function (row, index) {
      var real = rows.length - 1 - index;
      var bits = cfg.health.fields.map(function (field) { return field.label + " " + row[field.id]; }).join(" · ");
      return "<article class=\"log-item\"><p><b>" + row.date + "</b> Body condition " + row.bodyCondition + "</p><p>" + bits + "</p><p>" + (row.notes || "") + "</p><button type=\"button\" data-health-del=\"" + real + "\">Delete</button></article>";
    }).join("");
  }

  function csvEscape(value) {
    var text = String(value == null ? "" : value);
    if (/^[=+\-@]/.test(text)) text = "'" + text;
    if (/[",\n]/.test(text)) return "\"" + text.replace(/"/g, "\"\"") + "\"";
    return text;
  }

  function exportCsv() {
    var rows = readList(cfg.healthStorageKey);
    var headers = ["date", "bodyCondition"].concat(cfg.health.fields.map(function (field) { return field.id; }), ["notes"]);
    var lines = [headers.join(",")].concat(rows.map(function (row) {
      return headers.map(function (header) { return csvEscape(row[header]); }).join(",");
    }));
    var blob = new Blob([lines.join("\n")], { type: "text/csv" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "horse-watch-health.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function showPanel(name) {
    ["gait", "saddle", "health"].forEach(function (id) {
      document.getElementById("panel-" + id).hidden = id !== name;
      document.getElementById("tab-" + id).setAttribute("aria-pressed", id === name ? "true" : "false");
    });
  }

  function buildPointButtons() {
    document.getElementById("point-list").innerHTML = cfg.points.map(function (spec) {
      return "<button type=\"button\" data-point=\"" + spec.id + "\" aria-pressed=\"" + (spec.id === activePoint ? "true" : "false") + "\">" + spec.label + "</button>";
    }).join("");
    document.getElementById("limb-list").innerHTML = cfg.gait.limbs.map(function (limb) {
      return "<button type=\"button\" data-limb=\"" + limb.id + "\">" + limb.label + "</button>";
    }).join("");
  }

  document.getElementById("point-list").addEventListener("click", function (event) {
    var button = event.target.closest("[data-point]");
    if (!button) return;
    activePoint = button.getAttribute("data-point");
    document.querySelectorAll("[data-point]").forEach(function (item) {
      item.setAttribute("aria-pressed", item === button ? "true" : "false");
    });
  });

  document.getElementById("limb-list").addEventListener("click", function (event) {
    var button = event.target.closest("[data-limb]");
    if (!button) return;
    steps.push({ limb: button.getAttribute("data-limb"), t: nowSeconds() });
    renderGait();
  });

  canvas.addEventListener("pointerdown", tapPoint);
  canvas.addEventListener("click", tapPoint);
  document.getElementById("clear-points").addEventListener("click", function () {
    points = {};
    draw();
    renderSaddle();
  });
  document.getElementById("clear-steps").addEventListener("click", function () {
    steps = [];
    samples = [];
    watchStart = 0;
    renderGait();
  });
  document.getElementById("use-camera").addEventListener("click", useCamera);
  document.getElementById("video-file").addEventListener("change", function (event) {
    useFile(event.target.files[0], "video");
  });
  document.getElementById("photo-file").addEventListener("change", function (event) {
    useFile(event.target.files[0], "photo");
  });
  document.getElementById("tab-gait").addEventListener("click", function () { showPanel("gait"); });
  document.getElementById("tab-saddle").addEventListener("click", function () { showPanel("saddle"); renderSaddle(); });
  document.getElementById("tab-health").addEventListener("click", function () { showPanel("health"); });
  document.getElementById("save-saddle").addEventListener("click", function () {
    var rows = readList(cfg.saddleStorageKey);
    rows.push(saddlePayload());
    writeList(cfg.saddleStorageKey, rows);
    renderSaddleLog();
  });
  document.getElementById("saddle-log").addEventListener("click", function (event) {
    var button = event.target.closest("[data-saddle-del]");
    if (!button) return;
    var rows = readList(cfg.saddleStorageKey);
    rows.splice(Number(button.getAttribute("data-saddle-del")), 1);
    writeList(cfg.saddleStorageKey, rows);
    renderSaddleLog();
  });
  document.getElementById("health-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var rows = readList(cfg.healthStorageKey);
    rows.push(healthPayload());
    writeList(cfg.healthStorageKey, rows);
    renderHealth();
  });
  document.getElementById("health-log").addEventListener("click", function (event) {
    var button = event.target.closest("[data-health-del]");
    if (!button) return;
    var rows = readList(cfg.healthStorageKey);
    rows.splice(Number(button.getAttribute("data-health-del")), 1);
    writeList(cfg.healthStorageKey, rows);
    renderHealth();
  });
  document.getElementById("export-csv").addEventListener("click", exportCsv);
  window.addEventListener("resize", syncCanvas);

  buildPointButtons();
  buildSaddleChecks();
  buildHealthForm();
  renderGait();
  renderSaddle();
  renderHealth();
  startModel();
})();
