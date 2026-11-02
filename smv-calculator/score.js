/* Rough 1-10 scoring and percentile estimates. See the Sources section. */
var SMVScore = (function () {
  var WEIGHTS = {
    looks: 0.13,
    fitness: 0.12,
    height: 0.08,
    health: 0.09,
    style: 0.06,
    social: 0.11,
    humor: 0.07,
    income: 0.11,
    wealth: 0.06,
    education: 0.05,
    career: 0.07,
    age: 0.05
  };

  var LABELS = {
    looks: "Looks and grooming",
    fitness: "Fitness",
    height: "Height",
    health: "Health habits",
    style: "Style",
    social: "Social skills",
    humor: "Humor and charisma",
    income: "Income",
    wealth: "Net worth",
    education: "Education",
    career: "Career",
    age: "Age"
  };

  var BODY = { lean: 8.8, fit: 7.6, average: 6.0, high: 4.4, veryHigh: 3.2 };
  var STRENGTH = { none: 4.0, started: 5.5, consistent: 6.5, intermediate: 7.6, advanced: 8.8 };
  var EDU = { less: 3.8, secondary: 5.4, trade: 6.6, bachelor: 7.6, master: 8.4, doctorate: 9.0 };
  var CAREER = { student: 5.8, seeking: 4.6, early: 6.2, skilled: 7.3, lead: 8.4, senior: 9.0, other: 6.4 };
  var SLEEP = { under5: 3.2, five: 5.2, good: 9.0, over9: 6.8 };
  var SMOKE = { never: 9.0, quit: 7.6, some: 4.8, daily: 3.0 };
  var DRINK = { rare: 8.4, moderate: 8.0, heavy: 3.8 };

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  /* Abramowitz and Stegun 26.2.17, absolute error under about 7.5e-8. */
  function cdf(z) {
    if (z < -8) return 0;
    if (z > 8) return 1;
    var t = 1 / (1 + 0.2316419 * Math.abs(z));
    var d = 0.3989422804014327 * Math.exp(-0.5 * z * z);
    var p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return z >= 0 ? 1 - p : p;
  }

  function scoreFromZ(z) {
    return clamp(1 + 9 * cdf(z), 1, 10);
  }

  function ageFactor(age) {
    if (age < 25) return 0.12;
    if (age < 30) return 0.28;
    if (age < 35) return 0.5;
    if (age < 45) return 0.85;
    if (age < 55) return 1.2;
    if (age < 65) return 1.35;
    return 1.15;
  }

  function ageScore(age) {
    if (age < 25) return 6.8;
    if (age < 35) return 7.6;
    if (age < 45) return 7.8;
    if (age < 55) return 7.4;
    if (age < 65) return 7.0;
    return 6.6;
  }

  function incomeZ(amount, benchmark, kind) {
    var sigma = kind === "oecd" ? 0.55 : 0.7;
    var mu = Math.log(benchmark) - (kind === "oecd" ? (sigma * sigma) / 2 : 0);
    return (Math.log(Math.max(amount, 1)) - mu) / sigma;
  }

  function wealthScore(amount, reference, age) {
    if (!isFinite(amount) || amount <= 0) {
      return age < 30 ? 4.0 : 2.2;
    }
    var z = (Math.log(amount) - Math.log(reference)) / 1.1;
    return scoreFromZ(z);
  }

  function fitnessScore(bodyFat, strength) {
    return 0.62 * BODY[bodyFat] + 0.38 * STRENGTH[strength];
  }

  function healthScore(sleep, smoking, drinking) {
    return (SLEEP[sleep] + SMOKE[smoking] + DRINK[drinking]) / 3;
  }

  function buildCategories(person, country) {
    var C = SMV_DATA.constants;
    var cats = [];

    function add(id, score, detail) {
      cats.push({
        id: id,
        label: LABELS[id],
        score: clamp(score, 1, 10),
        weight: WEIGHTS[id],
        detail: detail || ""
      });
    }

    add("looks", person.looks, "Your own 1–10 rating. 5 is the reference, not a measurement.");
    add("fitness", fitnessScore(person.bodyFat, person.strength), "62% body-fat band, 38% strength band.");
    var hz = (person.heightCm - country.height) / C.heightSdCountry;
    add("height", scoreFromZ(hz), "Compared with the male height mean for " + country.name + " (" + country.height.toFixed(1) + " cm).");
    add("health", healthScore(person.sleep, person.smoking, person.drinking), "Sleep, smoking, and drinking, weighted equally.");
    add("style", person.style, "Your own 1–10 rating.");
    add("social", person.social, "Your own 1–10 rating.");
    add("humor", person.humor, "Your own 1–10 rating.");

    if (country.income) {
      var iz = incomeZ(person.income, country.income.value, country.income.kind);
      var incomeDetail = country.income.kind === "oecd"
        ? "Compared with the OECD average full-time wage for " + country.name + " (" + money(country.income.value) + " PPP, " + country.income.year + ")."
        : "Compared with the World Bank per-person median for " + country.name + ", annualized (" + money(country.income.value) + ", " + country.income.year + "). This is not a typical paycheck.";
      if (country.income.note) incomeDetail += " " + country.income.note;
      add("income", scoreFromZ(iz), incomeDetail);
    }

    if (country.wealth) {
      var refWealth = country.wealth * ageFactor(person.age);
      var wDetail = "Compared with an age-adjusted read of median wealth per adult in " + country.name + " (" + money(country.wealth) + " at end-2022";
      if (country.wealthNote) wDetail += "; " + country.wealthNote;
      wDetail += "). At age " + person.age + " the reference used here is about " + money(refWealth) + ".";
      add("wealth", wealthScore(person.netWorth, refWealth, person.age), wDetail);
    }

    add("education", EDU[person.education], "A fixed scale, not adjusted for how common the degree is locally.");
    add("career", CAREER[person.career], "Responsibility and skill, not status over other people.");
    add("age", ageScore(person.age), "Context only. Age is kept off the list of things to work on.");
    return cats;
  }

  function overall(cats) {
    var w = 0;
    var s = 0;
    for (var i = 0; i < cats.length; i++) {
      w += cats[i].weight;
      s += cats[i].score * cats[i].weight;
    }
    return s / w;
  }

  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function referencePerson(person, country) {
    return {
      age: person.age,
      heightCm: country.height,
      looks: 5,
      bodyFat: "average",
      strength: "none",
      style: 5,
      social: 5,
      humor: 5,
      sleep: "good",
      smoking: "never",
      drinking: "moderate",
      income: country.income ? country.income.value : 0,
      netWorth: country.wealth ? country.wealth * ageFactor(person.age) : 0,
      education: "secondary",
      career: "early"
    };
  }

  function percentileFromZ(z) {
    var pct = Math.round(cdf(z) * 100);
    if (pct < 1) pct = 1;
    if (pct > 99) pct = 99;
    return pct;
  }

  function compute(person, country) {
    var C = SMV_DATA.constants;
    var cats = buildCategories(person, country);
    var ref = buildCategories(referencePerson(person, country), country);
    var userOverall = overall(cats);
    var refOverall = overall(ref);
    var zCountry = (userOverall - refOverall) / C.countrySpread;
    var zHeightWorld = (person.heightCm - C.heightWorldCm) / C.heightSdWorld;
    var zWorld;
    if (country.income && person.income > 0) {
      var zIncomeWorld = (Math.log(person.income) - Math.log(C.worldIncomeAnnual)) / 1.2;
      zWorld = C.worldBlendCountry * zCountry + C.worldBlendHeight * zHeightWorld + C.worldBlendIncome * zIncomeWorld;
    } else {
      var hw = C.worldBlendHeight + C.worldBlendIncome;
      zWorld = (1 - hw) * zCountry + hw * zHeightWorld;
    }

    var ranked = cats.filter(function (c) { return c.id !== "age"; });
    ranked.sort(function (a, b) {
      if (a.score !== b.score) return a.score - b.score;
      if (a.weight !== b.weight) return b.weight - a.weight;
      return a.label < b.label ? -1 : 1;
    });

    return {
      categories: cats,
      overall: round1(userOverall),
      reference: round1(refOverall),
      countryPercentile: percentileFromZ(zCountry),
      worldPercentile: percentileFromZ(zWorld),
      weakest: ranked.slice(0, 3),
      strongest: ranked.slice().sort(function (a, b) { return b.score - a.score; }).slice(0, 2),
      zCountry: zCountry,
      zWorld: zWorld
    };
  }

  return {
    compute: compute,
    ageFactor: ageFactor,
    cdf: cdf,
    money: money,
    WEIGHTS: WEIGHTS
  };
})();
