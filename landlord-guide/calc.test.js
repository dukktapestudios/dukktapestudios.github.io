/* Independent checks for landlord-guide/calc.js.
   Run from the repo root: node landlord-guide/calc.test.js
   The payoff loop below is a second implementation, not a copy of the
   closed-form return value. */
var calc = require("./calc.js");
var failed = 0;

function assert(cond, message) {
  if (!cond) {
    failed += 1;
    console.error("FAIL: " + message);
  }
}

function near(actual, expected, tolerance, message) {
  var ok = typeof actual === "number" && typeof expected === "number"
    && Math.abs(actual - expected) <= tolerance;
  assert(ok, message + " (got " + actual + ", expected " + expected + ")");
}

function walk(value, path, bad) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) bad.push(path + " is " + value);
    return;
  }
  if (value && typeof value === "object") {
    Object.keys(value).forEach(function (key) {
      walk(value[key], path + "." + key, bad);
    });
  }
}

function noBadNumbers(result, label) {
  var bad = [];
  walk(result, label, bad);
  assert(bad.length === 0, label + " has non-finite numbers: " + bad.join(", "));
  assert(JSON.stringify(result).indexOf("NaN") === -1, label + " stringified to NaN");
}

function payoffBalance(principal, annualPct, years, payment) {
  var months = years * 12;
  var rate = annualPct / 100 / 12;
  var balance = principal;
  for (var i = 0; i < months; i++) {
    balance = rate === 0 ? balance - payment : balance * (1 + rate) - payment;
  }
  return balance;
}

function base(overrides) {
  var input = {
    purchase: "0",
    downPayment: "0",
    ratePct: "0",
    termYears: "0",
    closingCosts: "0",
    rehab: "0",
    otherUpfront: "0",
    rent: "0",
    rentUnit: "month",
    otherIncome: "0",
    otherIncomeUnit: "month",
    vacancyPct: "0",
    taxes: "0",
    taxesUnit: "year",
    insurance: "0",
    insuranceUnit: "year",
    ownerUtilities: "0",
    ownerUtilitiesUnit: "month",
    hoa: "0",
    hoaUnit: "month",
    maintenance: "0",
    maintenanceUnit: "month",
    otherOperating: "0",
    otherOperatingUnit: "year",
    managementPct: "0",
    mortgageInsurance: "0",
    mortgageInsuranceUnit: "month",
    capexReserve: "0",
    capexReserveUnit: "year",
    compLow: "",
    compTypical: "",
    compHigh: ""
  };
  Object.keys(overrides || {}).forEach(function (key) { input[key] = overrides[key]; });
  return input;
}

(function knownAmortization() {
  var payment = calc.monthlyPayment(200000, 6, 30);
  near(calc.roundCents(payment), 1199.1, 0, "published $200,000 at 6% for 30 years rounds to $1,199.10");
  near(payoffBalance(200000, 6, 30, payment), 0, 0.02, "6% payment pays the $200,000 loan to about $0");

  var oneYear = calc.monthlyPayment(1000, 12, 1);
  near(calc.roundCents(oneYear), 88.85, 0, "$1,000 at 12% for 1 year rounds to $88.85");
  near(payoffBalance(1000, 12, 1, oneYear), 0, 0.01, "12% payment pays the $1,000 loan off");
})();

(function zeroInterest() {
  var payment = calc.monthlyPayment(120000, 0, 10);
  near(payment, 1000, 0, "0% interest is loan divided by months");
  near(payoffBalance(120000, 0, 10, payment), 0, 0, "0% payments land on zero");
  var result = calc.analyze(base({
    purchase: "160000",
    downPayment: "40000",
    ratePct: "0",
    termYears: "10",
    rent: "0",
    rentUnit: "month"
  }));
  assert(result.ok, "0% loan analyzes");
  near(result.results.loan, 120000, 0, "0% loan amount");
  near(result.results.monthlyPrincipalInterest, 1000, 0, "0% monthly principal");
  near(result.results.annualDebtService, 12000, 0, "0% annual debt service stays exact");
  noBadNumbers(result, "zero interest");
})();

(function cashPurchase() {
  var result = calc.analyze(base({
    purchase: "250000",
    downPayment: "250000",
    ratePct: "7.25",
    termYears: "30",
    closingCosts: "5000",
    rehab: "0",
    taxes: "2400",
    taxesUnit: "year",
    insurance: "1200",
    insuranceUnit: "year",
    rent: "2000",
    rentUnit: "month",
    vacancyPct: "5",
    managementPct: "10",
    capexReserve: "100",
    capexReserveUnit: "month"
  }));
  assert(result.ok, "cash purchase analyzes");
  near(result.results.loan, 0, 0, "cash purchase loan is 0");
  near(result.results.monthlyPrincipalInterest, 0, 0, "cash purchase payment ignores the typed rate");
  near(result.results.annualDebtService, 0, 0, "cash purchase debt service is 0");
  near(result.results.cashInvested, 255000, 0, "cash invested includes the full price and closing costs");
  near(result.results.scheduledRent, 24000, 0, "cash purchase scheduled rent");
  near(result.results.collectedRent, 22800, 0, "5% vacancy comes off scheduled rent");
  near(result.results.managementCost, 2280, 0, "management is 10% of collected rent");
  near(result.results.operatingExpenses, 2400 + 1200 + 2280, 0, "tax, insurance, and management");
  near(result.results.noi, 22800 - (2400 + 1200 + 2280), 0, "NOI uses collected rent");
  near(result.results.cashFlow, result.results.noi - 1200, 0, "cash flow subtracts the reserve and not a phantom loan");
  noBadNumbers(result, "cash purchase");
})();

(function zeroInterestCashAndReserve() {
  var result = calc.analyze(base({
    purchase: "180000",
    downPayment: "180000",
    ratePct: "0",
    termYears: "15",
    rehab: "20000",
    rent: "1500",
    rentUnit: "month",
    taxes: "2000",
    taxesUnit: "year",
    insurance: "1000",
    insuranceUnit: "year",
    ownerUtilities: "50",
    ownerUtilitiesUnit: "month",
    maintenance: "100",
    maintenanceUnit: "month",
    capexReserve: "1500",
    capexReserveUnit: "year"
  }));
  assert(result.ok, "0% cash purchase analyzes");
  near(result.results.monthlyPrincipalInterest, 0, 0, "no payment on a 0% cash purchase");
  near(result.results.cashInvested, 200000, 0, "rehab is cash invested");
  near(result.results.effectiveIncome, 18000, 0, "rent only");
  near(result.results.operatingExpenses, 4800, 0, "fixed operating costs");
  near(result.results.noi, 13200, 0, "NOI");
  near(result.results.cashFlow, 11700, 0, "cash flow after reserve");
  near(result.results.cashOnCash.ratio, 11700 / 200000, 1e-12, "cash-on-cash");
})();

(function managementBasisAndBreakeven() {
  var result = calc.analyze(base({
    purchase: "100000",
    downPayment: "100000",
    rent: "1000",
    rentUnit: "month",
    vacancyPct: "50",
    managementPct: "10",
    taxes: "12000",
    taxesUnit: "year"
  }));
  assert(result.ok, "basis case analyzes");
  near(result.results.collectedRent, 6000, 0, "half of $12,000 scheduled rent is collected");
  near(result.results.managementCost, 600, 0, "management uses collected rent, not the $12,000 gross");
  assert(result.results.managementCost !== 1200, "management is not taken on gross scheduled rent");

  var solved = calc.analyze(base({
    purchase: "100000",
    downPayment: "100000",
    vacancyPct: "50",
    managementPct: "25",
    taxes: "12000",
    taxesUnit: "year"
  }));
  assert(solved.results.breakEven.status === "rent", "high vacancy can still solve");
  near(solved.results.breakEven.annualScheduledRent, 32000, 0.001, "break-even scheduled rent at 50% vacancy and 25% management");
  var check = calc.analyze(base({
    purchase: "100000",
    downPayment: "100000",
    vacancyPct: "50",
    managementPct: "25",
    taxes: "12000",
    taxesUnit: "year",
    rent: String(solved.results.breakEven.annualScheduledRent),
    rentUnit: "year"
  }));
  near(check.results.cashFlow, 0, 0.01, "plugging break-even rent back in lands on zero cash flow");
  near(check.results.managementCost, 4000, 0.02, "at the solved rent, management stays on collected rent");
})();

(function highVacancyScalesRent() {
  var none = calc.analyze(base({
    purchase: "100000",
    downPayment: "100000",
    taxes: "10000",
    taxesUnit: "year"
  }));
  var high = calc.analyze(base({
    purchase: "100000",
    downPayment: "100000",
    vacancyPct: "90",
    taxes: "10000",
    taxesUnit: "year"
  }));
  near(none.results.breakEven.annualScheduledRent, 10000, 0.001, "no vacancy break-even equals the fixed cost");
  near(high.results.breakEven.annualScheduledRent, 100000, 0.001, "90% vacancy multiplies scheduled rent by 10");
  var back = calc.analyze(base({
    purchase: "100000",
    downPayment: "100000",
    vacancyPct: "90",
    taxes: "10000",
    taxesUnit: "year",
    rent: "100000",
    rentUnit: "year"
  }));
  near(back.results.collectedRent, 10000, 0.001, "90% vacancy leaves 10% collected");
  near(back.results.cashFlow, 0, 0.01, "high-vacancy break-even cash flow is zero");
})();

(function impossibleAndAlready() {
  var impossible = calc.analyze(base({
    purchase: "100000",
    downPayment: "100000",
    vacancyPct: "100",
    taxes: "1000",
    taxesUnit: "year",
    rent: "5000",
    rentUnit: "month"
  }));
  assert(impossible.ok, "100% vacancy still has a cash-flow estimate");
  assert(impossible.results.breakEven.status === "impossible", "100% vacancy cannot solve a rent");
  assert(impossible.results.breakEven.annualScheduledRent == null, "impossible break-even has no rent number");
  near(impossible.results.collectedRent, 0, 0, "100% vacancy collects no rent");
  near(impossible.results.cashFlow, -1000, 0.001, "costs remain with no collected rent");
  noBadNumbers(impossible, "impossible vacancy");

  var allManagement = calc.analyze(base({
    purchase: "80000",
    downPayment: "20000",
    ratePct: "6",
    termYears: "30",
    managementPct: "100",
    taxes: "500",
    taxesUnit: "year"
  }));
  assert(allManagement.results.breakEven.status === "impossible", "100% management cannot solve a rent");
  noBadNumbers(allManagement, "impossible management");

  var covered = calc.analyze(base({
    purchase: "100000",
    downPayment: "100000",
    vacancyPct: "100",
    otherIncome: "5000",
    otherIncomeUnit: "year",
    taxes: "1000",
    taxesUnit: "year"
  }));
  assert(covered.results.breakEven.status === "already", "other income can cover costs when rent contributes nothing");
  near(covered.results.breakEven.annualScheduledRent, 0, 0, "already-covered break-even is zero");
  near(covered.results.cashFlow, 4000, 0.001, "leftover other income is cash flow");
  noBadNumbers(covered, "already covered");
})();

(function noiExcludesDebtAndReserve() {
  var loan = calc.analyze(base({
    purchase: "200000",
    downPayment: "40000",
    ratePct: "6",
    termYears: "30",
    rent: "1800",
    rentUnit: "month",
    taxes: "2400",
    taxesUnit: "year",
    capexReserve: "100",
    capexReserveUnit: "month"
  }));
  var moreTax = calc.analyze(base({
    purchase: "200000",
    downPayment: "40000",
    ratePct: "6",
    termYears: "30",
    rent: "1800",
    rentUnit: "month",
    taxes: "3600",
    taxesUnit: "year",
    capexReserve: "100",
    capexReserveUnit: "month"
  }));
  var moreReserve = calc.analyze(base({
    purchase: "200000",
    downPayment: "40000",
    ratePct: "6",
    termYears: "30",
    rent: "1800",
    rentUnit: "month",
    taxes: "2400",
    taxesUnit: "year",
    capexReserve: "250",
    capexReserveUnit: "month"
  }));
  near(loan.results.annualDebtService, moreTax.results.annualDebtService, 0, "raising taxes does not change principal and interest");
  near(loan.results.noi - moreTax.results.noi, 1200, 0.001, "the extra tax reduces NOI once");
  near(loan.results.noi, moreReserve.results.noi, 0.001, "a larger capital reserve does not change NOI");
  near(loan.results.cashFlow - moreReserve.results.cashFlow, 150 * 12, 0.001, "the reserve reduces cash flow below NOI");
  assert(loan.results.noi !== loan.results.cashFlow, "NOI and cash flow differ when debt or reserve is present");

  var withInsurance = calc.analyze(base({
    purchase: "100000",
    downPayment: "100000",
    mortgageInsurance: "100",
    mortgageInsuranceUnit: "month"
  }));
  near(withInsurance.results.noi, 0, 0.001, "mortgage insurance is outside NOI");
  near(withInsurance.results.cashFlow, -1200, 0.001, "mortgage insurance reduces cash flow");
  near(withInsurance.results.breakEven.annualScheduledRent, 1200, 0.001, "break-even includes mortgage insurance");
})();

(function unitsAndCashOnCash() {
  var annual = calc.analyze(base({
    purchase: "100000",
    downPayment: "25000",
    ratePct: "0",
    termYears: "10",
    closingCosts: "5000",
    rehab: "10000",
    taxes: "1200",
    taxesUnit: "year",
    rent: "1000",
    rentUnit: "month"
  }));
  var monthly = calc.analyze(base({
    purchase: "100000",
    downPayment: "25000",
    ratePct: "0",
    termYears: "10",
    closingCosts: "5000",
    rehab: "10000",
    taxes: "100",
    taxesUnit: "month",
    rent: "12000",
    rentUnit: "year"
  }));
  near(annual.results.noi, monthly.results.noi, 0.001, "monthly and annual entries match");
  near(annual.results.cashInvested, 40000, 0, "cash invested is down payment plus closing and rehab");
  near(annual.results.loan, 75000, 0, "loan ignores closing and rehab");
  near(annual.results.annualDebtService, 7500, 0.001, "0% debt service is loan divided by years");
  var withoutRehab = calc.analyze(base({
    purchase: "100000",
    downPayment: "25000",
    ratePct: "0",
    termYears: "10",
    closingCosts: "5000",
    taxes: "1200",
    taxesUnit: "year",
    rent: "1000",
    rentUnit: "month"
  }));
  assert(annual.results.cashOnCash.ratio !== withoutRehab.results.cashOnCash.ratio, "rehab changes cash-on-cash");
  near(annual.results.cashOnCash.ratio, annual.results.cashFlow / 40000, 1e-12, "cash-on-cash uses actual cash");

  var nothingDown = calc.analyze(base({
    purchase: "100000",
    downPayment: "0",
    ratePct: "0",
    termYears: "10"
  }));
  assert(nothingDown.results.cashOnCash.status === "undefined", "zero cash invested does not divide");
  assert(nothingDown.results.cashOnCash.ratio == null, "undefined cash-on-cash has no ratio");
  noBadNumbers(nothingDown, "zero cash invested");
})();

(function invalidInputs() {
  var cases = [
    [{}, true, "empty form is idle"],
    [base({ purchase: "40", downPayment: "50" }), false, "down payment above price"],
    [base({ purchase: "100", downPayment: "10", ratePct: "5", termYears: "0", rent: "1" }), false, "loan with zero years"],
    [base({ purchase: "100", downPayment: "10", ratePct: "-1", termYears: "30" }), false, "negative rate"],
    [base({ purchase: "100", downPayment: "10", ratePct: "5", termYears: "30", rent: "-5" }), false, "negative rent"],
    [base({ purchase: "abc", downPayment: "10" }), false, "text purchase price"],
    [base({ purchase: "100", downPayment: "10", ratePct: "5", termYears: "30", vacancyPct: "140" }), false, "vacancy above 100"],
    [base({ purchase: "100", downPayment: "10", ratePct: "5", termYears: "30", managementPct: "101" }), false, "management above 100"],
    [base({ purchase: "100", downPayment: "10", ratePct: "5", termYears: "thirty" }), false, "word term"]
  ];
  cases.forEach(function (item) {
    var result = calc.analyze(item[0]);
    assert(result.ok === false, item[2] + " is rejected");
    assert(result.results == null, item[2] + " has no results object");
    if (item[1]) assert(result.idle === true, item[2]);
    noBadNumbers(result, item[2]);
  });

  var commas = calc.analyze(base({
    purchase: "$200,000",
    downPayment: "40,000",
    ratePct: "6",
    termYears: "30",
    rent: "1,500.00",
    rentUnit: "month"
  }));
  assert(commas.ok, "dollar signs and commas parse");
  near(commas.results.loan, 160000, 0, "parsed loan");
  near(commas.results.scheduledRent, 18000, 0.001, "parsed rent");
})();

(function exampleIsLabeledMath() {
  var result = calc.analyze(calc.EXAMPLE);
  assert(result.ok, "made-up example analyzes");
  assert(result.results.breakEven.status === "rent", "example break-even is a number");
  assert(result.results.comparables.length === 3, "example comparables are the typed sample rents");
  var back = calc.analyze(Object.assign({}, calc.EXAMPLE, {
    rent: String(result.results.breakEven.monthlyScheduledRent),
    rentUnit: "month",
    compLow: "",
    compTypical: "",
    compHigh: ""
  }));
  near(back.results.cashFlow, 0, 0.05, "example break-even round-trips to about zero cash flow");
  noBadNumbers(result, "example");
  assert(!Object.prototype.hasOwnProperty.call(result.results, "recommendedRent"), "there is no recommended rent field");
})();

if (failed) {
  console.error(failed + " failed");
  process.exit(1);
}
console.log("All landlord calculator checks passed.");
