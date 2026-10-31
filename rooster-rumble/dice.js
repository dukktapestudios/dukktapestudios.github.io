(function () {
  var STORAGE_KEY = "rooster-rumble-sound";
  var banner = document.getElementById("dice-banner");
  var button = document.getElementById("sound-toggle");
  var enabled = true;
  try { enabled = localStorage.getItem(STORAGE_KEY) !== "off"; } catch (err) {}
  var ctx = null;
  var master = null;
  var noiseBuf = null;
  var unlocked = false;
  var bound = null;
  var seen = 0;
  var queue = [];
  var playing = false;
  var token = 0;
  var fast = /[?&]fast=1/.test(location.search);

  function remember() {
    try { localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off"); } catch (err) {}
  }

  function syncButton() {
    if (!button) return;
    button.textContent = enabled ? "Sound on" : "Sound off";
    button.setAttribute("aria-pressed", enabled ? "true" : "false");
    button.setAttribute("aria-label", enabled ? "Sound on. Tap to turn sound off." : "Sound off. Tap to turn sound on.");
  }

  function soundAllowed() {
    if (window.CLUCK_SFX && typeof window.CLUCK_SFX.enabled === "function") return window.CLUCK_SFX.enabled();
    return enabled;
  }

  function ensure() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.4;
    master.connect(ctx.destination);
    return true;
  }

  function unlock() {
    if (!ensure()) return;
    unlocked = true;
    if (ctx.state === "suspended") ctx.resume().catch(function () {});
  }

  function noiseBuffer() {
    if (noiseBuf) return noiseBuf;
    var len = Math.floor(ctx.sampleRate * 0.4);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = noiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }

  function rattle() {
    if (!soundAllowed() || !unlocked || !ensure()) return;
    var start = ctx.currentTime + 0.02;
    var run = function () {
      if (!soundAllowed()) return;
      for (var i = 0; i < 5; i++) {
        var t = start + i * 0.055;
        var src = ctx.createBufferSource();
        src.buffer = noiseBuffer();
        var filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(900 + i * 280, t);
        filter.Q.value = 0.8;
        var gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.16, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        src.start(t);
        src.stop(t + 0.05);
      }
    };
    if (ctx.state === "suspended") ctx.resume().then(run).catch(function () {});
    else run();
  }

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function faceText(item, spinning) {
    if (item.kind === "coin") {
      if (spinning) return Math.random() < 0.5 ? "H" : "T";
      return item.value === "heads" ? "H" : "T";
    }
    if (spinning) return String(1 + Math.floor(Math.random() * 6));
    return String(item.value);
  }

  function needText(item) {
    if (item.need != null) return "Needed " + item.need + "+";
    if (item.needFace) return "Needed " + item.needFace;
    return "Coin flip";
  }

  function show(group, done) {
    var my = ++token;
    banner.hidden = false;
    banner.replaceChildren();
    var spin = !reduced() && !fast;
    var faces = group.map(function (item) {
      var wrap = document.createElement("div");
      wrap.className = "die-wrap";
      var face = document.createElement("div");
      face.className = "die" + (spin ? " spin" : " landed");
      face.setAttribute("aria-hidden", "true");
      face.textContent = faceText(item, spin);
      var word = document.createElement("div");
      word.className = "die-word";
      word.setAttribute("aria-hidden", "true");
      wrap.appendChild(face);
      wrap.appendChild(word);
      banner.appendChild(wrap);
      return { face: face, word: word, item: item };
    });
    var need = document.createElement("div");
    need.className = "needed";
    need.setAttribute("aria-hidden", "true");
    need.textContent = needText(group[0]);
    banner.appendChild(need);
    var live = document.createElement("div");
    live.className = "dice-live";
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");
    banner.appendChild(live);

    function land() {
      if (my !== token) return;
      faces.forEach(function (entry) {
        entry.face.classList.remove("spin");
        entry.face.classList.add("landed");
        entry.face.textContent = faceText(entry.item, false);
        entry.word.textContent = String(entry.item.word).toUpperCase();
        entry.word.classList.add(entry.item.ok ? "ok" : "bad");
      });
      live.textContent = group.map(function (item) { return item.line; }).join(" ");
    }

    rattle();
    if (spin) {
      var ticks = 0;
      var timer = setInterval(function () {
        if (my !== token) { clearInterval(timer); return; }
        ticks += 1;
        faces.forEach(function (entry) { entry.face.textContent = faceText(entry.item, true); });
        if (ticks > 10) { clearInterval(timer); land(); }
      }, 70);
    } else land();

    setTimeout(function () {
      if (my !== token) return;
      land();
      done();
    }, fast ? 40 : 1200);
  }

  function pumpQueue() {
    if (playing || !queue.length) {
      if (!playing && banner) banner.hidden = true;
      return;
    }
    playing = true;
    show(queue.shift(), function () {
      playing = false;
      pumpQueue();
    });
  }

  function take(game) {
    if (!banner || !game || !game.reveals) return;
    if (game !== bound) {
      bound = game;
      seen = 0;
      queue = [];
      token += 1;
      playing = false;
    }
    var fresh = game.reveals.slice(seen);
    seen = game.reveals.length;
    var i;
    for (i = 0; i < fresh.length; i++) {
      var item = fresh[i];
      var last = queue[queue.length - 1];
      if (last && last[0].group === item.group) last.push(item);
      else queue.push([item]);
    }
    pumpQueue();
  }

  document.addEventListener("pointerdown", unlock, true);
  document.addEventListener("keydown", unlock, true);

  window.CLUCK_DICE = { take: take, rattle: rattle, enabled: function () { return soundAllowed(); } };
})();
