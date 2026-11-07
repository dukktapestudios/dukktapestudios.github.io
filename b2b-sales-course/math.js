/* Business-case math for the B2B sales course.
   Cash is money that leaves or stays in a bank account.
   Freed hours are capacity. They are not added to cash.
   Nothing here is a forecast for a real company. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.B2BMath = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function finite(n) {
    return typeof n === "number" && Number.isFinite(n);
  }

  function parseNumber(raw) {
    if (raw == null) return { ok: true, empty: true, value: 0 };
    var text = String(raw).trim();
    if (text === "") return { ok: true, empty: true, value: 0 };
    var cleaned = text.replace(/[$,\s]/g, "");
    if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(cleaned)) return { ok: false, empty: false, value: null };
    var value = Number(cleaned);
    if (!finite(value)) return { ok: false, empty: false, value: null };
    return { ok: true, empty: false, value: value };
  }

  function roundCents(n) {
    if (!finite(n)) return null;
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  function read(input, field, label, max) {
    var parsed = parseNumber(input[field]);
    if (!parsed.ok) return { error: label + " needs a plain number." };
    if (parsed.value < 0) return { error: label + " cannot be negative." };
    if (parsed.value > (max || 1e12)) return { error: label + " is too large for this worksheet." };
    return { value: parsed.value, empty: parsed.empty };
  }

  function recurring(input) {
    var annual = read(input, "annualSubscription", "Annual subscription", 1e9);
    if (annual.error) return { ok: false, errors: [annual.error] };
    var oneTime = read(input, "oneTimeFees", "One-time fees", 1e9);
    if (oneTime.error) return { ok: false, errors: [oneTime.error] };
    return {
      ok: true,
      errors: [],
      mrr: annual.value / 12,
      arr: annual.value,
      acv: annual.value,
      oneTimeFees: oneTime.value
    };
  }

  function planPay(input) {
    var base = read(input, "base", "Base pay", 1e8);
    var variable = read(input, "variableAtFull", "Variable pay at full plan", 1e8);
    var attainment = read(input, "attainmentPct", "Attainment percent", 1000);
    var errors = [];
    [base, variable, attainment].forEach(function (item) { if (item.error) errors.push(item.error); });
    if (errors.length) return { ok: false, errors: errors };
    var ratio = attainment.value / 100;
    return {
      ok: true,
      errors: [],
      variablePay: variable.value * ratio,
      totalPay: base.value + variable.value * ratio,
      note: "This uses only the plan numbers you typed. It is not a salary survey and not an offer."
    };
  }

  function businessCase(input) {
    var source = input || {};
    var fields = [
      ["ordersPerMonth", "Orders per month", 1e9],
      ["minutesNow", "Minutes per order now", 1e5],
      ["minutesWithTool", "Minutes per order with the tool", 1e5],
      ["adoptionPct", "Adoption percent", 1e6],
      ["hourlyCashCost", "Hourly cash labor cost", 1e6],
      ["overtimeCash", "Verified overtime cash saved per month", 1e9],
      ["avoidedHireCash", "Verified cancelled-hire cash per month", 1e9],
      ["cancelledToolCash", "Verified cancelled-tool cash per month", 1e9],
      ["nonLaborCash", "Verified non-labor cash saved per month", 1e9],
      ["subscriptionMonthly", "Subscription per month", 1e9],
      ["otherMonthlyCost", "Other monthly cost", 1e9],
      ["implementationCash", "Implementation cash", 1e9]
    ];
    var errors = [];
    var values = {};
    fields.forEach(function (spec) {
      var item = read(source, spec[0], spec[1], spec[2]);
      if (item.error) errors.push(item.error);
      else values[spec[0]] = item.value;
    });
    if (errors.length) return { ok: false, errors: errors, results: null };
    if (values.adoptionPct > 100) {
      return { ok: false, errors: ["Adoption percent must be from 0 to 100."], results: null };
    }

    var minuteDelta = values.minutesNow - values.minutesWithTool;
    var adoptedOrders = values.ordersPerMonth * (values.adoptionPct / 100);
    var hoursFreed = adoptedOrders * minuteDelta / 60;
    var capacityDollars = hoursFreed * values.hourlyCashCost;
    var cashBenefit = values.overtimeCash + values.avoidedHireCash + values.cancelledToolCash + values.nonLaborCash;
    var cashCost = values.subscriptionMonthly + values.otherMonthlyCost;
    var monthlyNetCash = cashBenefit - cashCost;
    var paybackMonths = null;
    var paybackStatus = "undefined";
    if (!(monthlyNetCash > 0)) {
      paybackStatus = "none";
    } else if (values.implementationCash === 0) {
      paybackMonths = 0;
      paybackStatus = "immediate";
    } else {
      paybackMonths = values.implementationCash / monthlyNetCash;
      paybackStatus = finite(paybackMonths) ? "months" : "undefined";
      if (paybackStatus !== "months") paybackMonths = null;
    }

    var results = {
      hoursFreed: hoursFreed,
      capacityDollars: capacityDollars,
      cashBenefit: cashBenefit,
      cashCost: cashCost,
      monthlyNetCash: monthlyNetCash,
      implementationCash: values.implementationCash,
      paybackMonths: paybackMonths,
      paybackStatus: paybackStatus,
      firstYearNetCash: monthlyNetCash * 12 - values.implementationCash
    };
    var bag = [];
    Object.keys(results).forEach(function (key) {
      if (typeof results[key] === "number" && !finite(results[key])) bag.push(key);
    });
    if (bag.length) return { ok: false, errors: ["The worksheet could not finish this estimate."], results: null };
    return { ok: true, errors: [], results: results };
  }

  return {
    parseNumber: parseNumber,
    roundCents: roundCents,
    recurring: recurring,
    planPay: planPay,
    businessCase: businessCase
  };
});
