(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CLUCK_ENGINE = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var CARDS = typeof module !== "undefined" && module.exports
    ? require("./cards.js")
    : globalThis.CLUCK_CARDS;

  function rngFrom(seed) {
    var s = (seed >>> 0) || 1;
    return function () {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function mainFlock(lineup) {
    var counts = {};
    lineup.forEach(function (r) { counts[r.flock] = (counts[r.flock] || 0) + 1; });
    var best = lineup[0].flock;
    var n = 0;
    lineup.forEach(function (r) {
      if (counts[r.flock] > n) { n = counts[r.flock]; best = r.flock; }
    });
    return best;
  }

  function Game(opts) {
    opts = opts || {};
    this.rng = rngFrom(opts.seed || 1);
    this.logLines = [];
    this.reveals = [];
    this._revealGroup = 0;
    this.turnId = 0;
    this.winner = null;
    this.winReason = "";
    this.human = opts.human == null ? 0 : opts.human;
    this.pending = null;
    this.resumeAt = null;
    this.combat = null;
    this.roll = null;
    this.held = null;
    this.promoteQueue = [];
    this.peek = null;
    this.seq = 1;
    this.players = [
      this.makePlayer(0, "You", opts.deck0 || "dawn"),
      this.makePlayer(1, "Rival", opts.deck1 || "night")
    ];
    this.players.forEach(function (p) { this.shuffle(p.deck); }, this);
    this.players.forEach(function (p) {
      for (var i = 0; i < 5; i++) this.drawTo(p, true);
    }, this);
    var flip = this.coin();
    this.openRevealGroup();
    this.recordCoin(flip, null);
    this.firstPlayer = opts.first == null ? (flip === "heads" ? 0 : 1) : opts.first;
    var starter = this.firstPlayer === 0 ? "You go" : "Rival goes";
    this.log("Coin flip: " + flip + ". " + starter + " first and skips the first draw. No attack on that first turn.");
    this.turn = this.firstPlayer;
    this.beginTurn();
  }

  Game.prototype.setWinner = function (player, reason) {
    if (this.winner != null) return;
    this.winner = player;
    this.winReason = reason;
    this.log(reason + " " + (player === 0 ? "You win." : "Rival wins."));
  };

  Game.prototype.log = function (text) {
    this.logLines.push(text);
  };

  Game.prototype.cloneCard = function (id) {
    var d = CARDS.supportById[id];
    return { uid: "c" + (this.seq++), id: d.id, name: d.name, type: d.type, flock: d.flock, text: d.text, flavor: d.flavor, emoji: d.emoji, energy: d.energy || 0 };
  };

  Game.prototype.cloneRooster = function (id, owner) {
    var d = CARDS.roosterById[id];
    return {
      uid: "p" + owner + "-" + id,
      defId: id,
      name: d.name,
      flock: d.flock,
      baseHp: d.hp,
      weak: d.weak,
      retreat: d.retreat,
      energy: d.energy || 0,
      emoji: d.emoji,
      flavor: d.flavor,
      special: d.special,
      attacks: d.attacks,
      damage: 0,
      grain: [],
      gear: null,
      ko: false,
      sigUsed: false,
      becameActiveTurn: 0,
      attackedTurn: 0,
      wontUsed: false,
      shoeUsed: false,
      burn: false,
      noSwitchOn: 0,
      hexOn: 0,
      fortressOn: 0,
      lastStandOn: 0
    };
  };

  Game.prototype.makePlayer = function (index, name, deckId) {
    var self = this;
    var deck = CARDS.decks.filter(function (d) { return d.id === deckId; })[0];
    var lineup = deck.roosters.map(function (id) { return self.cloneRooster(id, index); });
    var cards = [];
    deck.cards.forEach(function (entry) {
      for (var n = 0; n < entry.n; n++) cards.push(self.cloneCard(entry.id));
    });
    return {
      index: index, name: name, deckId: deck.id, deckName: deck.name, blurb: deck.blurb,
      mainFlock: mainFlock(lineup), lineup: lineup, activeId: lineup[0].uid,
      deck: cards, hand: [], discard: [], coop: null,
      sigThisTurn: false, switched: false, hoarderUsed: false, loftUsed: false,
      spur: 0, feather: false, coopPlayed: false, koTurn: -1,
      energy: 0, energyMax: 0, turnsTaken: 0
    };
  };

  Game.prototype.shuffle = function (arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(this.rng() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  };

  Game.prototype.d6 = function () { return 1 + Math.floor(this.rng() * 6); };
  Game.prototype.coin = function () { return this.rng() < 0.5 ? "heads" : "tails"; };

  Game.prototype.openRevealGroup = function () {
    this._revealGroup = (this._revealGroup || 0) + 1;
  };

  Game.prototype.recordDie = function (value, need, mode) {
    var ok = this.isHit(value, need);
    var word = mode === "hit" ? (ok ? "hit" : "miss") : (ok ? "success" : "fail");
    var line = "Rolled " + value + ", needed " + need + "+, " + word + ".";
    this.reveals.push({ kind: "die", value: value, need: need, word: word, ok: ok, group: this._revealGroup, line: line });
    this.log(line);
  };

  Game.prototype.recordCoin = function (face, needFace) {
    var ok = !needFace || face === needFace;
    var word = needFace ? (ok ? "success" : "fail") : face;
    var line = needFace
      ? "Rolled " + face + ", needed " + needFace + ", " + word + "."
      : "Rolled " + face + ".";
    this.reveals.push({ kind: "coin", value: face, needFace: needFace || "", word: word, ok: ok, group: this._revealGroup, line: line });
    this.log(line);
  };
  Game.prototype.cur = function () { return this.players[this.turn]; };
  Game.prototype.opp = function () { return this.players[1 - this.turn]; };

  Game.prototype.ownerOf = function (rooster) {
    for (var i = 0; i < 2; i++) {
      if (this.players[i].lineup.some(function (r) { return r.uid === rooster.uid; })) return this.players[i];
    }
    return null;
  };

  Game.prototype.living = function (p) { return p.lineup.filter(function (r) { return !r.ko; }); };

  Game.prototype.activeOf = function (p) {
    for (var i = 0; i < p.lineup.length; i++) if (p.lineup[i].uid === p.activeId) return p.lineup[i];
    return null;
  };

  Game.prototype.benchOf = function (p) {
    var a = this.activeOf(p);
    return this.living(p).filter(function (r) { return r !== a; });
  };

  Game.prototype.maxHp = function (r) {
    if (r.special.key === "cornFed") return r.baseHp + 10 * this.grainTotal(r);
    return r.baseHp;
  };

  Game.prototype.remaining = function (r) { return this.maxHp(r) - r.damage; };

  Game.prototype.grainValue = function (card, rooster, player) {
    if (card.id === "golden") return rooster.flock === player.mainFlock ? 2 : 1;
    return 1;
  };

  Game.prototype.grainTotal = function (r) {
    var p = this.ownerOf(r);
    var self = this;
    return r.grain.reduce(function (s, c) { return s + self.grainValue(c, r, p); }, 0);
  };

  Game.prototype.retreatCost = function (r) {
    if (r.special.key === "skywalk") return 0;
    return r.retreat;
  };

  Game.prototype.ask = function (player, kind, prompt, options) {
    this.pending = { player: player, kind: kind, prompt: prompt, options: options };
  };

  Game.prototype.choose = function (id) {
    if (!this.pending || this.winner) return;
    var pending = this.pending;
    var opt = null;
    for (var i = 0; i < pending.options.length; i++) if (pending.options[i].id === id) opt = pending.options[i];
    if (!opt) opt = pending.options[0];
    this.pending = null;
    this.onChoice(pending, opt);
  };

  Game.prototype.beginTurn = function () {
    if (this.winner) return;
    this.turnId += 1;
    var p = this.cur();
    this.log("— " + p.name + " · turn " + this.turnId + " —");
    p.sigThisTurn = false;
    p.switched = false;
    p.hoarderUsed = false;
    p.loftUsed = false;
    p.spur = 0;
    p.feather = false;
    p.coopPlayed = false;
    p.turnsTaken = (p.turnsTaken || 0) + 1;
    p.energyMax = Math.min(10, p.turnsTaken);
    p.energy = p.energyMax;
    this.log(p.name + " has " + p.energy + "/" + p.energyMax + " energy.");
    var skipDraw = this.turnId === 1 && this.turn === this.firstPlayer;
    if (!skipDraw) {
      if (!p.deck.length) {
        this.setWinner(1 - this.turn, p.name + " cannot draw a card.");
        return;
      }
      this.drawTo(p, false);
    } else {
      this.log(p.name + " skips the opening draw.");
    }
    this.enterFeed();
  };

  Game.prototype.drawTo = function (p, silent) {
    if (!p.deck.length) return false;
    var c = p.deck.pop();
    p.hand.push(c);
    if (!silent) this.log((p.index === this.human ? "You draw " + c.name : "Rival draws a card") + ".");
    return true;
  };

  Game.prototype.enterFeed = function () {
    if (this.winner) return;
    this.phase = "feed";
    var opts = this.feedOptions(this.cur());
    if (!opts.length) {
      var hungry = this.cur();
      var holding = hungry.hand.some(function (c) { return c.type === "Grain"; });
      this.log(holding ? hungry.name + " cannot afford to attach Grain." : hungry.name + " has no Grain to attach.");
      this.enterHoarder();
      return;
    }
    this.ask(this.turn, "feed", "Feed: attach 1 Grain from your hand.", opts);
  };

  Game.prototype.feedOptions = function (p) {
    var self = this;
    var plains = p.hand.some(function (c) { return c.id === "grain"; });
    var golds = p.hand.some(function (c) { return c.id === "golden"; });
    var opts = [];
    this.living(p).forEach(function (r) {
      if (plains && self.canAffordId(p, "grain")) opts.push({ id: "feed:" + r.uid + ":grain", uid: r.uid, card: "grain", label: "Attach Grain to " + r.name + " (" + CARDS.supportById.grain.energy + " energy)" });
      if (golds && r.flock === p.mainFlock && self.canAffordId(p, "golden")) opts.push({ id: "feed:" + r.uid + ":golden", uid: r.uid, card: "golden", label: "Attach Golden Grain to " + r.name + " (" + CARDS.supportById.golden.energy + " energy, counts as 2)" });
    });
    return opts;
  };

  Game.prototype.attachNamed = function (p, rooster, cardId) {
    var idx = -1;
    for (var i = 0; i < p.hand.length; i++) if (p.hand[i].id === cardId) { idx = i; break; }
    if (idx < 0) return false;
    var card = p.hand[idx];
    if (!this.spendEnergy(p, card.energy || 0)) return false;
    p.hand.splice(idx, 1);
    rooster.grain.push(card);
    this.log(p.name + " attaches " + card.name + " to " + rooster.name + " (" + this.grainTotal(rooster) + " Grain).");
    return true;
  };

  Game.prototype.enterHoarder = function () {
    var p = this.cur();
    var seed = this.living(p).filter(function (r) { return r.special.key === "hoarder"; })[0];
    var opts = seed && !p.hoarderUsed ? this.feedOptions(p).filter(function (o) { return o.uid === seed.uid; }) : [];
    if (!opts.length) { this.enterSupport(); return; }
    opts.push({ id: "skip", label: "Skip Hoarder" });
    this.ask(this.turn, "hoarder", "Hoarder: " + seed.name + " may attach 1 extra Grain.", opts);
  };

  Game.prototype.enterSupport = function () {
    if (this.winner) return;
    this.phase = "support";
    var opts = this.supportOptions(this.cur());
    opts.push({ id: "done", label: "Done with support cards" });
    this.ask(this.turn, "support", "Play Actions, Gear, and up to 1 Coop that you can afford. Then press Done.", opts);
  };

  Game.prototype.hasFlock = function (p, flock) {
    if (flock === "Any") return true;
    return this.living(p).some(function (r) { return r.flock === flock; });
  };

  Game.prototype.supportOptions = function (p) {
    var self = this;
    var seen = {};
    var opts = [];
    p.hand.forEach(function (c) {
      if (seen[c.id]) return;
      if (c.type === "Grain" || c.type === "Counter") return;
      if (!self.canPlay(p, c)) return;
      seen[c.id] = true;
      opts.push({ id: "play:" + c.id, card: c.id, label: "Play " + c.name + " (" + (c.energy || 0) + " energy)" });
    });
    return opts;
  };

  Game.prototype.canAffordId = function (p, id) {
    var d = CARDS.supportById[id];
    return !!d && p.energy >= (d.energy || 0);
  };

  Game.prototype.spendEnergy = function (p, n) {
    n = n || 0;
    if (n <= 0) return true;
    if (p.energy < n) return false;
    p.energy -= n;
    this.log(p.name + " spends " + n + " energy (" + p.energy + "/" + p.energyMax + " left).");
    return true;
  };

  Game.prototype.canAttackNow = function (r) {
    if (!r || r.ko) return false;
    if (r.attackedTurn === this.turnId) return false;
    if (r.becameActiveTurn === this.turnId && (!r.special || r.special.key !== "shortFuse")) return false;
    return true;
  };

  Game.prototype.canPlay = function (p, card) {
    if ((card.energy || 0) > p.energy) return false;
    if (!this.hasFlock(p, card.flock)) return false;
    if (card.type === "Coop" && p.coopPlayed) return false;
    if (card.id === "flame") {
      var a = this.activeOf(p);
      return !!(a && a.flock === "Sunfire");
    }
    if (card.id === "trough") return !!this.activeOf(p);
    if (card.id === "gust" || card.id === "swap") return this.switchTargets(p, card.id === "swap").length > 0;
    if (card.id === "frenzy") return this.discardGrain(p).length > 0 && this.living(p).some(function (r) { return r.flock === "Wildroost"; });
    if (card.id === "root") return this.living(p).some(function (r) { return r.flock === "Wildroost" && r.damage > 0; });
    if (card.id === "sunrise") return this.living(this.players[1 - p.index]).length > 0;
    if (card.id === "scratch") return this.players[1 - p.index].hand.length > 0;
    if (card.id === "bell") return this.bellMoves(p).length > 0;
    if (card.type === "Gear") return this.gearTargets(p, card).length > 0;
    if (card.id === "feather") return !p.feather;
    return true;
  };

  Game.prototype.gearTargets = function (p, card) {
    return this.living(p).filter(function (r) {
      if (r.gear) return false;
      if (card.flock !== "Any" && r.flock !== card.flock) return false;
      return true;
    });
  };

  Game.prototype.discardGrain = function (p) {
    return p.discard.filter(function (c) { return c.type === "Grain"; });
  };

  Game.prototype.blockedSwitch = function (r) {
    return r.noSwitchOn === this.turnId;
  };

  Game.prototype.switchTargets = function (p, payHalf) {
    var active = this.activeOf(p);
    if (!active || active.ko || this.blockedSwitch(active)) return [];
    var cost = payHalf ? Math.floor(this.retreatCost(active) / 2) : 0;
    if (payHalf && this.grainTotal(active) < cost) return [];
    var self = this;
    return this.benchOf(p).filter(function (r) { return !self.blockedSwitch(r); });
  };

  Game.prototype.bellMoves = function (p) {
    var live = this.living(p);
    var opts = [];
    live.forEach(function (from) {
      if (!from.grain.length) return;
      live.forEach(function (to) {
        if (from.uid === to.uid) return;
        opts.push({ id: "move:" + from.uid + ":" + to.uid, from: from.uid, to: to.uid, label: "Move Grain from " + from.name + " to " + to.name });
      });
    });
    return opts;
  };

  Game.prototype.findRooster = function (uid) {
    for (var i = 0; i < 2; i++) {
      for (var j = 0; j < this.players[i].lineup.length; j++) {
        if (this.players[i].lineup[j].uid === uid) return this.players[i].lineup[j];
      }
    }
    return null;
  };

  Game.prototype.tryPlay = function (p, cardId) {
    var card = null;
    for (var i = 0; i < p.hand.length; i++) if (p.hand[i].id === cardId) { card = p.hand.splice(i, 1)[0]; break; }
    if (!card) { this.enterSupport(); return; }
    if (!this.spendEnergy(p, card.energy || 0)) {
      p.hand.push(card);
      this.log(p.name + " cannot afford " + card.name + ".");
      this.enterSupport();
      return;
    }
    var targets = this.playTargets(p, card);
    if (targets === "instant") {
      this.holdOrApply(p, card, null);
      return;
    }
    if (!targets.length) {
      this.log(card.name + " has no legal target.");
      p.energy += card.energy || 0;
      p.hand.push(card);
      this.enterSupport();
      return;
    }
    if (targets.length === 1) { this.holdOrApply(p, card, targets[0]); return; }
    this.held = { card: card, player: p.index };
    var opts = targets.map(function (t) { return { id: t.id, label: t.label, ref: t }; });
    this.ask(p.index, "target", "Choose a target for " + card.name + ".", opts);
  };

  Game.prototype.playTargets = function (p, card) {
    var self = this;
    var opp = this.players[1 - p.index];
    if (card.id === "sunrise") {
      return this.living(opp).map(function (r) { return { id: "tgt:" + r.uid, uid: r.uid, label: r.name + " (" + self.remaining(r) + " HP)" }; });
    }
    if (card.id === "gust") {
      return this.switchTargets(p, false).map(function (r) { return { id: "tgt:" + r.uid, uid: r.uid, label: "Switch in " + r.name }; });
    }
    if (card.id === "swap") {
      return this.switchTargets(p, true).map(function (r) { return { id: "tgt:" + r.uid, uid: r.uid, label: "Swap in " + r.name }; });
    }
    if (card.id === "frenzy" || card.id === "root") {
      return this.living(p).filter(function (r) { return r.flock === "Wildroost" && (card.id !== "root" || r.damage > 0); }).map(function (r) {
        return { id: "tgt:" + r.uid, uid: r.uid, label: r.name };
      });
    }
    if (card.type === "Gear") {
      return this.gearTargets(p, card).map(function (r) { return { id: "tgt:" + r.uid, uid: r.uid, label: "Attach to " + r.name }; });
    }
    if (card.id === "bell") return this.bellMoves(p);
    return "instant";
  };

  Game.prototype.holdOrApply = function (p, card, target) {
    if (card.type === "Action") {
      var opp = this.players[1 - p.index];
      if (opp.hand.some(function (c) { return c.id === "squawk"; }) && this.hasFlock(opp, "Stormfeather") && this.canAffordId(opp, "squawk")) {
        this.held = { card: card, player: p.index, target: target };
        this.ask(opp.index, "squawk", p.name + " plays " + card.name + ". Play Squawk Back to cancel it?", [
          { id: "yes", label: "Play Squawk Back" },
          { id: "no", label: "Let it resolve" }
        ]);
        return;
      }
    }
    this.applySupport(p, card, target);
    if (!this.pending && !this.winner) this.afterSupportPause();
  };

  Game.prototype.afterSupportPause = function () {
    if (this.resumeAt) return;
    if (this.needsAnyPromote()) { this.resumeAt = "support"; this.askNextPromote(); return; }
    this.enterSupport();
  };

  Game.prototype.applySupport = function (p, card, target) {
    var self = this;
    if (card.type === "Action") p.discard.push(card);
    if (card.type === "Coop") {
      if (p.coop) { this.log(p.name + " replaces " + p.coop.name + "."); p.discard.push(p.coop); }
      p.coop = card;
      p.coopPlayed = true;
      this.log(p.name + " plays Coop: " + card.name + ".");
      return;
    }
    if (card.type === "Gear") {
      var rooster = this.findRooster(target.uid);
      rooster.gear = card;
      this.log(p.name + " attaches " + card.name + " to " + rooster.name + ".");
      return;
    }
    this.log(p.name + " plays " + card.name + ".");
    if (card.id === "sunrise") {
      this.deal(this.findRooster(target.uid), 30, { attack: false, ignoreReduction: false, source: p });
      this.flushKos();
    } else if (card.id === "flame") {
      p.spur += 30;
      this.log("The next attack this turn does +30.");
    } else if (card.id === "gust") {
      this.swapActive(p, target.uid, 0);
    } else if (card.id === "swap") {
      var active = this.activeOf(p);
      var cost = Math.floor(this.retreatCost(active) / 2);
      this.spendGrain(active, cost);
      this.swapActive(p, target.uid, cost);
    } else if (card.id === "frenzy") {
      var dest = this.findRooster(target.uid);
      var moved = 0;
      for (var n = 0; n < 2; n++) {
        var gidx = -1;
        for (var i = 0; i < p.discard.length; i++) if (p.discard[i].type === "Grain" && !(p.discard[i].id === "golden" && dest.flock !== p.mainFlock)) { gidx = i; break; }
        if (gidx < 0) break;
        dest.grain.push(p.discard.splice(gidx, 1)[0]);
        moved++;
      }
      this.log("Attached " + moved + " Grain from the discard to " + dest.name + ".");
    } else if (card.id === "root") {
      this.heal(this.findRooster(target.uid), 50);
    } else if (card.id === "scratch") {
      var oh = this.players[1 - p.index].hand;
      if (oh.length) {
        var ri = Math.floor(this.rng() * oh.length);
        var gone = oh.splice(ri, 1)[0];
        this.players[1 - p.index].discard.push(gone);
        this.log((this.players[1 - p.index].index === this.human ? "You discard " : "Rival discards ") + (this.players[1 - p.index].index === this.human ? gone.name : "a card") + ".");
      }
    } else if (card.id === "thanks") {
      for (var d = 0; d < 3; d++) if (!this.drawTo(p, false)) break;
    } else if (card.id === "trough") {
      this.heal(this.activeOf(p), 30);
    } else if (card.id === "feather") {
      p.feather = true;
      this.log("Lucky Feather is ready for one roll this turn.");
    } else if (card.id === "bell") {
      var from = this.findRooster(target.from);
      var to = this.findRooster(target.to);
      var pile = from.grain.splice(0, from.grain.length);
      to.grain = to.grain.concat(pile);
      this.log("Moved " + pile.length + " Grain from " + from.name + " to " + to.name + ".");
      this.koIfShrunk(from);
      this.flushKos();
    }
  };

  Game.prototype.heal = function (r, n) {
    if (!r || r.ko) return;
    var before = r.damage;
    r.damage = Math.max(0, r.damage - n);
    this.log(r.name + " heals " + (before - r.damage) + ". " + this.remaining(r) + " HP left.");
  };

  Game.prototype.swapActive = function (p, uid, paid) {
    var next = this.findRooster(uid);
    var prev = this.activeOf(p);
    p.activeId = uid;
    next.becameActiveTurn = this.turnId;
    this.log(p.name + " switches " + prev.name + " out. " + next.name + " is now active" + (paid ? " (paid " + paid + ")." : "."));
  };

  Game.prototype.spendGrain = function (rooster, amount) {
    if (amount <= 0) return true;
    var p = this.ownerOf(rooster);
    var cards = rooster.grain.slice().sort(function (a, b) {
      return (a.id === "golden" ? 2 : 1) - (b.id === "golden" ? 2 : 1);
    });
    var spent = [];
    var sum = 0;
    for (var i = 0; i < cards.length && sum < amount; i++) {
      spent.push(cards[i]);
      sum += this.grainValue(cards[i], rooster, p);
    }
    if (sum < amount) return false;
    var self = this;
    spent.forEach(function (c) {
      var idx = rooster.grain.indexOf(c);
      if (idx >= 0) p.discard.push(rooster.grain.splice(idx, 1)[0]);
    });
    this.koIfShrunk(rooster);
    return true;
  };

  Game.prototype.koIfShrunk = function (r) {
    if (!r.ko && this.remaining(r) <= 0) this.koQueuePush(r);
  };

  Game.prototype.koQueuePush = function (r) {
    this._koq = this._koq || [];
    this._koq.push(r);
  };

  Game.prototype.deal = function (target, amount, ctx) {
    ctx = ctx || {};
    if (!target || target.ko || this.winner) return 0;
    if (target.lastStandOn === this.turnId) {
      this.log(target.name + " takes no damage (Last Stand).");
      return 0;
    }
    var dmg = amount;
    if (!ctx.ignoreReduction) {
      if (target.gear && target.gear.id === "shield") dmg -= 20;
      if (target.special.key === "hotBlood" && ctx.attack && ctx.attackerFlock === "Wildroost") dmg -= 20;
      if (target.fortressOn === this.turnId) dmg -= 30;
      if (dmg < 0) dmg = 0;
      if (ctx.attack && target.flock === "Ironbeak") {
        var owner = this.ownerOf(target);
        if (owner.coop && owner.coop.id === "ironroost") {
          this.openRevealGroup();
          var roll = this.d6();
          this.recordDie(roll, 5, "check");
          this.log("Armor roll for " + target.name + ": " + roll + ".");
          if (roll >= 5) dmg = Math.floor(dmg / 2);
        }
      }
    }
    if (dmg < 0) dmg = 0;
    target.damage += dmg;
    this.log(target.name + " takes " + dmg + " damage (" + Math.max(0, this.remaining(target)) + " HP left).");
    if (ctx.pickpocket && dmg > 0) this.revealHand(this.ownerOf(target));
    if (this.remaining(target) <= 0) this.koQueuePush(target);
    return dmg;
  };

  Game.prototype.revealHand = function (victim) {
    this.peek = victim.index;
    var names = victim.hand.map(function (c) { return c.name; }).join(", ") || "nothing";
    this.log("Pickpocket: " + victim.name + "'s hand is " + names + ".");
  };

  Game.prototype.flushKos = function () {
    this._koq = this._koq || [];
    var guard = 0;
    while (this._koq.length && guard++ < 12) {
      var t = this._koq.shift();
      if (!t || t.ko || this.remaining(t) > 0) continue;
      this.applyKo(t);
    }
  };

  Game.prototype.applyKo = function (t) {
    if (t.ko || this.remaining(t) > 0 || this.winner) return;
    if (t.special.key === "wontStay" && !t.wontUsed) {
      t.wontUsed = true;
      t.damage = Math.max(0, this.maxHp(t) - 10);
      this.log(t.name + " won't stay down and remains at 10 HP.");
      return;
    }
    if (t.gear && t.gear.id === "horseshoe" && !t.shoeUsed) {
      t.shoeUsed = true;
      var owner = this.ownerOf(t);
      owner.discard.push(t.gear);
      t.gear = null;
      t.damage = Math.max(0, this.maxHp(t) - 10);
      this.log("Lucky Horseshoe keeps " + t.name + " at 10 HP and is discarded.");
      return;
    }
    var owner2 = this.ownerOf(t);
    t.ko = true;
    owner2.koTurn = this.turnId;
    while (t.grain.length) owner2.discard.push(t.grain.pop());
    if (t.gear) { owner2.discard.push(t.gear); t.gear = null; }
    this.log(t.name + " is knocked out.");
    if (owner2.lineup.every(function (r) { return r.ko; })) {
      this.setWinner(1 - owner2.index, "All 3 of " + owner2.name + "'s roosters are knocked out.");
      return;
    }
    if (t.special.key === "lightningRod") {
      var foe = this.activeOf(this.players[1 - owner2.index]);
      if (foe && !foe.ko) {
        this.log("Lightning Rod hits " + foe.name + ".");
        this.deal(foe, 40, { attack: false });
      }
    }
  };

  Game.prototype.needsPromote = function (p) {
    var a = this.activeOf(p);
    return !!(a && a.ko && this.living(p).length);
  };

  Game.prototype.needsAnyPromote = function () {
    return this.needsPromote(this.players[0]) || this.needsPromote(this.players[1]);
  };

  Game.prototype.askNextPromote = function () {
    if (this.winner) return;
    var order = [this.turn, 1 - this.turn];
    for (var i = 0; i < order.length; i++) {
      var p = this.players[order[i]];
      if (!this.needsPromote(p)) continue;
      var self = this;
      var opts = this.living(p).map(function (r) {
        return { id: "promote:" + r.uid, uid: r.uid, label: "Send in " + r.name + " (" + self.remaining(r) + " HP)" };
      });
      if (opts.length === 1) {
        this.promote(p, opts[0].uid);
        continue;
      }
      this.ask(p.index, "promote", p.name + ", choose the next active rooster.", opts);
      return;
    }
    this.continueAfterPromote();
  };

  Game.prototype.promote = function (p, uid) {
    p.activeId = uid;
    var r = this.findRooster(uid);
    r.becameActiveTurn = this.turnId;
    this.log(p.name + " sends in " + r.name + ".");
  };

  Game.prototype.continueAfterPromote = function () {
    var at = this.resumeAt;
    this.resumeAt = null;
    if (this.winner) return;
    if (at === "support") this.enterSupport();
    else if (at === "riders") this.attackRiders();
    else if (at === "cleanup") this.attackCleanup();
    else if (at === "sig") this.enterAttack();
    else if (at === "turn") this.reallyEndTurn();
    else this.enterSupport();
  };

  Game.prototype.enterSwitch = function () {
    if (this.winner) return;
    this.phase = "switch";
    var p = this.cur();
    var active = this.activeOf(p);
    var opts = [];
    if (active && !p.switched && !this.blockedSwitch(active)) {
      var cost = this.retreatCost(active);
      if (this.grainTotal(active) >= cost) {
        this.benchOf(p).forEach(function (r) {
          if (r.noSwitchOn === this.turnId) return;
          opts.push({ id: "switch:" + r.uid, uid: r.uid, label: "Switch to " + r.name + (cost ? " (discard " + cost + " Grain)" : " (free)") });
        }, this);
      }
    }
    opts.push({ id: "stay", label: "Don't switch" });
    if (opts.length === 1) { this.enterSignature(); return; }
    this.ask(this.turn, "switch", "Switch once by discarding Grain equal to the switch cost, or stay.", opts);
  };

  Game.prototype.enterSignature = function () {
    if (this.winner) return;
    this.phase = "signature";
    var p = this.cur();
    var r = this.activeOf(p);
    if (!r || r.sigUsed || p.sigThisTurn || r.special.type !== "signature") { this.enterAttack(); return; }
    this.ask(this.turn, "signature", "Use " + r.special.name + " before you attack? Roll 3+ or it is spent.", [
      { id: "use", label: "Use " + r.special.name },
      { id: "skip", label: "Save the Signature" }
    ]);
  };

  Game.prototype.enterAttack = function () {
    if (this.winner) return;
    this.phase = "attack";
    var p = this.cur();
    if (this.turnId === 1 && this.turn === this.firstPlayer) {
      this.log("The first player cannot attack on turn 1.");
      this.endTurn();
      return;
    }
    var r = this.activeOf(p);
    if (r && r.attackedTurn === this.turnId) {
      this.log(r.name + " already attacked this turn.");
      this.endTurn();
      return;
    }
    if (r && !this.canAttackNow(r)) {
      this.log(r.name + " just came in and cannot attack this turn.");
      this.endTurn();
      return;
    }
    var opts = [];
    if (r && !r.ko) {
      var self = this;
      r.attacks.forEach(function (atk, idx) {
        var cost = atk.cost + (r.hexOn === self.turnId ? 1 : 0);
        if (self.grainTotal(r) >= cost) {
          opts.push({ id: "atk:" + idx, index: idx, label: atk.name + " (" + cost + " Grain, " + (atk.scaleGrain ? "10 x Grain" : atk.dmg) + " dmg, hit " + atk.hit + "+)" });
        }
      });
    }
    opts.push({ id: "skip", label: "Don't attack" });
    this.ask(this.turn, "attack", "Choose 1 attack. Grain stays attached. A miss does no damage.", opts);
  };

  Game.prototype.startAttack = function (p, index, fromSignature, actor) {
    var r = actor || this.activeOf(p);
    r.attackedTurn = this.turnId;
    var atk = r.attacks[index];
    var defender = this.activeOf(this.players[1 - this.ownerOf(r).index]);
    this.combat = { atk: atk, attacker: r, defender: defender, fromSignature: !!fromSignature, hits: 0, crit: false, negated: false };
    this.log(this.ownerOf(r).name + " uses " + atk.name + ".");
    var diceN = this.diceCount(r, atk);
    var need = this.threshold(r, atk, defender);
    this.beginRoll({
      diceN: diceN,
      need: need,
      rerollMiss: !!atk.rerollMiss,
      attacker: r,
      purpose: "attack",
      label: atk.name
    });
  };

  Game.prototype.threshold = function (attacker, atk, defender) {
    var need = atk.hit;
    if (attacker.gear && attacker.gear.id === "dummy") need -= 1;
    var owner = this.ownerOf(attacker);
    if (owner.coop && owner.coop.id === "thorn" && attacker.flock === "Wildroost" && atk.cost >= 3) need -= 1;
    if (defender && defender.flock === "Duskcomb") {
      var dOwner = this.ownerOf(defender);
      if (dOwner.coop && dOwner.coop.id === "moonless") need += 1;
    }
    if (need < 2) need = 2;
    if (need > 6) need = 6;
    return need;
  };

  Game.prototype.diceCount = function (attacker, atk) {
    var n = atk.dice || 1;
    var owner = this.ownerOf(attacker);
    if (owner.coop && owner.coop.id === "phoenix" && attacker.flock === "Sunfire") n += 1;
    return n;
  };

  Game.prototype.isHit = function (value, need) {
    if (value === 1) return false;
    if (value === 6) return true;
    return value >= need;
  };

  Game.prototype.rollMode = function (spec) {
    return spec && spec.purpose === "attack" ? "hit" : "check";
  };

  Game.prototype.beginRoll = function (spec) {
    var dice = [];
    var mode = this.rollMode(spec);
    this.openRevealGroup();
    for (var i = 0; i < spec.diceN; i++) {
      var value = this.d6();
      dice.push({ value: value, rerolled: false });
      this.recordDie(value, spec.need, mode);
    }
    this.roll = { spec: spec, dice: dice, stage: "built" };
    this.log(spec.label + " rolls " + dice.map(function (d) { return d.value; }).join(", ") + " (need " + spec.need + "+).");
    this.advanceRoll();
  };

  Game.prototype.advanceRoll = function () {
    var roll = this.roll;
    if (!roll || this.winner) return;
    var spec = roll.spec;
    var self = this;
    if (roll.stage === "built") {
      if (spec.rerollMiss) {
        var openedReroll = false;
        roll.dice.forEach(function (d) {
          if (!self.isHit(d.value, spec.need) && !d.rerolled) {
            if (!openedReroll) { self.openRevealGroup(); openedReroll = true; }
            d.value = self.d6();
            d.rerolled = true;
            self.recordDie(d.value, spec.need, self.rollMode(spec));
          }
        });
        this.log("Built-in reroll: " + roll.dice.map(function (d) { return d.value; }).join(", ") + ".");
      }
      roll.stage = "storm";
    }
    if (roll.stage === "storm") {
      var owner = this.ownerOf(spec.attacker);
      var miss = roll.dice.filter(function (d) { return !self.isHit(d.value, spec.need) && !d.rerolled; })[0];
      if (miss && owner.coop && owner.coop.id === "stormloft" && spec.attacker.flock === "Stormfeather" && !owner.loftUsed) {
        if (owner.index !== this.human) {
          this.openRevealGroup();
          miss.value = this.d6();
          miss.rerolled = true;
          owner.loftUsed = true;
          this.recordDie(miss.value, spec.need, this.rollMode(spec));
          this.log("Storm Loft rerolls a miss to " + miss.value + ".");
        } else {
          roll.stage = "lucky";
          this.ask(owner.index, "storm", "Storm Loft can reroll one miss (" + roll.dice.map(function (d) { return d.value; }).join(", ") + ").", [
            { id: "yes", label: "Reroll one miss" },
            { id: "no", label: "Keep the dice" }
          ]);
          return;
        }
      }
      roll.stage = "lucky";
    }
    if (roll.stage === "lucky") {
      var owner2 = this.ownerOf(spec.attacker);
      var fresh = roll.dice.some(function (d) { return !d.rerolled; });
      if (owner2.feather && fresh) {
        if (owner2.index !== this.human) {
          this.openRevealGroup();
          roll.dice.forEach(function (d) {
            if (!d.rerolled && !self.isHit(d.value, spec.need)) {
              d.value = self.d6();
              d.rerolled = true;
              self.recordDie(d.value, spec.need, self.rollMode(spec));
            }
          });
          owner2.feather = false;
          this.log("Lucky Feather rerolls: " + roll.dice.map(function (d) { return d.value; }).join(", ") + ".");
        } else {
          roll.stage = "scare";
          this.ask(owner2.index, "lucky", "Lucky Feather can reroll dice that have not been rerolled (" + roll.dice.map(function (d) { return d.value; }).join(", ") + ").", [
            { id: "yes", label: "Reroll those dice" },
            { id: "no", label: "Keep the dice" }
          ]);
          return;
        }
      }
      roll.stage = "scare";
    }
    if (roll.stage === "scare") {
      var defenderOwner = spec.purpose === "attack" ? this.ownerOf(this.combat.defender) : this.players[1 - this.ownerOf(spec.attacker).index];
      var canScare = defenderOwner && defenderOwner.hand.some(function (c) { return c.id === "scarecrow"; }) && this.canAffordId(defenderOwner, "scarecrow");
      var anyFresh = roll.dice.some(function (d) { return !d.rerolled; });
      if (canScare && anyFresh && spec.purpose !== "armor") {
        var must = defenderOwner.index !== this.human
          ? roll.dice.some(function (d) { return self.isHit(d.value, spec.need); })
          : true;
        if (defenderOwner.index !== this.human && !must) {
          roll.stage = "score";
        } else if (defenderOwner.index !== this.human) {
          this.useScarecrow(defenderOwner);
          roll.stage = "score";
        } else {
          roll.stage = "score";
          this.ask(defenderOwner.index, "scare", "Hit roll: " + roll.dice.map(function (d) { return d.value; }).join(", ") + ". Play Scarecrow Decoy to reroll dice that have not been rerolled?", [
            { id: "yes", label: "Play Scarecrow Decoy" },
            { id: "no", label: "Let the roll stand" }
          ]);
          return;
        }
      } else roll.stage = "score";
    }
    if (roll.stage === "score") this.scoreRoll();
  };

  Game.prototype.useScarecrow = function (player) {
    var idx = -1;
    for (var i = 0; i < player.hand.length; i++) if (player.hand[i].id === "scarecrow") { idx = i; break; }
    if (idx < 0) return;
    if (!this.spendEnergy(player, player.hand[idx].energy || 0)) return;
    player.discard.push(player.hand.splice(idx, 1)[0]);
    var self = this;
    var changed = false;
    var openedScare = false;
    this.roll.dice.forEach(function (d) {
      if (!d.rerolled) {
        if (!openedScare) { self.openRevealGroup(); openedScare = true; }
        d.value = self.d6();
        d.rerolled = true;
        changed = true;
        self.recordDie(d.value, self.roll.spec.need, self.rollMode(self.roll.spec));
      }
    });
    this.log(player.name + " plays Scarecrow Decoy. New roll: " + this.roll.dice.map(function (d) { return d.value; }).join(", ") + ".");
    return changed;
  };

  Game.prototype.scoreRoll = function () {
    var roll = this.roll;
    var spec = roll.spec;
    var hits = 0;
    var crit = false;
    var self = this;
    roll.dice.forEach(function (d) {
      if (self.isHit(d.value, spec.need)) {
        hits++;
        if (d.value === 6) crit = true;
      }
    });
    this.log(hits + " hit" + (hits === 1 ? "" : "s") + (crit ? ", with a critical 6." : "."));
    if (spec.purpose === "signature") {
      this.roll = null;
      this.finishSignature(hits > 0);
      return;
    }
    this.combat.hits = hits;
    this.combat.crit = crit;
    this.roll = null;
    this.offerLockdown();
  };

  Game.prototype.offerLockdown = function () {
    var c = this.combat;
    var defOwner = this.ownerOf(c.defender);
    if (c.hits > 0 && defOwner && defOwner.hand.some(function (card) { return card.id === "lockdown"; }) && this.hasFlock(defOwner, "Ironbeak") && this.canAffordId(defOwner, "lockdown")) {
      if (defOwner.index !== this.human) {
        var per = this.perHit(c.attacker, c.atk);
        var total = per * c.hits + (c.crit ? 20 : 0);
        if (c.defender.weak === c.attacker.flock) total += 20;
        if (total >= 40 || total >= this.remaining(c.defender)) this.playLockdown(defOwner);
      } else {
        this.ask(defOwner.index, "lock", "Play Coop Lockdown? " + c.atk.name + " would deal damage.", [
          { id: "yes", label: "Play Coop Lockdown (0 damage)" },
          { id: "no", label: "Take the attack" }
        ]);
        return;
      }
    }
    this.applyAttackDamage();
  };

  Game.prototype.playLockdown = function (player) {
    if (!this.spendCounter(player, "lockdown")) return;
    this.combat.negated = true;
    this.combat.hits = 0;
    this.log(player.name + " plays Coop Lockdown. The attack does 0 damage.");
  };

  Game.prototype.perHit = function (attacker, atk) {
    var p = this.ownerOf(attacker);
    var dmg = atk.scaleGrain ? atk.scaleGrain * this.grainTotal(attacker) : atk.dmg;
    if (p.spur && this.combat && !this.combat.fromSignature) dmg += p.spur;
    if (attacker.special.key === "shortFuse" && attacker.becameActiveTurn === this.turnId) dmg += 20;
    if (attacker.special.key === "mothersWrath" && p.koTurn === this.turnId - 1) dmg += 30;
    return dmg;
  };

  Game.prototype.applyAttackDamage = function () {
    var c = this.combat;
    if (c.negated || c.hits <= 0) {
      this.log(c.atk.name + (c.negated ? " is stopped." : " misses. Grain stays put."));
      this.attackCleanup();
      return;
    }
    var per = this.perHit(c.attacker, c.atk);
    if (!c.fromSignature) this.ownerOf(c.attacker).spur = 0;
    var total = per * c.hits;
    if (c.crit) total += 20;
    if (c.defender.weak === c.attacker.flock) {
      total += 20;
      this.log("Weakness: +" + 20 + ".");
    }
    this.deal(c.defender, total, {
      attack: true,
      ignoreReduction: !!c.atk.ignoreReduction,
      attackerFlock: c.attacker.flock,
      pickpocket: c.attacker.special.key === "pickpocket"
    });
    if (c.atk.effects && c.atk.effects.indexOf("bench10all") >= 0) {
      var self = this;
      this.benchOf(this.ownerOf(c.defender)).forEach(function (b) {
        self.deal(b, 10, { attack: true, attackerFlock: c.attacker.flock });
      });
    }
    this.attackRiders();
  };

  Game.prototype.attackRiders = function () {
    if (this.winner) return;
    var c = this.combat;
    if (!c || c.hits <= 0 || c.negated) { this.attackCleanup(); return; }
    var effects = c.atk.effects || [];
    var self = this;
    if (effects.indexOf("bench20") >= 0) {
      var benches = this.benchOf(this.ownerOf(c.defender));
      if (benches.length > 1 && this.ownerOf(c.attacker).index === this.human) {
        this.ask(this.ownerOf(c.attacker).index, "rider", "Thunder Dive also deals 20. Choose a bench rooster.", benches.map(function (r) {
          return { id: "rider:" + r.uid, uid: r.uid, label: r.name };
        }));
        return;
      }
      if (benches.length) this.deal(benches[0], 20, { attack: true, attackerFlock: c.attacker.flock });
    }
    if (effects.indexOf("healBench20") >= 0) {
      var mine = this.benchOf(this.ownerOf(c.attacker));
      if (mine.length > 1 && this.ownerOf(c.attacker).index === this.human) {
        this.ask(this.ownerOf(c.attacker).index, "rider", "Heal 20 from a bench rooster.", mine.map(function (r) {
          return { id: "heal:" + r.uid, uid: r.uid, label: r.name };
        }));
        return;
      }
      if (mine.length) this.heal(mine[0], 20);
    }
    if (effects.indexOf("gust") >= 0) {
      var foe = this.ownerOf(c.defender);
      var active = this.activeOf(foe);
      if (active && active.special.key === "rooted") {
        this.log("Rooted: " + active.name + " cannot be forced to switch.");
      } else {
        var choices = this.benchOf(foe).filter(function (r) { return r.special.key !== "rooted"; });
        if (choices.length > 1 && this.ownerOf(c.attacker).index === this.human) {
          this.ask(this.ownerOf(c.attacker).index, "rider", "Gust: switch in an enemy bench rooster.", choices.map(function (r) {
            return { id: "gust:" + r.uid, uid: r.uid, label: r.name };
          }));
          return;
        }
        if (choices.length) this.swapActive(foe, choices[0].uid, 0);
        else this.log("Gust has no bench rooster to switch in.");
      }
    }
    this.flushKos();
    if (this.winner) return;
    if (this.needsAnyPromote()) { this.resumeAt = "cleanup"; this.askNextPromote(); return; }
    this.attackCleanup();
  };

  Game.prototype.attackCleanup = function () {
    if (this.winner || !this.combat) { this.endTurn(); return; }
    var c = this.combat;
    var effects = c.atk.effects || [];
    var used = !c.negated;
    if (used && c.hits > 0) {
      if (effects.indexOf("burn") >= 0 && c.defender && !c.defender.ko) {
        c.defender.burn = true;
        this.log(c.defender.name + " is burned.");
      }
      if (effects.indexOf("healSelf20") >= 0) this.heal(c.attacker, 20);
      if (effects.indexOf("draw1") >= 0) this.drawTo(this.ownerOf(c.attacker), false);
      if (effects.indexOf("noSwitch") >= 0 && c.defender && !c.defender.ko) {
        c.defender.noSwitchOn = this.turnId + 1;
        this.log(c.defender.name + " cannot switch next turn.");
      }
      if (effects.indexOf("hex") >= 0 && c.defender && !c.defender.ko) {
        c.defender.hexOn = this.turnId + 1;
        this.log(c.defender.name + "'s attacks cost 1 more next turn.");
      }
      if (effects.indexOf("fortress") >= 0) {
        c.attacker.fortressOn = this.turnId + 1;
        this.log(c.attacker.name + " will take 30 less damage next turn.");
      }
      if (effects.indexOf("discardOpp") >= 0) {
        var oh = this.ownerOf(c.defender).hand;
        if (oh.length) {
          var ri = Math.floor(this.rng() * oh.length);
          var gone = oh.splice(ri, 1)[0];
          this.ownerOf(c.defender).discard.push(gone);
          this.log(this.ownerOf(c.defender).index === this.human ? "You discard a card." : "Rival discards a card.");
        }
      }
    }
    if (used && !c.negated && effects.indexOf("coinTails20") >= 0) {
      this.openRevealGroup();
      var flip = this.coin();
      this.recordCoin(flip, "heads");
      this.log("Wild Swing coin: " + flip + ".");
      if (flip === "tails") this.deal(c.attacker, 20, { attack: false });
    }
    if (used && !c.negated && effects.indexOf("discard1") >= 0) this.spendGrain(c.attacker, 1);
    if (used && !c.negated && effects.indexOf("discardAllGrain") >= 0) {
      var owner = this.ownerOf(c.attacker);
      while (c.attacker.grain.length) owner.discard.push(c.attacker.grain.pop());
      this.log("All Grain on " + c.attacker.name + " is discarded.");
      this.koIfShrunk(c.attacker);
    }
    this.flushKos();
    this.combat = null;
    if (this.winner) return;
    if (this.needsAnyPromote()) { this.resumeAt = "turn"; this.askNextPromote(); return; }
    if (c.fromSignature) this.enterAttack();
    else this.endTurn();
  };

  Game.prototype.declareSignature = function (p) {
    var r = this.activeOf(p);
    r.sigUsed = true;
    p.sigThisTurn = true;
    var opp = this.players[1 - p.index];
    if (opp.hand.some(function (c) { return c.id === "hexward"; }) && this.hasFlock(opp, "Duskcomb") && this.canAffordId(opp, "hexward")) {
      if (opp.index !== this.human) {
        if (this.spendCounter(opp, "hexward")) this.log("Hex Ward cancels " + r.special.name + ". It is still used up.");
        this.enterAttack();
        return;
      }
      this.ask(opp.index, "hex", p.name + " uses " + r.special.name + ". Play Hex Ward? It stays used up.", [
        { id: "yes", label: "Play Hex Ward" },
        { id: "no", label: "Let the Signature roll" }
      ]);
      return;
    }
    this.rollSignature(r);
  };

  Game.prototype.spendCounter = function (p, id) {
    for (var i = 0; i < p.hand.length; i++) if (p.hand[i].id === id) {
      if (!this.spendEnergy(p, p.hand[i].energy || 0)) return false;
      p.discard.push(p.hand.splice(i, 1)[0]);
      return true;
    }
    return false;
  };

  Game.prototype.rollSignature = function (r) {
    var need = 3;
    if (r.gear && r.gear.id === "dummy") need = 2;
    this.log(r.name + " crows for " + r.special.name + " (need " + need + "+).");
    this.beginRoll({ diceN: 1, need: need, rerollMiss: false, attacker: r, purpose: "signature", label: r.special.name });
  };

  Game.prototype.finishSignature = function (ok) {
    var r = this.activeOf(this.cur());
    if (!ok) {
      this.log(r.special.name + " fails and is used up.");
      this.enterAttack();
      return;
    }
    this.log(r.special.name + " succeeds.");
    var key = r.special.key;
    if (key === "solar") {
      var self = this;
      this.living(this.opp()).forEach(function (enemy) { self.deal(enemy, 40, { attack: false }); });
      this.flushKos();
      if (this.winner) return;
      if (this.needsAnyPromote()) { this.resumeAt = "sig"; this.askNextPromote(); return; }
      this.enterAttack();
    } else if (key === "lastStand") {
      r.lastStandOn = this.turnId + 1;
      this.log(r.name + " will take no damage on the opponent's next turn.");
      this.enterAttack();
    } else if (key === "mother") {
      var self2 = this;
      this.living(this.cur()).forEach(function (mate) { self2.heal(mate, 60); });
      this.enterAttack();
    } else if (key === "midnight") {
      var self3 = this;
      var opts = this.living(this.opp()).filter(function (enemy) { return self3.remaining(enemy) <= 50; }).map(function (enemy) {
        return { id: "mid:" + enemy.uid, uid: enemy.uid, label: enemy.name + " (" + self3.remaining(enemy) + " HP)" };
      });
      if (!opts.length) { this.log("No enemy rooster has 50 HP or less."); this.enterAttack(); return; }
      if (opts.length === 1) { this.midnightKo(opts[0].uid); return; }
      this.ask(this.turn, "midnight", "Midnight Crow: knock out a rooster with 50 HP or less.", opts);
    } else if (key === "eye") {
      var list = [];
      this.living(this.opp()).forEach(function (enemy) {
        enemy.attacks.forEach(function (atk, idx) {
          list.push({ id: "copy:" + enemy.uid + ":" + idx, uid: enemy.uid, index: idx, label: enemy.name + " · " + atk.name });
        });
      });
      if (!list.length) { this.enterAttack(); return; }
      this.ask(this.turn, "eye", "Eye of the Storm: use an enemy attack for free.", list);
    }
  };

  Game.prototype.midnightKo = function (uid) {
    var t = this.findRooster(uid);
    if (t && !t.ko) {
      t.damage = this.maxHp(t);
      this.koQueuePush(t);
      this.flushKos();
    }
    if (this.winner) return;
    if (this.needsAnyPromote()) { this.resumeAt = "sig"; this.askNextPromote(); return; }
    this.enterAttack();
  };

  Game.prototype.endTurn = function () {
    if (this.winner) return;
    this.tickEnd();
    if (this.winner) return;
    if (this.needsAnyPromote()) { this.resumeAt = "turn"; this.askNextPromote(); return; }
    this.reallyEndTurn();
  };

  Game.prototype.tickEnd = function () {
    var self = this;
    this.players.forEach(function (p) {
      p.lineup.forEach(function (r) {
        if (r.ko || !r.burn) return;
        if (p.index !== self.turn) return;
        self.log("Burn ticks on " + r.name + ".");
        self.deal(r, 10, { attack: false });
      });
    });
    this.flushKos();
    this.peek = null;
  };

  Game.prototype.reallyEndTurn = function () {
    if (this.winner) return;
    this.turn = 1 - this.turn;
    this.beginTurn();
  };

  Game.prototype.onChoice = function (pending, opt) {
    var p = this.players[pending.player];
    if (pending.kind === "feed" || pending.kind === "hoarder") {
      if (opt.id !== "skip") {
        var rooster = this.findRooster(opt.uid);
        this.attachNamed(p, rooster, opt.card);
        if (pending.kind === "hoarder") p.hoarderUsed = true;
      }
      if (pending.kind === "feed") this.enterHoarder();
      else this.enterSupport();
      return;
    }
    if (pending.kind === "support") {
      if (opt.id === "done") { this.enterSwitch(); return; }
      this.tryPlay(p, opt.card);
      return;
    }
    if (pending.kind === "target") {
      var held = this.held;
      this.held = null;
      this.holdOrApply(this.players[held.player], held.card, opt.ref || opt);
      return;
    }
    if (pending.kind === "squawk") {
      var held2 = this.held;
      this.held = null;
      if (opt.id === "yes" && this.spendCounter(p, "squawk")) {
        this.players[held2.player].discard.push(held2.card);
        this.log(p.name + " cancels " + held2.card.name + " with Squawk Back.");
        if (!this.winner) this.enterSupport();
        return;
      }
      this.applySupport(this.players[held2.player], held2.card, held2.target);
      if (!this.pending && !this.winner) this.afterSupportPause();
      return;
    }
    if (pending.kind === "switch") {
      if (opt.id !== "stay") {
        var active = this.activeOf(p);
        var cost = this.retreatCost(active);
        this.spendGrain(active, cost);
        p.switched = true;
        this.swapActive(p, opt.uid, cost);
        this.flushKos();
      }
      if (this.winner) return;
      if (this.needsAnyPromote()) { this.resumeAt = "sig"; this.askNextPromote(); return; }
      this.enterSignature();
      return;
    }
    if (pending.kind === "signature") {
      if (opt.id === "skip") this.enterAttack();
      else this.declareSignature(p);
      return;
    }
    if (pending.kind === "hex") {
      if (opt.id === "yes" && this.spendCounter(p, "hexward")) {
        this.log("Hex Ward cancels the Signature. It is still used up.");
        this.enterAttack();
      } else this.rollSignature(this.activeOf(this.cur()));
      return;
    }
    if (pending.kind === "midnight") { this.midnightKo(opt.uid); return; }
    if (pending.kind === "eye") {
      var copied = this.findRooster(opt.uid);
      var atk = copied.attacks[opt.index];
      var actor = this.activeOf(this.cur());
      this.combat = { atk: atk, attacker: actor, defender: this.activeOf(this.opp()), fromSignature: true, hits: 0, crit: false, negated: false };
      this.log("Copies " + atk.name + " for free.");
      this.beginRoll({
        diceN: this.diceCount(actor, atk),
        need: this.threshold(actor, atk, this.combat.defender),
        rerollMiss: !!atk.rerollMiss,
        attacker: actor,
        purpose: "attack",
        label: atk.name
      });
      return;
    }
    if (pending.kind === "attack") {
      if (opt.id === "skip") this.endTurn();
      else this.startAttack(p, opt.index, false, this.activeOf(p));
      return;
    }
    if (pending.kind === "storm") {
      if (opt.id === "yes") {
        var miss = this.roll.dice.filter(function (d) { return d.value === 1 || (d.value < this.roll.spec.need && d.value !== 6); }, this)[0];
        var self = this;
        miss = this.roll.dice.filter(function (d) { return !self.isHit(d.value, self.roll.spec.need) && !d.rerolled; })[0];
        if (miss) {
          this.openRevealGroup();
          miss.value = this.d6();
          miss.rerolled = true;
          this.ownerOf(this.roll.spec.attacker).loftUsed = true;
          this.recordDie(miss.value, this.roll.spec.need, this.rollMode(this.roll.spec));
          this.log("Storm Loft rerolls to " + miss.value + ".");
        }
      }
      this.roll.stage = "lucky";
      this.advanceRoll();
      return;
    }
    if (pending.kind === "lucky") {
      if (opt.id === "yes") {
        var self2 = this;
        this.openRevealGroup();
        this.roll.dice.forEach(function (d) {
          if (!d.rerolled) {
            d.value = self2.d6();
            d.rerolled = true;
            self2.recordDie(d.value, self2.roll.spec.need, self2.rollMode(self2.roll.spec));
          }
        });
        this.ownerOf(this.roll.spec.attacker).feather = false;
        this.log("Lucky Feather rerolls: " + this.roll.dice.map(function (d) { return d.value; }).join(", ") + ".");
      } else this.ownerOf(this.roll.spec.attacker).feather = false;
      this.roll.stage = "scare";
      this.advanceRoll();
      return;
    }
    if (pending.kind === "scare") {
      if (opt.id === "yes") this.useScarecrow(p);
      this.roll.stage = "score";
      this.advanceRoll();
      return;
    }
    if (pending.kind === "lock") {
      if (opt.id === "yes") this.playLockdown(p);
      this.applyAttackDamage();
      return;
    }
    if (pending.kind === "rider") {
      if (opt.uid && opt.id.indexOf("heal:") === 0) this.heal(this.findRooster(opt.uid), 20);
      else if (opt.uid && opt.id.indexOf("gust:") === 0) this.swapActive(this.ownerOf(this.combat.defender), opt.uid, 0);
      else if (opt.uid) this.deal(this.findRooster(opt.uid), 20, { attack: true, attackerFlock: this.combat.attacker.flock });
      this.flushKos();
      if (this.winner) return;
      if (this.needsAnyPromote()) { this.resumeAt = "cleanup"; this.askNextPromote(); return; }
      this.attackCleanup();
      return;
    }
    if (pending.kind === "promote") {
      this.promote(p, opt.uid);
      this.askNextPromote();
      return;
    }
  };

  Game.prototype.pickAi = function (pending) {
    var self = this;
    var p = this.players[pending.player];
    var opts = pending.options;
    function find(prefix) { return opts.filter(function (o) { return o.id.indexOf(prefix) === 0; }); }
    if (pending.kind === "feed" || pending.kind === "hoarder") {
      var active = this.activeOf(p);
      var prefer = opts.filter(function (o) { return o.uid === active.uid; })[0];
      if (prefer && this.grainTotal(active) < 3) return prefer.id;
      var best = opts[0];
      var bestNeed = -1;
      opts.forEach(function (o) {
        if (o.id === "skip") return;
        var r = self.findRooster(o.uid);
        var costs = r.attacks.map(function (a) { return a.cost; });
        var unmet = 0;
        costs.forEach(function (c) { if (self.grainTotal(r) < c) unmet = Math.max(unmet, c - self.grainTotal(r)); });
        if (unmet > bestNeed) { bestNeed = unmet; best = o; }
      });
      return best.id;
    }
    if (pending.kind === "support") {
      if (p._supportPlays == null) p._supportPlays = 0;
      if (p._supportPlays >= 6) return "done";
      var want = ["phoenix", "ironroost", "stormloft", "thorn", "moonless", "horseshoe", "shield", "dummy", "trough", "root", "flame", "sunrise", "thanks", "frenzy", "feather", "scratch", "bell", "gust", "swap"];
      for (var w = 0; w < want.length; w++) {
        var hit = opts.filter(function (o) { return o.card === want[w]; })[0];
        if (!hit) continue;
        if (hit.card === "trough" && this.activeOf(p).damage < 30) continue;
        if (hit.card === "root" && !p.lineup.some(function (r) { return !r.ko && r.damage >= 40; })) continue;
        if (hit.card === "thanks" && (p.hand.length > 4 || p.deck.length < 1)) continue;
        if (hit.card === "sunrise") {
          var weak = this.living(this.players[1 - p.index]).some(function (r) { return self.remaining(r) <= 40; });
          if (!weak) continue;
        }
        if (hit.card === "flame") {
          var a = this.activeOf(p);
          if (!a.attacks.some(function (atk) { return self.grainTotal(a) >= atk.cost; })) continue;
        }
        if (hit.card === "feather") {
          var a2 = this.activeOf(p);
          if (!a2.attacks.some(function (atk) { return self.grainTotal(a2) >= atk.cost; })) continue;
        }
        p._supportPlays++;
        return hit.id;
      }
      return "done";
    }
    if (pending.kind === "target" || pending.kind === "rider" || pending.kind === "midnight" || pending.kind === "eye") {
      if (pending.kind === "eye") {
        var big = opts.slice().sort(function (a, b) { return b.label.length - a.label.length; })[0];
        return big.id;
      }
      if (pending.kind === "midnight" || (opts[0] && opts[0].label.indexOf("HP") >= 0)) {
        return opts[0].id;
      }
      return opts[0].id;
    }
    if (pending.kind === "switch") {
      var active2 = this.activeOf(p);
      var canHit = active2 && self.canAttackNow(active2) && active2.attacks.some(function (atk) { return self.grainTotal(active2) >= atk.cost + (active2.hexOn === self.turnId ? 1 : 0); });
      if (!canHit) {
        var ready = opts.filter(function (o) { return o.id.indexOf("switch:") === 0; }).filter(function (o) {
          var r = self.findRooster(o.uid);
          return r.special && r.special.key === "shortFuse" && r.attacks.some(function (atk) { return self.grainTotal(r) >= atk.cost; });
        })[0];
        if (ready) return ready.id;
      }
      if (active2 && this.remaining(active2) <= 25) {
        var tougher = opts.filter(function (o) { return o.id.indexOf("switch:") === 0 && self.remaining(self.findRooster(o.uid)) > self.remaining(active2); })[0];
        if (tougher) return tougher.id;
      }
      return "stay";
    }
    if (pending.kind === "signature") {
      var r = this.activeOf(p);
      if (r.special.key === "midnight" && this.living(this.oppOf(p)).some(function (e) { return self.remaining(e) <= 50; })) return "use";
      if (r.special.key === "solar" && this.living(this.oppOf(p)).length >= 2) return "use";
      if (r.special.key === "mother" && p.lineup.reduce(function (s, e) { return s + (e.ko ? 0 : e.damage); }, 0) >= 50) return "use";
      if (r.special.key === "lastStand" && this.remaining(r) <= 60) return "use";
      if (r.special.key === "eye") {
        var affordable = r.attacks.some(function (atk) { return self.grainTotal(r) >= atk.cost; });
        if (!affordable) return "use";
      }
      return "skip";
    }
    if (pending.kind === "attack") {
      var attacks = opts.filter(function (o) { return o.id.indexOf("atk:") === 0; });
      if (!attacks.length) return "skip";
      return attacks[attacks.length - 1].id;
    }
    if (pending.kind === "promote") {
      var best = opts[0];
      var hp = -1;
      opts.forEach(function (o) {
        var left = self.remaining(self.findRooster(o.uid));
        if (left > hp) { hp = left; best = o; }
      });
      return best.id;
    }
    if (pending.kind === "squawk") {
      if (!this.canAffordId(p, "squawk")) return "no";
      var name = pending.prompt;
      if (/Sunrise Crow|Midnight Scratch|Root and Rumble|Farmer's Thanks|Feed Frenzy|Flame Spur/.test(name)) return "yes";
      return "no";
    }
    if (pending.kind === "hex") return this.canAffordId(p, "hexward") ? "yes" : "no";
    if (pending.kind === "lock") return this.canAffordId(p, "lockdown") ? "yes" : "no";
    if (pending.kind === "scare") {
      if (!this.canAffordId(p, "scarecrow")) return "no";
      var vals = this.roll.dice.map(function (d) { return d.value; });
      if (vals.some(function (v) { return self.isHit(v, self.roll.spec.need); }) && vals.some(function (v) { return v !== 6; })) return "yes";
      return "no";
    }
    if (pending.kind === "storm" || pending.kind === "lucky") return "yes";
    return opts[0].id;
  };

  Game.prototype.oppOf = function (p) { return this.players[1 - p.index]; };

  Game.prototype.cardCount = function (p) {
    var n = p.deck.length + p.hand.length + p.discard.length + (p.coop ? 1 : 0);
    p.lineup.forEach(function (r) {
      n += r.grain.length;
      if (r.gear) n += 1;
    });
    return n;
  };

  function createGame(opts) { return new Game(opts); }

  function playAuto(opts, maxSteps) {
    var g = createGame(opts);
    var steps = 0;
    var cap = maxSteps || 4000;
    while (!g.winner && g.pending && steps < cap) {
      g.choose(g.pickAi(g.pending));
      steps++;
    }
    return { winner: g.winner, reason: g.winReason, steps: steps, log: g.logLines, stuck: !g.winner, game: g };
  }

  return { createGame: createGame, playAuto: playAuto, decks: CARDS.decks, CARDS: CARDS };
});
