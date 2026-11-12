/* Chicken genetics model for the chick calculator.
   Ordinary genes: each parent passes one of two alleles at random.
   Sex-linked genes (S, B, dw) sit on Z. Roosters are ZZ, hens are ZW.
   Daughters inherit the rooster's Z and the hen's W, so they express
   only the sire's allele. Sons inherit one Z from each parent.
   Loci are combined by multiplying independent Punnett probabilities.
   Brown eggshell is NOT a real single gene; Br is an on/off stand-in.
   Run checks with: node chicken-genetics/genetics.test.js
*/
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.ChickenGenetics = api;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this), function () {
  "use strict";

  var RANK = {
    R: 1, r: 2,
    P: 1, p: 2,
    E: 1, "e+": 2, eWh: 3,
    Co: 1, "co+": 2,
    S: 1, "s+": 2, W: 9,
    B: 1, "b+": 2,
    Bl: 1, "bl+": 2,
    I: 1, "i+": 2,
    "C+": 1, c: 2,
    O: 1, "o+": 2,
    Br: 1, br: 2,
    Cr: 1, "cr+": 2,
    Mb: 1, "mb+": 2,
    Pti: 1, "pti+": 2,
    F: 1, "f+": 2,
    "DW+": 1, dw: 2
  };

  var GROUP_ORDER = [
    { id: "comb", title: "Comb" },
    { id: "color", title: "Feather color" },
    { id: "egg", title: "Eggshell (daughters lay these)" },
    { id: "other", title: "Other traits" }
  ];

  function opt(a, b, label) {
    return { alleles: [a, b], label: label };
  }

  var LOCI = [
    {
      id: "R", group: "comb", name: "Rose comb (R)",
      options: [
        opt("R", "R", "R/R — rose (pure, passes rose)"),
        opt("R", "r", "R/r — rose (carries single)"),
        opt("r", "r", "r/r — not rose")
      ]
    },
    {
      id: "P", group: "comb", name: "Pea comb (P)",
      options: [
        opt("P", "P", "P/P — pea (pure, passes pea)"),
        opt("P", "p", "P/p — pea (carries single)"),
        opt("p", "p", "p/p — not pea")
      ]
    },
    {
      id: "E", group: "color", name: "Base color (E locus)",
      options: [
        opt("E", "E", "E/E — extended black"),
        opt("E", "e+", "E/e+ — extended black, carries duckwing"),
        opt("E", "eWh", "E/eWh — extended black, carries wheaten"),
        opt("e+", "e+", "e+/e+ — duckwing (wild type)"),
        opt("e+", "eWh", "e+/eWh — duckwing, carries wheaten"),
        opt("eWh", "eWh", "eWh/eWh — wheaten")
      ]
    },
    {
      id: "Co", group: "color", name: "Columbian (Co)",
      options: [
        opt("Co", "Co", "Co/Co — columbian (pure)"),
        opt("Co", "co+", "Co/co+ — columbian (carries non-columbian)"),
        opt("co+", "co+", "co+/co+ — not columbian")
      ]
    },
    {
      id: "S", group: "color", name: "Silver / gold (S, sex-linked)", sexLinked: true,
      optionsMale: [
        opt("S", "S", "S/S — silver (pure)"),
        opt("S", "s+", "S/s+ — silver (carries gold)"),
        opt("s+", "s+", "s+/s+ — gold")
      ],
      optionsFemale: [
        opt("S", "W", "S/W — silver"),
        opt("s+", "W", "s+/W — gold")
      ]
    },
    {
      id: "B", group: "color", name: "Barring (B, sex-linked)", sexLinked: true,
      optionsMale: [
        opt("B", "B", "B/B — barred, double dose (lighter)"),
        opt("B", "b+", "B/b+ — barred (carries non-barred)"),
        opt("b+", "b+", "b+/b+ — not barred")
      ],
      optionsFemale: [
        opt("B", "W", "B/W — barred"),
        opt("b+", "W", "b+/W — not barred")
      ]
    },
    {
      id: "Bl", group: "color", name: "Blue (Bl)",
      options: [
        opt("Bl", "Bl", "Bl/Bl — splash"),
        opt("Bl", "bl+", "Bl/bl+ — blue"),
        opt("bl+", "bl+", "bl+/bl+ — no blue (black pigment undiluted)")
      ]
    },
    {
      id: "I", group: "color", name: "Dominant white (I)",
      options: [
        opt("I", "I", "I/I — dominant white (pure)"),
        opt("I", "i+", "I/i+ — dominant white (flecks possible)"),
        opt("i+", "i+", "i+/i+ — not dominant white")
      ]
    },
    {
      id: "C", group: "color", name: "Recessive white (c)",
      options: [
        opt("C+", "C+", "C+/C+ — colored (not a carrier)"),
        opt("C+", "c", "C+/c — colored, carries recessive white"),
        opt("c", "c", "c/c — recessive white")
      ]
    },
    {
      id: "O", group: "egg", name: "Blue egg (O, oocyan)",
      options: [
        opt("O", "O", "O/O — blue egg gene (pure)"),
        opt("O", "o+", "O/o+ — blue egg gene (carries non-blue)"),
        opt("o+", "o+", "o+/o+ — no blue egg gene")
      ]
    },
    {
      id: "Br", group: "egg", name: "Brown egg (simplified)",
      options: [
        opt("Br", "Br", "Br/Br — brown (simplified, pure)"),
        opt("Br", "br", "Br/br — brown (simplified, carries non-brown)"),
        opt("br", "br", "br/br — no brown (white shell base)")
      ]
    },
    {
      id: "Cr", group: "other", name: "Crest (Cr)",
      options: [
        opt("Cr", "Cr", "Cr/Cr — full crest"),
        opt("Cr", "cr+", "Cr/cr+ — crest"),
        opt("cr+", "cr+", "cr+/cr+ — no crest")
      ]
    },
    {
      id: "Mb", group: "other", name: "Muffs and beard (Mb)",
      options: [
        opt("Mb", "Mb", "Mb/Mb — muffs and beard (fuller)"),
        opt("Mb", "mb+", "Mb/mb+ — muffs and beard"),
        opt("mb+", "mb+", "mb+/mb+ — clean face")
      ]
    },
    {
      id: "Pti", group: "other", name: "Feathered legs (Pti)",
      options: [
        opt("Pti", "Pti", "Pti/Pti — feathered legs (heavier)"),
        opt("Pti", "pti+", "Pti/pti+ — feathered legs"),
        opt("pti+", "pti+", "pti+/pti+ — clean legs")
      ]
    },
    {
      id: "F", group: "other", name: "Frizzle (F)",
      options: [
        opt("F", "F", "F/F — frazzle / curly (brittle feathers)"),
        opt("F", "f+", "F/f+ — frizzle"),
        opt("f+", "f+", "f+/f+ — smooth")
      ]
    },
    {
      id: "dw", group: "other", name: "Dwarf (dw, sex-linked)", sexLinked: true,
      optionsMale: [
        opt("DW+", "DW+", "DW+/DW+ — normal size"),
        opt("DW+", "dw", "DW+/dw — normal size (carries dwarf)"),
        opt("dw", "dw", "dw/dw — dwarf")
      ],
      optionsFemale: [
        opt("DW+", "W", "DW+/W — normal size"),
        opt("dw", "W", "dw/W — dwarf")
      ]
    }
  ];

  var BY_ID = {};
  LOCI.forEach(function (locus) { BY_ID[locus.id] = locus; });

  var PRESETS = [
    { id: "black", name: "Extended black" },
    { id: "blue", name: "Blue (on black)" },
    { id: "splash", name: "Splash (on black)" },
    { id: "duckwing", name: "Duckwing / wild type (gold)" },
    { id: "wheaten", name: "Wheaten (gold)" },
    { id: "columbian", name: "Columbian (gold)" },
    { id: "silver", name: "Silver duckwing" },
    { id: "barred", name: "Barred black" },
    { id: "domwhite", name: "Dominant white" },
    { id: "recwhite", name: "Recessive white" },
    { id: "single", name: "Single comb, extended black" },
    { id: "rose", name: "Rose comb" },
    { id: "pea", name: "Pea comb" },
    { id: "walnut", name: "Walnut comb" },
    { id: "crest", name: "Crest" },
    { id: "muffs", name: "Muffs and beard" },
    { id: "featherlegs", name: "Feathered legs" },
    { id: "frizzle", name: "Frizzle" },
    { id: "dwarf", name: "Dwarf" },
    { id: "blueegg", name: "Blue/cream eggs" },
    { id: "brownegg", name: "Brown eggs" },
    { id: "oliveegg", name: "Olive/green eggs" }
  ];

  var CAP = 80000;

  function canon(a, b) {
    if (a === "W") return b + "/W";
    if (b === "W") return a + "/W";
    var ra = RANK[a];
    var rb = RANK[b];
    if (ra == null || rb == null) throw new Error("Unknown allele " + a + " / " + b);
    if (ra < rb) return a + "/" + b;
    if (rb < ra) return b + "/" + a;
    return a <= b ? a + "/" + b : b + "/" + a;
  }

  function keyFromAlleles(pair) {
    return canon(pair[0], pair[1]);
  }

  function hasAllele(gt, allele) {
    var parts = gt.split("/");
    return parts[0] === allele || parts[1] === allele;
  }

  function countAllele(gt, allele) {
    var parts = gt.split("/");
    var n = 0;
    if (parts[0] === allele) n += 1;
    if (parts[1] === allele) n += 1;
    return n;
  }

  function asPair(value) {
    if (Array.isArray(value)) return [value[0], value[1]];
    var parts = String(value).split("/");
    return [parts[0], parts[1]];
  }

  function normalize(gt, sex) {
    var out = {};
    LOCI.forEach(function (locus) {
      if (!gt || gt[locus.id] == null) throw new Error("Missing " + locus.id);
      var pair = asPair(gt[locus.id]);
      if (locus.sexLinked && sex === "female") {
        var z = pair[0] === "W" ? pair[1] : pair[0];
        out[locus.id] = [z, "W"];
      } else {
        out[locus.id] = [pair[0], pair[1]];
      }
    });
    return out;
  }

  function gametes(pair) {
    if (pair[0] === "W") return [{ allele: pair[1], p: 1 }];
    if (pair[1] === "W" || pair[0] === pair[1]) return [{ allele: pair[0], p: 1 }];
    return [{ allele: pair[0], p: 0.5 }, { allele: pair[1], p: 0.5 }];
  }

  function locusDist(id, sire, dam, sex) {
    var locus = BY_ID[id];
    var sg = gametes(sire[id]);
    var dist = Object.create(null);
    if (locus.sexLinked) {
      if (sex === "male") {
        var dz = dam[id][0];
        sg.forEach(function (g) {
          var key = canon(g.allele, dz);
          dist[key] = (dist[key] || 0) + g.p;
        });
      } else {
        sg.forEach(function (g) {
          var key = canon(g.allele, "W");
          dist[key] = (dist[key] || 0) + g.p;
        });
      }
      return dist;
    }
    var dg = gametes(dam[id]);
    sg.forEach(function (a) {
      dg.forEach(function (b) {
        var key = canon(a.allele, b.allele);
        dist[key] = (dist[key] || 0) + a.p * b.p;
      });
    });
    return dist;
  }

  function baseline(sex) {
    var male = sex === "male";
    return {
      R: ["r", "r"],
      P: ["p", "p"],
      E: ["E", "E"],
      Co: ["co+", "co+"],
      S: male ? ["s+", "s+"] : ["s+", "W"],
      B: male ? ["b+", "b+"] : ["b+", "W"],
      Bl: ["bl+", "bl+"],
      I: ["i+", "i+"],
      C: ["C+", "C+"],
      O: ["o+", "o+"],
      Br: ["br", "br"],
      Cr: ["cr+", "cr+"],
      Mb: ["mb+", "mb+"],
      Pti: ["pti+", "pti+"],
      F: ["f+", "f+"],
      dw: male ? ["DW+", "DW+"] : ["DW+", "W"]
    };
  }

  function makeBird(sex, overrides) {
    var gt = baseline(sex);
    var src = overrides || {};
    Object.keys(src).forEach(function (key) { gt[key] = src[key]; });
    return gt;
  }

  function applyPreset(id, sex) {
    var gt = baseline(sex);
    var male = sex === "male";
    if (id === "black" || id === "single") {
      gt.E = ["E", "E"];
    } else if (id === "blue") {
      gt.E = ["E", "E"];
      gt.Bl = ["Bl", "bl+"];
    } else if (id === "splash") {
      gt.E = ["E", "E"];
      gt.Bl = ["Bl", "Bl"];
    } else if (id === "duckwing") {
      gt.E = ["e+", "e+"];
    } else if (id === "wheaten") {
      gt.E = ["eWh", "eWh"];
    } else if (id === "columbian") {
      gt.E = ["e+", "e+"];
      gt.Co = ["Co", "co+"];
    } else if (id === "silver") {
      gt.E = ["e+", "e+"];
      gt.S = male ? ["S", "s+"] : ["S", "W"];
    } else if (id === "barred") {
      gt.E = ["E", "E"];
      gt.B = male ? ["B", "b+"] : ["B", "W"];
    } else if (id === "domwhite") {
      gt.I = ["I", "i+"];
    } else if (id === "recwhite") {
      gt.C = ["c", "c"];
    } else if (id === "rose") {
      gt.R = ["R", "r"];
    } else if (id === "pea") {
      gt.P = ["P", "p"];
    } else if (id === "walnut") {
      gt.R = ["R", "r"];
      gt.P = ["P", "p"];
    } else if (id === "crest") {
      gt.Cr = ["Cr", "cr+"];
    } else if (id === "muffs") {
      gt.Mb = ["Mb", "mb+"];
    } else if (id === "featherlegs") {
      gt.Pti = ["Pti", "pti+"];
    } else if (id === "frizzle") {
      gt.F = ["F", "f+"];
    } else if (id === "dwarf") {
      gt.dw = male ? ["dw", "dw"] : ["dw", "W"];
    } else if (id === "blueegg") {
      gt.O = ["O", "o+"];
    } else if (id === "brownegg") {
      gt.Br = ["Br", "br"];
    } else if (id === "oliveegg") {
      gt.O = ["O", "o+"];
      gt.Br = ["Br", "br"];
    } else {
      throw new Error("Unknown preset " + id);
    }
    return gt;
  }

  function colorDescribe(gt) {
    var ext = hasAllele(gt.E, "E");
    var duck = hasAllele(gt.E, "e+");
    var wheat = !ext && !duck;
    var co = hasAllele(gt.Co, "Co");
    var blN = countAllele(gt.Bl, "Bl");
    var silver = hasAllele(gt.S, "S");
    var barN = countAllele(gt.B, "B");
    var iN = countAllele(gt.I, "I");
    var recWhite = gt.C === "c/c";
    var base = ext ? "black" : (wheat && co) ? "columbian-wheaten" : co ? "columbian" : wheat ? "wheaten" : "duckwing";
    var dilution = blN >= 2 ? "splash" : blN === 1 ? "blue" : "black";
    var metal = silver ? "silver" : "gold";
    var barring = barN >= 2 ? "double-barred" : barN === 1 ? "barred" : "none";
    var prefix = barring === "none" ? "" : barring + " ";
    var body;
    if (ext) {
      body = dilution === "black" ? "black" : dilution;
      if (co) body += " (Co carried)";
    } else {
      var ground = base === "columbian-wheaten" ? "columbian (wheaten ground)"
        : base === "columbian" ? "columbian"
        : base === "wheaten" ? "wheaten"
        : "duckwing";
      body = (dilution === "black" ? "" : dilution + " ") + ground;
    }
    var shown = prefix + body + ", " + metal;
    var white = "none";
    if (iN && recWhite) {
      white = "both";
      shown = "white (dominant white and recessive white, hides " + shown + ")";
    } else if (iN >= 2) {
      white = "dominant";
      shown = "dominant white (hides " + shown + ")";
    } else if (iN === 1) {
      white = "dominant";
      shown = "dominant white, flecks possible (hides " + shown + ")";
    } else if (recWhite) {
      white = "recessive";
      shown = "recessive white (hides " + shown + ")";
    }
    return {
      label: shown,
      name: shown,
      tags: { base: base, dilution: dilution, silver: metal, barring: barring, white: white }
    };
  }

  function combKind(rGt, pGt) {
    var rose = hasAllele(rGt, "R");
    var pea = hasAllele(pGt, "P");
    if (rose && pea) return "walnut";
    if (rose) return "rose";
    if (pea) return "pea";
    return "single";
  }

  function combDescribe(rGt, pGt) {
    var kind = combKind(rGt, pGt);
    var label = kind + " comb";
    return { label: label, name: label, tags: { comb: kind } };
  }

  function eggKind(oGt, brGt) {
    var blue = hasAllele(oGt, "O");
    var brown = hasAllele(brGt, "Br");
    if (blue && brown) return "olive";
    if (blue) return "blue";
    if (brown) return "brown";
    return "white";
  }

  function eggLabel(kind) {
    if (kind === "olive") return "olive/green eggs";
    if (kind === "blue") return "blue/cream eggs";
    if (kind === "brown") return "brown eggs";
    return "white eggs";
  }

  function eggDescribe(oGt, brGt) {
    var kind = eggKind(oGt, brGt);
    var label = eggLabel(kind);
    return { label: label, name: label, tags: { egg: kind } };
  }

  function crestDescribe(gt) {
    var n = countAllele(gt, "Cr");
    if (n >= 2) return { label: "full crest", name: "full crest", tags: { crest: "full" } };
    if (n === 1) return { label: "crest", name: "crest", tags: { crest: "crest" } };
    return { label: "", name: "no crest", tags: { crest: "none" } };
  }

  function muffsDescribe(gt) {
    if (hasAllele(gt, "Mb")) return { label: "muffs and beard", name: "muffs and beard", tags: { muffs: "muffs" } };
    return { label: "", name: "clean face", tags: { muffs: "none" } };
  }

  function legsDescribe(gt) {
    if (hasAllele(gt, "Pti")) return { label: "feathered legs", name: "feathered legs", tags: { legs: "feathered" } };
    return { label: "", name: "clean legs", tags: { legs: "clean" } };
  }

  function frizzleDescribe(gt) {
    var n = countAllele(gt, "F");
    if (n >= 2) return { label: "frazzle (extreme frizzle)", name: "frazzle (extreme frizzle)", tags: { frizzle: "frazzle" } };
    if (n === 1) return { label: "frizzle", name: "frizzle", tags: { frizzle: "frizzle" } };
    return { label: "", name: "smooth", tags: { frizzle: "none" } };
  }

  function dwarfOn(gt, sex) {
    if (sex === "female") return gt === "dw/W";
    var parts = gt.split("/");
    return parts[0] === "dw" && parts[1] === "dw";
  }

  function dwarfDescribe(gt, sex) {
    if (dwarfOn(gt, sex)) return { label: "dwarf", name: "dwarf", tags: { dwarf: "dwarf" } };
    return { label: "", name: "normal size", tags: { dwarf: "normal" } };
  }

  function meaning(id, gt, sex) {
    var map = {
      R: { "R/R": "rose (pure)", "R/r": "rose (carries single)", "r/r": "not rose" },
      P: { "P/P": "pea (pure)", "P/p": "pea (carries single)", "p/p": "not pea" },
      E: {
        "E/E": "extended black",
        "E/e+": "extended black, carries duckwing",
        "E/eWh": "extended black, carries wheaten",
        "e+/e+": "duckwing (wild type)",
        "e+/eWh": "duckwing, carries wheaten",
        "eWh/eWh": "wheaten"
      },
      Co: { "Co/Co": "columbian (pure)", "Co/co+": "columbian (carries non-columbian)", "co+/co+": "not columbian" },
      Bl: { "Bl/Bl": "splash", "Bl/bl+": "blue", "bl+/bl+": "black (no blue dilution)" },
      I: { "I/I": "dominant white (pure)", "I/i+": "dominant white (flecks possible)", "i+/i+": "not dominant white" },
      C: { "C+/C+": "not recessive white", "C+/c": "colored, carries recessive white", "c/c": "recessive white" },
      O: { "O/O": "blue egg gene (pure)", "O/o+": "blue egg gene (carries non-blue)", "o+/o+": "no blue egg gene" },
      Br: { "Br/Br": "brown shell (simplified, pure)", "Br/br": "brown shell (simplified, carries non-brown)", "br/br": "no brown (white shell base)" },
      Cr: { "Cr/Cr": "full crest", "Cr/cr+": "crest", "cr+/cr+": "no crest" },
      Mb: { "Mb/Mb": "muffs and beard (fuller)", "Mb/mb+": "muffs and beard", "mb+/mb+": "clean face" },
      Pti: { "Pti/Pti": "feathered legs (heavier)", "Pti/pti+": "feathered legs", "pti+/pti+": "clean legs" },
      F: { "F/F": "frazzle / curly (brittle feathers)", "F/f+": "frizzle", "f+/f+": "smooth" }
    };
    if (id === "S") {
      if (gt === "S/S") return "silver (pure)";
      if (gt === "S/s+") return "silver (carries gold)";
      if (gt === "s+/s+") return "gold";
      if (gt === "S/W") return "silver";
      if (gt === "s+/W") return "gold";
    }
    if (id === "B") {
      if (gt === "B/B") return "double-barred (lighter)";
      if (gt === "B/b+") return "barred (one dose)";
      if (gt === "b+/b+") return "not barred";
      if (gt === "B/W") return "barred";
      if (gt === "b+/W") return "not barred";
    }
    if (id === "dw") {
      if (gt === "DW+/DW+") return "normal size";
      if (gt === "DW+/dw") return "normal size (carries dwarf)";
      if (gt === "dw/dw") return "dwarf";
      if (gt === "DW+/W") return "normal size";
      if (gt === "dw/W") return "dwarf";
    }
    if (map[id] && map[id][gt]) return map[id][gt];
    return gt;
  }

  function expandIds(ids, sire, dam, sex) {
    var states = [{ p: 1, gt: {} }];
    ids.forEach(function (id) {
      var dist = locusDist(id, sire, dam, sex);
      var keys = Object.keys(dist);
      var next = [];
      states.forEach(function (st) {
        keys.forEach(function (key) {
          var gt = {};
          var k;
          for (k in st.gt) gt[k] = st.gt[k];
          gt[id] = key;
          next.push({ p: st.p * dist[key], gt: gt });
        });
      });
      states = next;
    });
    return states;
  }

  function mergeItems(items) {
    var map = Object.create(null);
    var order = [];
    items.forEach(function (it) {
      var key = it.label + "\n" + JSON.stringify(it.tags);
      if (!map[key]) {
        map[key] = { label: it.label, name: it.name, p: 0, tags: it.tags };
        order.push(key);
      }
      map[key].p += it.p;
    });
    return order.map(function (key) { return map[key]; });
  }

  function tagged(described, p) {
    return { label: described.label, name: described.name, p: p, tags: described.tags };
  }

  function colorItems(sire, dam, sex) {
    var items = expandIds(["E", "Co", "Bl", "S", "B", "I", "C"], sire, dam, sex).map(function (st) {
      return tagged(colorDescribe(st.gt), st.p);
    });
    return mergeItems(items);
  }

  function combItems(sire, dam, sex) {
    var items = expandIds(["R", "P"], sire, dam, sex).map(function (st) {
      return tagged(combDescribe(st.gt.R, st.gt.P), st.p);
    });
    return mergeItems(items);
  }

  function eggItems(sire, dam, sex) {
    var items = expandIds(["O", "Br"], sire, dam, sex).map(function (st) {
      return tagged(eggDescribe(st.gt.O, st.gt.Br), st.p);
    });
    return mergeItems(items);
  }

  function simpleItems(id, sire, dam, sex, describeFn) {
    var dist = locusDist(id, sire, dam, sex);
    var items = [];
    Object.keys(dist).forEach(function (gt) {
      items.push(tagged(describeFn(gt, sex), dist[gt]));
    });
    return mergeItems(items);
  }

  function multiply(states, items) {
    var next = [];
    states.forEach(function (st) {
      items.forEach(function (it) {
        var tags = {};
        var k;
        for (k in st.tags) tags[k] = st.tags[k];
        for (k in it.tags) tags[k] = it.tags[k];
        var label = st.label;
        if (it.label) label = label ? label + ", " + it.label : it.label;
        next.push({ label: label, name: label, p: st.p * it.p, tags: tags });
      });
    });
    return mergeItems(next);
  }

  function sortOutcomes(items) {
    items.sort(function (a, b) {
      if (b.p !== a.p) return b.p - a.p;
      if (a.label < b.label) return -1;
      if (a.label > b.label) return 1;
      return 0;
    });
    return items;
  }

  function buildSex(sire, dam, sex) {
    var groups = [
      { id: "color", title: "Color", items: colorItems(sire, dam, sex) },
      { id: "comb", title: "Comb", items: combItems(sire, dam, sex) }
    ];
    if (sex === "female") groups.push({ id: "egg", title: "Eggshell", items: eggItems(sire, dam, sex) });
    groups.push({ id: "dw", title: "Dwarf", items: simpleItems("dw", sire, dam, sex, dwarfDescribe) });
    groups.push({ id: "F", title: "Frizzle", items: simpleItems("F", sire, dam, sex, frizzleDescribe) });
    groups.push({ id: "Cr", title: "Crest", items: simpleItems("Cr", sire, dam, sex, crestDescribe) });
    groups.push({ id: "Mb", title: "Muffs and beard", items: simpleItems("Mb", sire, dam, sex, muffsDescribe) });
    groups.push({ id: "Pti", title: "Feathered legs", items: simpleItems("Pti", sire, dam, sex, legsDescribe) });

    var states = [{ label: "", name: "", p: 1, tags: {} }];
    var sidelined = [];
    groups.forEach(function (group) {
      var useful = group.items.filter(function (it) { return it.p > 0; });
      if (states.length > 1 && useful.length > 1 && states.length * useful.length > CAP) {
        sidelined.push({ id: group.id, title: group.title, items: sortOutcomes(useful.slice()) });
        return;
      }
      states = multiply(states, useful);
    });
    return { outcomes: sortOutcomes(states), sidelined: sidelined };
  }

  function sumDist(dist, pred) {
    var s = 0;
    Object.keys(dist).forEach(function (gt) {
      if (pred(gt)) s += dist[gt];
    });
    return s;
  }

  function foldKinds(distA, distB, kindFn) {
    var out = Object.create(null);
    Object.keys(distA).forEach(function (a) {
      Object.keys(distB).forEach(function (b) {
        var key = kindFn(a, b);
        out[key] = (out[key] || 0) + distA[a] * distB[b];
      });
    });
    return out;
  }

  function blueKind(gt) {
    var n = countAllele(gt, "Bl");
    if (n >= 2) return "splash";
    if (n === 1) return "blue";
    return "black";
  }

  function silverKind(gt) {
    return hasAllele(gt, "S") ? "silver" : "gold";
  }

  function barringKind(gt) {
    var n = countAllele(gt, "B");
    if (n >= 2) return "double-barred";
    if (n === 1) return "barred";
    return "none";
  }

  function formatPct(x) {
    if (typeof x !== "number" || !isFinite(x)) return "0%";
    if (Math.abs(x - 1) < 1e-9) return "100%";
    if (Math.abs(x) < 1e-12) return "0%";
    var n = x * 100;
    var r = Math.round(n * 100) / 100;
    if (Math.abs(r - Math.round(r)) < 1e-9) return String(Math.round(r)) + "%";
    var s = r.toFixed(2);
    if (s.charAt(s.length - 1) === "0") s = r.toFixed(1);
    return s + "%";
  }

  function sexLinkPunnett(id, sire, dam) {
    var rows = gametes(sire[id]).map(function (g) {
      var sonGt = canon(g.allele, dam[id][0]);
      var daughterGt = canon(g.allele, "W");
      return {
        allele: g.allele,
        p: g.p,
        sonGt: sonGt,
        sonLook: meaning(id, sonGt, "male"),
        daughterGt: daughterGt,
        daughterLook: meaning(id, daughterGt, "female")
      };
    });
    return { id: id, name: BY_ID[id].name, damAllele: dam[id][0], rows: rows };
  }

  function buildNotes(sire, dam, marginals) {
    var notes = [];
    var ff = marginals.loci.F.both["F/F"] || 0;
    if (ff > 0) {
      notes.push({
        level: "warn",
        text: formatPct(ff) + " of chicks are F/F, called frazzle or curly. Those feathers are brittle and over-curled. Breed a frizzle (F/f+) to a smooth bird (f+/f+) to avoid frazzle chicks."
      });
    }
    var silverMale = sumDist(marginals.loci.S.male, function (gt) { return silverKind(gt) === "silver"; });
    var silverFemale = sumDist(marginals.loci.S.female, function (gt) { return silverKind(gt) === "silver"; });
    var barMale = sumDist(marginals.loci.B.male, function (gt) { return barringKind(gt) !== "none"; });
    var barFemale = sumDist(marginals.loci.B.female, function (gt) { return barringKind(gt) !== "none"; });
    var dwarfMale = sumDist(marginals.loci.dw.male, function (gt) { return dwarfOn(gt, "male"); });
    var dwarfFemale = sumDist(marginals.loci.dw.female, function (gt) { return dwarfOn(gt, "female"); });
    var splits = [];
    if (Math.abs(silverMale - silverFemale) > 1e-9) splits.push("silver/gold");
    if (Math.abs(barMale - barFemale) > 1e-9) splits.push("barring");
    if (Math.abs(dwarfMale - dwarfFemale) > 1e-9) splits.push("dwarf");
    if (splits.length) {
      notes.push({
        level: "note",
        text: "Sex-link on " + splits.join(", ") + ". Daughters show the allele they get from the rooster. Sons also receive the hen's Z, so the sexes do not match."
      });
    }
    var bb = marginals.loci.B.male["B/B"] || 0;
    if (bb > 0) {
      notes.push({
        level: "note",
        text: formatPct(bb) + " of sons are B/B, double-barred and lighter than one dose of barring. Daughters have only one Z, so they cannot be double-barred."
      });
    }
    var hetI = marginals.loci.I.both["I/i+"] || 0;
    if (hetI > 0) {
      notes.push({
        level: "note",
        text: "Dominant white with one copy (I/i+, " + formatPct(hetI) + " of chicks) can show small colored flecks. Two copies (I/I) are a cleaner white."
      });
    }
    var crcr = marginals.loci.Cr.both["Cr/Cr"] || 0;
    if (crcr > 0) {
      notes.push({
        level: "note",
        text: formatPct(crcr) + " of chicks are Cr/Cr, a fuller crest than one copy. Some crested breeds also have a vaulted skull. That is not given a percent here."
      });
    }
    var sireBr = canon(sire.Br[0], sire.Br[1]);
    var damBr = canon(dam.Br[0], dam.Br[1]);
    if (hasAllele(sireBr, "Br") || hasAllele(damBr, "Br")) {
      notes.push({
        level: "note",
        text: "Brown eggshell is polygenic. This calculator treats brown as one on/off switch, so brown and olive/green are yes or no, not a shade from tinted to dark."
      });
    }
    var sireDw = canon(sire.dw[0], sire.dw[1]);
    var damDw = canon(dam.dw[0], dam.dw[1]);
    if (hasAllele(sireDw, "dw") || hasAllele(damDw, "dw")) {
      notes.push({
        level: "note",
        text: "Dwarf (dw) is a sex-linked recessive. Sons are dwarf only with dw/dw. Daughters are dwarf when the rooster gives them dw. A normal-sized son can still carry dw."
      });
    }
    return notes;
  }

  function cross(sireIn, damIn) {
    var sire = normalize(sireIn, "male");
    var dam = normalize(damIn, "female");
    var male = buildSex(sire, dam, "male");
    var female = buildSex(sire, dam, "female");
    var loci = {};
    LOCI.forEach(function (locus) {
      if (locus.sexLinked) {
        loci[locus.id] = {
          sexLinked: true,
          male: locusDist(locus.id, sire, dam, "male"),
          female: locusDist(locus.id, sire, dam, "female")
        };
      } else {
        loci[locus.id] = { sexLinked: false, both: locusDist(locus.id, sire, dam, "male") };
      }
    });
    var marginals = {
      comb: foldKinds(loci.R.both, loci.P.both, combKind),
      blue: (function () {
        var out = { black: 0, blue: 0, splash: 0 };
        Object.keys(loci.Bl.both).forEach(function (gt) { out[blueKind(gt)] += loci.Bl.both[gt]; });
        return out;
      })(),
      silver: {
        male: { silver: sumDist(loci.S.male, function (gt) { return silverKind(gt) === "silver"; }), gold: sumDist(loci.S.male, function (gt) { return silverKind(gt) === "gold"; }) },
        female: { silver: sumDist(loci.S.female, function (gt) { return silverKind(gt) === "silver"; }), gold: sumDist(loci.S.female, function (gt) { return silverKind(gt) === "gold"; }) }
      },
      barring: {
        male: foldBarr(loci.B.male),
        female: foldBarr(loci.B.female)
      },
      egg: foldKinds(loci.O.both, loci.Br.both, eggKind),
      loci: loci
    };
    return {
      male: male,
      female: female,
      marginals: marginals,
      punnett: {
        S: sexLinkPunnett("S", sire, dam),
        B: sexLinkPunnett("B", sire, dam),
        dw: sexLinkPunnett("dw", sire, dam)
      },
      notes: buildNotes(sire, dam, marginals),
      sire: describeBird(sire, "male"),
      dam: describeBird(dam, "female")
    };
  }

  function foldBarr(dist) {
    var out = { "double-barred": 0, barred: 0, none: 0 };
    Object.keys(dist).forEach(function (gt) { out[barringKind(gt)] += dist[gt]; });
    return out;
  }

  function labelFromKeyed(gt, sex) {
    var color = colorDescribe(gt);
    var comb = combDescribe(gt.R, gt.P);
    var extras = [crestDescribe(gt.Cr), muffsDescribe(gt.Mb), legsDescribe(gt.Pti), frizzleDescribe(gt.F), dwarfDescribe(gt.dw, sex)];
    var tags = {};
    var k;
    for (k in color.tags) tags[k] = color.tags[k];
    for (k in comb.tags) tags[k] = comb.tags[k];
    var parts = [color.label, comb.label];
    extras.forEach(function (extra) {
      for (k in extra.tags) tags[k] = extra.tags[k];
      if (extra.label) parts.push(extra.label);
    });
    if (sex === "female") {
      var egg = eggDescribe(gt.O, gt.Br);
      tags.egg = egg.tags.egg;
      parts.push(egg.label);
    }
    return { label: parts.join(", "), tags: tags };
  }

  function describeBird(gt, sex) {
    var bird = normalize(gt, sex);
    var keyed = {};
    LOCI.forEach(function (locus) {
      keyed[locus.id] = canon(bird[locus.id][0], bird[locus.id][1]);
    });
    return labelFromKeyed(keyed, sex);
  }

  function lociFor(sex) {
    return LOCI.map(function (locus) {
      var options = locus.sexLinked ? (sex === "male" ? locus.optionsMale : locus.optionsFemale) : locus.options;
      return {
        id: locus.id,
        group: locus.group,
        name: locus.name,
        sexLinked: !!locus.sexLinked,
        options: options.map(function (o) {
          return { value: canon(o.alleles[0], o.alleles[1]), label: o.label };
        })
      };
    });
  }

  function share(outcomes, pred) {
    var s = 0;
    outcomes.forEach(function (o) { if (pred(o)) s += o.p; });
    return s;
  }

  function sumP(outcomes) {
    return share(outcomes, function () { return true; });
  }

  function near(actual, expected) {
    return typeof actual === "number" && Math.abs(actual - expected) <= 1e-9;
  }

  function selfCheck() {
    var checks = [];
    function check(name, ok, detail) {
      checks.push({ name: name, ok: !!ok, detail: detail || "" });
    }

    var roseSire = makeBird("male", { R: ["R", "R"], P: ["p", "p"] });
    var peaDam = makeBird("female", { R: ["r", "r"], P: ["P", "P"] });
    var rosePea = cross(roseSire, peaDam);
    check(
      "rose x pea (RRpp x rrPP) = 100% walnut",
      near(rosePea.marginals.comb.walnut, 1) &&
        near(share(rosePea.male.outcomes, function (o) { return o.tags.comb === "walnut"; }), 1) &&
        near(share(rosePea.female.outcomes, function (o) { return o.tags.comb === "walnut"; }), 1),
      "walnut " + formatPct(rosePea.marginals.comb.walnut) + " of sons and of daughters"
    );

    var walnutSire = makeBird("male", { R: ["R", "r"], P: ["P", "p"] });
    var walnutDam = makeBird("female", { R: ["R", "r"], P: ["P", "p"] });
    var walnut = cross(walnutSire, walnutDam);
    var comb = walnut.marginals.comb;
    check(
      "walnut het x walnut het = 9:3:3:1",
      near(comb.walnut, 9 / 16) && near(comb.rose, 3 / 16) && near(comb.pea, 3 / 16) && near(comb.single, 1 / 16),
      "walnut " + formatPct(comb.walnut) + ", rose " + formatPct(comb.rose) + ", pea " + formatPct(comb.pea) + ", single " + formatPct(comb.single)
    );

    var silverSire = makeBird("male", { S: ["S", "S"] });
    var goldDam = makeBird("female", { S: ["s+", "W"] });
    var allSilver = cross(silverSire, goldDam);
    check(
      "silver rooster (S/S) x gold hen (s+/W) = all chicks silver",
      near(allSilver.marginals.silver.male.silver, 1) && near(allSilver.marginals.silver.female.silver, 1),
      "sons silver " + formatPct(allSilver.marginals.silver.male.silver) + ", daughters silver " + formatPct(allSilver.marginals.silver.female.silver)
    );

    var goldSire = makeBird("male", { E: ["e+", "e+"], S: ["s+", "s+"] });
    var silverDam = makeBird("female", { E: ["e+", "e+"], S: ["S", "W"] });
    var sexLink = cross(goldSire, silverDam);
    check(
      "gold rooster x silver hen = sex-link (males silver, females gold)",
      near(sexLink.marginals.silver.male.silver, 1) &&
        near(sexLink.marginals.silver.male.gold, 0) &&
        near(sexLink.marginals.silver.female.gold, 1) &&
        near(sexLink.marginals.silver.female.silver, 0) &&
        near(share(sexLink.male.outcomes, function (o) { return o.tags.silver === "silver" && o.tags.base === "duckwing"; }), 1) &&
        near(share(sexLink.female.outcomes, function (o) { return o.tags.silver === "gold" && o.tags.base === "duckwing"; }), 1),
      "sons silver " + formatPct(sexLink.marginals.silver.male.silver) + ", daughters gold " + formatPct(sexLink.marginals.silver.female.gold)
    );

    var blueSire = makeBird("male", { Bl: ["Bl", "bl+"] });
    var blueDam = makeBird("female", { Bl: ["Bl", "bl+"] });
    var blue = cross(blueSire, blueDam);
    check(
      "blue x blue = 25% black / 50% blue / 25% splash",
      near(blue.marginals.blue.black, 0.25) && near(blue.marginals.blue.blue, 0.5) && near(blue.marginals.blue.splash, 0.25) &&
        near(share(blue.male.outcomes, function (o) { return o.tags.dilution === "black" && o.tags.base === "black" && o.tags.white === "none"; }), 0.25) &&
        near(share(blue.male.outcomes, function (o) { return o.tags.dilution === "blue"; }), 0.5) &&
        near(share(blue.male.outcomes, function (o) { return o.tags.dilution === "splash"; }), 0.25) &&
        near(share(blue.female.outcomes, function (o) { return o.tags.dilution === "splash"; }), 0.25),
      "black " + formatPct(blue.marginals.blue.black) + ", blue " + formatPct(blue.marginals.blue.blue) + ", splash " + formatPct(blue.marginals.blue.splash)
    );

    var mixSire = makeBird("male", { R: ["R", "r"], Bl: ["Bl", "bl+"] });
    var mixDam = makeBird("female", { R: ["r", "r"], Bl: ["Bl", "bl+"] });
    var mix = cross(mixSire, mixDam);
    check(
      "loci multiply: half rose x half blue = 25% rose and blue",
      near(share(mix.male.outcomes, function (o) { return o.tags.comb === "rose" && o.tags.dilution === "blue"; }), 0.25) &&
        near(share(mix.female.outcomes, function (o) { return o.tags.comb === "single" && o.tags.dilution === "black"; }), 0.125),
      "rose+blue " + formatPct(share(mix.male.outcomes, function (o) { return o.tags.comb === "rose" && o.tags.dilution === "blue"; }))
    );

    var barSire = makeBird("male", { B: ["B", "b+"] });
    var barDam = makeBird("female", { B: ["B", "W"] });
    var bars = cross(barSire, barDam);
    check(
      "barring dosage: B/b+ male x B/W hen gives 50% double-barred sons",
      near(bars.marginals.loci.B.male["B/B"], 0.5) &&
        near(bars.marginals.loci.B.male["B/b+"], 0.5) &&
        near(bars.marginals.loci.B.female["B/W"], 0.5) &&
        near(bars.marginals.loci.B.female["b+/W"], 0.5) &&
        near(bars.marginals.barring.female["double-barred"], 0),
      "sons B/B " + formatPct(bars.marginals.loci.B.male["B/B"] || 0) + ", daughters not barred " + formatPct(bars.marginals.loci.B.female["b+/W"] || 0)
    );

    var pureBar = cross(makeBird("male", { B: ["B", "B"] }), makeBird("female", { B: ["b+", "W"] }));
    check(
      "B/B rooster x non-barred hen: every chick barred, sons are one dose",
      near(pureBar.marginals.loci.B.male["B/b+"], 1) && near(pureBar.marginals.loci.B.female["B/W"], 1),
      "sons B/b+ " + formatPct(pureBar.marginals.loci.B.male["B/b+"] || 0)
    );

    var classicBar = cross(makeBird("male", { B: ["b+", "b+"] }), makeBird("female", { B: ["B", "W"] }));
    check(
      "non-barred rooster x barred hen: sons barred, daughters not",
      near(classicBar.marginals.barring.male.barred, 1) && near(classicBar.marginals.barring.female.none, 1),
      "sons barred " + formatPct(classicBar.marginals.barring.male.barred) + ", daughters not barred " + formatPct(classicBar.marginals.barring.female.none)
    );

    var dwarfCross = cross(makeBird("male", { dw: ["dw", "dw"] }), makeBird("female", { dw: ["DW+", "W"] }));
    check(
      "dwarf rooster x normal hen: daughters dwarf, sons normal carriers",
      near(dwarfCross.marginals.loci.dw.male["DW+/dw"], 1) &&
        near(dwarfCross.marginals.loci.dw.female["dw/W"], 1) &&
        near(share(dwarfCross.male.outcomes, function (o) { return o.tags.dwarf === "normal"; }), 1) &&
        near(share(dwarfCross.female.outcomes, function (o) { return o.tags.dwarf === "dwarf"; }), 1),
      "sons DW+/dw, daughters dw/W"
    );

    var carrierSons = cross(makeBird("male", { dw: ["DW+", "DW+"] }), makeBird("female", { dw: ["dw", "W"] }));
    check(
      "normal rooster x dwarf hen: sons carry dw, daughters are normal",
      near(carrierSons.marginals.loci.dw.male["DW+/dw"], 1) &&
        near(carrierSons.marginals.loci.dw.female["DW+/W"], 1) &&
        near(share(carrierSons.female.outcomes, function (o) { return o.tags.dwarf === "normal"; }), 1),
      "sons DW+/dw, daughters DW+/W"
    );

    var eggs = cross(
      makeBird("male", { O: ["O", "o+"], Br: ["Br", "br"] }),
      makeBird("female", { O: ["o+", "o+"], Br: ["br", "br"] })
    );
    check(
      "blue egg x brown switch: daughters 25% each white, blue/cream, brown, olive/green",
      near(eggs.marginals.egg.white, 0.25) && near(eggs.marginals.egg.blue, 0.25) &&
        near(eggs.marginals.egg.brown, 0.25) && near(eggs.marginals.egg.olive, 0.25) &&
        near(share(eggs.female.outcomes, function (o) { return o.tags.egg === "olive"; }), 0.25),
      "white " + formatPct(eggs.marginals.egg.white) + ", blue/cream " + formatPct(eggs.marginals.egg.blue) + ", brown " + formatPct(eggs.marginals.egg.brown) + ", olive/green " + formatPct(eggs.marginals.egg.olive)
    );

    var frizzle = cross(makeBird("male", { F: ["F", "f+"] }), makeBird("female", { F: ["F", "f+"] }));
    var frizzleNote = frizzle.notes.filter(function (n) { return /frazzle/i.test(n.text) && n.level === "warn"; });
    check(
      "frizzle x frizzle warns that 25% are frazzle",
      near(frizzle.marginals.loci.F.both["F/F"], 0.25) && frizzleNote.length === 1 &&
        near(share(frizzle.male.outcomes, function (o) { return o.tags.frizzle === "frazzle"; }), 0.25),
      "F/F " + formatPct(frizzle.marginals.loci.F.both["F/F"] || 0)
    );

    var sumOk = true;
    var sumDetail = [];
    [
      ["rose x pea", rosePea],
      ["walnut", walnut],
      ["all silver", allSilver],
      ["sex-link", sexLink],
      ["blue", blue],
      ["mix", mix],
      ["barring", bars],
      ["eggs", eggs],
      ["frizzle", frizzle]
    ].forEach(function (item) {
      ["male", "female"].forEach(function (sex) {
        var block = sex === "male" ? item[1].male : item[1].female;
        var total = sumP(block.outcomes);
        if (!near(total, 1)) {
          sumOk = false;
          sumDetail.push(item[0] + " " + sex + " " + total);
        }
      });
    });
    check("probabilities sum to 1 for both sexes", sumOk, sumDetail.join("; ") || "every listed cross");

    var presetOk = true;
    var presetDetail = [];
    PRESETS.forEach(function (preset) {
      ["male", "female"].forEach(function (sex) {
        var gt = applyPreset(preset.id, sex);
        var described = describeBird(gt, sex);
        if (!described.label) presetOk = false;
        var form = lociFor(sex);
        form.forEach(function (locus) {
          var key = keyFromAlleles(gt[locus.id]);
          var found = locus.options.some(function (o) { return o.value === key; });
          if (!found) {
            presetOk = false;
            presetDetail.push(preset.id + " " + sex + " " + locus.id + "=" + key);
          }
        });
      });
    });
    check("quick picks match a genotype the form can show", presetOk, presetDetail.join("; ") || (PRESETS.length + " presets"));

    var messy = cross(makeBird("male", {
      R: ["R", "r"], P: ["P", "p"], E: ["E", "e+"], Co: ["Co", "co+"],
      S: ["S", "s+"], B: ["B", "b+"], Bl: ["Bl", "bl+"], I: ["I", "i+"],
      C: ["C+", "c"], O: ["O", "o+"], Br: ["Br", "br"], Cr: ["Cr", "cr+"],
      Mb: ["Mb", "mb+"], Pti: ["Pti", "pti+"], F: ["F", "f+"], dw: ["DW+", "dw"]
    }), makeBird("female", {
      R: ["R", "r"], P: ["P", "p"], E: ["E", "eWh"], Co: ["Co", "co+"],
      S: ["S", "W"], B: ["B", "W"], Bl: ["Bl", "bl+"], I: ["I", "i+"],
      C: ["C+", "c"], O: ["O", "o+"], Br: ["Br", "br"], Cr: ["Cr", "cr+"],
      Mb: ["Mb", "mb+"], Pti: ["Pti", "pti+"], F: ["F", "f+"], dw: ["dw", "W"]
    }));
    var messyWalnut = share(messy.male.outcomes, function (o) { return o.tags.comb === "walnut"; });
    var sideSumOk = messy.male.sidelined.every(function (group) {
      return near(sumP(group.items), 1);
    }) && messy.female.sidelined.every(function (group) {
      return near(sumP(group.items), 1);
    });
    check(
      "a fully heterozygous cross still sums to 1 and keeps the 9:3:3:1 comb ratio",
      near(sumP(messy.male.outcomes), 1) && near(sumP(messy.female.outcomes), 1) &&
        near(messyWalnut, 9 / 16) && near(messy.marginals.blue.blue, 0.5) && sideSumOk,
      "male rows " + messy.male.outcomes.length + ", sidelined " + messy.male.sidelined.map(function (g) { return g.id; }).join("+") +
        ", walnut " + formatPct(messyWalnut)
    );

    check("formatPct keeps the classic fractions readable",
      formatPct(9 / 16) === "56.25%" && formatPct(3 / 16) === "18.75%" && formatPct(1 / 16) === "6.25%" && formatPct(0.25) === "25%" && formatPct(1) === "100%",
      [formatPct(9 / 16), formatPct(3 / 16), formatPct(1 / 16)].join(", "));

    return checks;
  }

  return {
    LOCI: LOCI,
    GROUP_ORDER: GROUP_ORDER,
    PRESETS: PRESETS,
    baseline: baseline,
    makeBird: makeBird,
    applyPreset: applyPreset,
    lociFor: lociFor,
    keyFromAlleles: keyFromAlleles,
    meaning: meaning,
    describeBird: describeBird,
    cross: cross,
    formatPct: formatPct,
    selfCheck: selfCheck
  };
});
