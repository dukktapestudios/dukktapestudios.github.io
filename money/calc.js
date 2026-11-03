/* Plain estimates for the Money Basics page.
   These are teaching numbers, not a tax return or a loan offer.
   The take-home sketch uses 2025 single-filer federal brackets. */
(function (root) {
  var BRACKETS = [
    [11925, 0.1],
    [48475, 0.12],
    [103350, 0.22],
    [197300, 0.24],
    [250525, 0.32],
    [626350, 0.35],
    [Infinity, 0.37]
  ];
  var STANDARD_DEDUCTION = 15000;
  var SS_RATE = 0.062;
  var SS_WAGE_BASE = 176100;
  var MEDICARE_RATE = 0.0145;
  var EXTRA_MEDICARE_RATE = 0.009;
  var EXTRA_MEDICARE_THRESHOLD = 200000;

  function federalIncomeTax(taxable) {
    if (!(taxable > 0)) return 0;
    var tax = 0;
    var prev = 0;
    var i;
    for (i = 0; i < BRACKETS.length; i++) {
      var limit = BRACKETS[i][0];
      var rate = BRACKETS[i][1];
      var top = Math.min(taxable, limit);
      var slice = top - prev;
      if (slice > 0) tax += slice * rate;
      if (taxable <= limit) break;
      prev = limit;
    }
    return tax;
  }

  function takeHome(gross, statePct) {
    var pay = Math.max(0, gross);
    var stateRate = (Number(statePct) || 0) / 100;
    var taxable = Math.max(0, pay - STANDARD_DEDUCTION);
    var federal = federalIncomeTax(taxable);
    var socialSecurity = SS_RATE * Math.min(pay, SS_WAGE_BASE);
    var medicare = MEDICARE_RATE * pay + EXTRA_MEDICARE_RATE * Math.max(0, pay - EXTRA_MEDICARE_THRESHOLD);
    var state = pay * stateRate;
    return {
      gross: pay,
      federal: federal,
      socialSecurity: socialSecurity,
      medicare: medicare,
      state: state,
      takeHome: pay - federal - socialSecurity - medicare - state
    };
  }

  /* Monthly principal and interest. Linear in the loan amount. */
  function monthlyPI(principal, annualRatePct, years) {
    var n = years * 12;
    if (!(principal > 0) || !(n > 0)) return 0;
    var r = (annualRatePct / 100) / 12;
    if (r === 0) return principal / n;
    var pow = Math.pow(1 + r, n);
    return principal * (r * pow) / (pow - 1);
  }

  /* Home price whose PITI payment equals maxMonthly.
     Tax and insurance are percents of the price per year. */
  function homePrice(maxMonthly, opts) {
    if (!(maxMonthly > 0)) return 0;
    var down = opts.downPct / 100;
    var loanShare = Math.max(0, 1 - down);
    var perDollar = monthlyPI(loanShare, opts.ratePct, opts.years)
      + (opts.taxPct / 100) / 12
      + (opts.insPct / 100) / 12;
    if (!(perDollar > 0)) return Infinity;
    return maxMonthly / perDollar;
  }

  /* Same math as the original true-cost calculator. */
  function trueCost(price, usesPerYear, years, upkeep, ratePct) {
    var r = ratePct / 100;
    var total = price + upkeep * years;
    var uses = usesPerYear * years;
    var cpu = uses ? total / uses : Infinity;
    var invested = price * Math.pow(1 + r, years) + (r ? upkeep * ((Math.pow(1 + r, years) - 1) / r) : upkeep * years);
    var verdict = "Expensive per use. Wait, or rent it.";
    if (cpu <= 2) verdict = "Good value.";
    else if (cpu <= 10) verdict = "Think about it.";
    return { total: total, uses: uses, costPerUse: cpu, invested: invested, verdict: verdict };
  }

  root.MoneyCalc = {
    STANDARD_DEDUCTION: STANDARD_DEDUCTION,
    SS_WAGE_BASE: SS_WAGE_BASE,
    federalIncomeTax: federalIncomeTax,
    takeHome: takeHome,
    monthlyPI: monthlyPI,
    homePrice: homePrice,
    trueCost: trueCost
  };
})(typeof window !== "undefined" ? window : globalThis);
