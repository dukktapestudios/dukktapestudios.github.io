(function (root, factory) {
  var api = factory(typeof document !== "undefined" ? document : null);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CLUCK_SFX = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (doc) {
  var STORAGE_KEY = "rooster-rumble-sound";

  function cuesFor(line) {
    var cues = [];
    if (/You win\.$/.test(line)) cues.push("win");
    else if (/Rival wins\.$/.test(line)) cues.push("lose");
    if (/ is knocked out\.$/.test(line)) cues.push("ko");
    if (/ takes \d+ damage\b/.test(line)) cues.push("hit");
    if (/^(You|Rival) uses .+/.test(line)) cues.push("attack");
    if (/ switches .+ out\./.test(line) || / sends in /.test(line)) cues.push("switch");
    if (/^You draw |^Rival draws a card/.test(line)) cues.push("draw");
    if (/ attaches (Grain|Golden Grain) /.test(line) || /^Attached \d+ Grain/.test(line) || /^Moved \d+ Grain/.test(line)) cues.push("grain");
    else if (/ plays /.test(line) || / attaches /.test(line) || / with Squawk Back\.$/.test(line) || /^Hex Ward cancels /.test(line)) cues.push("card");
    return cues;
  }

  var enabled = true;
  try {
    enabled = window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch (err) {}

  var ctx = null;
  var master = null;
  var noiseBuf = null;
  var unlocked = false;
  var queueTime = 0;
  var played = [];
  var button = null;

  function remember() {
    try { window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off"); } catch (err) {}
  }

  function label() {
    return enabled ? "Sound on" : "Sound off";
  }

  function syncButton() {
    if (!button) return;
    button.textContent = label();
    button.setAttribute("aria-pressed", enabled ? "true" : "false");
    button.setAttribute("aria-label", enabled ? "Sound on. Tap to turn sound off." : "Sound off. Tap to turn sound on.");
  }

  function setEnabled(on) {
    enabled = !!on;
    remember();
    syncButton();
  }

  function noiseBuffer() {
    if (noiseBuf) return noiseBuf;
    var seconds = 0.5;
    var len = Math.floor(ctx.sampleRate * seconds);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = noiseBuf.getChannelData(0);
    var i;
    for (i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }

  function env(t, dur, peak) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + Math.min(0.02, dur * 0.25));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(master);
    return g;
  }

  function osc(type, freq, t, dur, peak, slideTo) {
    var o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    o.connect(env(t, dur, peak));
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function noise(t, dur, peak, kind, freq, q) {
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    var filter = ctx.createBiquadFilter();
    filter.type = kind;
    filter.frequency.setValueAtTime(freq, t);
    filter.Q.value = q;
    src.connect(filter);
    filter.connect(env(t, dur, peak));
    src.start(t);
    src.stop(t + dur);
  }

  var voices = {
    attack: function (t) {
      noise(t, 0.09, 0.14, "highpass", 1400, 0.7);
      osc("sawtooth", 240, t, 0.14, 0.07, 90);
      return 0.16;
    },
    hit: function (t) {
      osc("sine", 160, t, 0.11, 0.22, 48);
      noise(t, 0.05, 0.1, "lowpass", 700, 0.6);
      return 0.13;
    },
    ko: function (t) {
      osc("triangle", 494, t, 0.36, 0.16, 92);
      osc("sine", 247, t + 0.05, 0.32, 0.08, 70);
      return 0.4;
    },
    card: function (t) {
      osc("square", 523, t, 0.07, 0.05);
      osc("square", 784, t + 0.07, 0.09, 0.045);
      return 0.18;
    },
    grain: function (t) {
      noise(t, 0.14, 0.09, "bandpass", 2200, 1.1);
      osc("sine", 990, t + 0.04, 0.05, 0.04);
      return 0.16;
    },
    switch: function (t) {
      osc("sine", 280, t, 0.13, 0.08, 740);
      noise(t, 0.1, 0.05, "highpass", 900, 0.5);
      return 0.15;
    },
    draw: function (t) {
      noise(t, 0.06, 0.07, "highpass", 2800, 0.6);
      osc("triangle", 698, t + 0.03, 0.08, 0.05);
      return 0.12;
    },
    win: function (t) {
      [523, 659, 784, 1047].forEach(function (freq, i) {
        osc("triangle", freq, t + i * 0.11, 0.16, 0.09);
      });
      return 0.58;
    },
    lose: function (t) {
      [392, 349, 311, 220].forEach(function (freq, i) {
        osc("sine", freq, t + i * 0.12, 0.18, 0.09);
      });
      return 0.6;
    }
  };

  function ensure() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.45;
    master.connect(ctx.destination);
    return true;
  }

  function unlock() {
    if (unlocked && ctx && ctx.state !== "suspended") return;
    if (!ensure()) return;
    unlocked = true;
    if (ctx.state === "suspended") {
      ctx.resume().catch(function () {});
    }
  }

  function play(name) {
    if (!enabled || !unlocked || !voices[name]) return false;
    if (!ensure()) return false;
    var fire = function () {
      if (!enabled || !ctx) return;
      var t = Math.max(ctx.currentTime + 0.02, queueTime);
      var dur = voices[name](t) || 0.12;
      queueTime = t + dur + 0.03;
      played.push(name);
    };
    if (ctx.state === "suspended") {
      ctx.resume().then(fire).catch(function () {});
    } else {
      fire();
    }
    return true;
  }

  if (doc) {
    button = doc.getElementById("sound-toggle");
    syncButton();
    if (button) {
      button.addEventListener("click", function () {
        setEnabled(!enabled);
      });
    }
    function arm() { unlock(); }
    doc.addEventListener("pointerdown", arm, true);
    doc.addEventListener("keydown", arm, true);
  }

  return {
    cuesFor: cuesFor,
    play: play,
    unlock: unlock,
    setEnabled: setEnabled,
    enabled: function () { return enabled; },
    unlocked: function () { return unlocked; },
    context: function () { return ctx; },
    played: function () { return played.slice(); }
  };
});
