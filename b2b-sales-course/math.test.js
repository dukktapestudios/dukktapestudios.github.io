var math = require("./math.js");
var failed = 0;

function assert(cond, message) {
  if (!cond) {
    failed += 1;
    console.error("FAIL: " + message);
  }
}
function near(actual, expected, tolerance, message) {
  var ok = typeof actual === "number" && Math.abs(actual - expected) <= tolerance;
  assert(ok, message + " (got " + actual + ", expected " + expected + ")");
}

(function harborCashPayback() {
  var result = math.businessCase({
    ordersPerMonth: "1200",
    minutesNow: "8",
    minutesWithTool: "8",
    adoptionPct: "100",
    hourlyCashCost: "22",
    overtimeCash: "1200",
    avoidedHireCash: "0",
    cancelledToolCash: "600",
    nonLaborCash: "400",
    subscriptionMonthly: "1500",
    otherMonthlyCost: "0",
    implementationCash: "12000"
  });
  assert(result.ok, "harbor case runs");
  near(result.results.hoursFreed, 0, 1e-9, "equal minutes free no hours");
  near(result.results.cashBenefit, 2200, 0.001, "verified cash is overtime plus tool plus courier");
  near(result.results.monthlyNetCash, 700, 0.001, "net cash after the subscription");
  near(result.results.paybackMonths, 12000 / 700, 1e-9, "payback is implementation divided by monthly net cash");
  assert(result.results.paybackStatus === "months", "payback status");
  near(result.results.capacityDollars, 0, 0.001, "capacity stays out when hours do not change");
})();

(function capacityIsNotCash() {
  var result = math.businessCase({
    ordersPerMonth: "1000",
    minutesNow: "6",
    minutesWithTool: "2",
    adoptionPct: "50",
    hourlyCashCost: "30",
    overtimeCash: "0",
    avoidedHireCash: "0",
    cancelledToolCash: "0",
    nonLaborCash: "0",
    subscriptionMonthly: "1500",
    otherMonthlyCost: "0",
    implementationCash: "12000"
  });
  near(result.results.hoursFreed, 1000 * 4 / 60 * 0.5, 1e-9, "adopted minute delta");
  near(result.results.capacityDollars, 1000, 0.001, "capacity dollars are hours times the wage");
  near(result.results.cashBenefit, 0, 0.001, "capacity is not added into cash");
  near(result.results.monthlyNetCash, -1500, 0.001, "subscription remains a cash cost");
  assert(result.results.paybackStatus === "none", "no payback when cash flow is negative");
  assert(result.results.paybackMonths == null, "negative cash has no payback number");
})();

(function adoptionScalesHoursOnly() {
  var full = math.businessCase({
    ordersPerMonth: 100,
    minutesNow: 60,
    minutesWithTool: 0,
    adoptionPct: 100,
    hourlyCashCost: 10,
    overtimeCash: 50,
    subscriptionMonthly: 0,
    implementationCash: 0
  });
  var half = math.businessCase({
    ordersPerMonth: 100,
    minutesNow: 60,
    minutesWithTool: 0,
    adoptionPct: 50,
    hourlyCashCost: 10,
    overtimeCash: 50,
    subscriptionMonthly: 0,
    implementationCash: 0
  });
  near(full.results.hoursFreed, 100, 1e-9, "100 orders times 1 hour");
  near(half.results.hoursFreed, 50, 1e-9, "adoption cuts hours in half");
  near(full.results.cashBenefit, half.results.cashBenefit, 0.001, "adoption does not change a separately verified cash line");
  assert(full.results.paybackStatus === "immediate", "zero implementation and positive cash pays back immediately");
  near(full.results.paybackMonths, 0, 0, "immediate payback is zero months");
})();

(function recurringAndPlan() {
  var money = math.recurring({ annualSubscription: "48000", oneTimeFees: "40000" });
  near(money.mrr, 4000, 1e-9, "MRR is annual divided by 12");
  near(money.arr, 48000, 1e-9, "ARR is the annual subscription");
  near(money.acv, 48000, 1e-9, "ACV here is recurring annual value, not the implementation fee");
  near(money.oneTimeFees, 40000, 0, "one-time fee stays separate");
  var pay = math.planPay({ base: "60000", variableAtFull: "60000", attainmentPct: "50" });
  near(pay.variablePay, 30000, 0.001, "half attainment pays half the variable");
  near(pay.totalPay, 90000, 0.001, "base plus variable");
})();

(function invalid() {
  var bad = math.businessCase({ adoptionPct: "140", ordersPerMonth: "1" });
  assert(!bad.ok && bad.results == null, "adoption above 100 is rejected");
  var text = math.businessCase({ ordersPerMonth: "many", subscriptionMonthly: "10" });
  assert(!text.ok, "words are rejected");
  var neg = math.planPay({ base: "-1", variableAtFull: "0", attainmentPct: "0" });
  assert(!neg.ok, "negative pay is rejected");
  assert(JSON.stringify(bad).indexOf("NaN") === -1, "errors do not stringify NaN");
})();

if (failed) {
  console.error(failed + " failed");
  process.exit(1);
}
console.log("B2B math checks passed.");
