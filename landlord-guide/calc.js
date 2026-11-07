/* Rental worksheet math for the Landlord Crash Course.
   Educational estimates only. Not a rent quote, appraisal, or tax return.

   Definitions used everywhere in this file:
   - Loan payment is principal and interest only.
   - Property tax and insurance are operating costs, entered once.
   - Collected rent = scheduled rent after vacancy. Other income is not haircut.
   - Management = management percent times collected rent.
   - NOI = effective income minus operating costs.
     NOI does not subtract debt service, mortgage insurance, or capital reserve.
   - Cash flow = NOI minus debt service, mortgage insurance, and capital reserve.
   - Cash invested = down payment + closing costs + rehab + other upfront cash.
   - Cash-on-cash = annual cash flow / cash invested.
   - Break-even scheduled rent is the rent that makes cash flow zero.
     It is not a suggested market rent.
*/
(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LandlordCalc = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var MAX_MONEY = 1e12;
  var MAX_YEARS = 40;

  var EXAMPLE = {
    label: "Sample rental (made-up numbers)",
    purchase: "240000",
    downPayment: "48000",
    ratePct: "6",
    termYears: "30",
    closingCosts: "7000",
    rehab: "15000",
    otherUpfront: "3000",
    rent: "1800",
    rentUnit: "month",
    otherIncome: "25",
    otherIncomeUnit: "month",
    vacancyPct: "6",
    taxes: "2800",
    taxesUnit: "year",
    insurance: "1400",
    insuranceUnit: "year",
    ownerUtilities: "0",
    ownerUtilitiesUnit: "month",
    hoa: "45",
    hoaUnit: "month",
    maintenance: "125",
    maintenanceUnit: "month",
    otherOperating: "0",
    otherOperatingUnit: "year",
    managementPct: "8",
    mortgageInsurance: "0",
    mortgageInsuranceUnit: "month",
    capexReserve: "150",
    capexReserveUnit: "month",
    compLow: "1650",
    compTypical: "1800",
    compHigh: "1950"
  };

  function finite(n) {
    return typeof n === "number" && Number.isFinite(n);
  }

  function roundCents(n) {
    if (!finite(n)) return null;
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  function parseNumber(raw) {
    if (raw == null) return { ok: true, empty: true, value: 0 };
    var text = String(raw).trim();
    if (text === "") return { ok: true, empty: true, value: 0 };
    var cleaned = text.replace(/[$,\s]/g, "");
    if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(cleaned)) {
      return { ok: false, empty: false, value: null };
    }
    var value = Number(cleaned);
    if (!finite(value)) return { ok: false, empty: false, value: null };
    return { ok: true, empty: false, value: value };
  }

  function annualize(value, unit) {
    if (unit === "year") return value;
    if (unit === "month") return value * 12;
    return null;
  }

  /* Standard fully amortizing payment. Returns null when a positive
     loan has no positive term. A zero loan is always a zero payment. */
  function monthlyPayment(principal, annualRatePct, termYears) {
    if (!finite(principal) || !finite(annualRatePct) || !finite(termYears)) return null;
    if (principal < 0 || annualRatePct < 0 || termYears < 0) return null;
    if (principal === 0) return 0;
    var months = termYears * 12;
    if (!(months > 0)) return null;
    var monthlyRate = annualRatePct / 100 / 12;
    if (monthlyRate === 0) return principal / months;
    var growth = Math.pow(1 + monthlyRate, months);
    if (!finite(growth) || growth === 1) return null;
    var payment = principal * (monthlyRate * growth) / (growth - 1);
    return finite(payment) ? payment : null;
  }

  function moneyError(field, label, parsed, allowEmpty) {
    if (!parsed.ok) return { field: field, message: label + " needs a plain number." };
    if (parsed.empty && !allowEmpty) return { field: field, message: "Enter " + label.toLowerCase() + "." };
    if (parsed.value < 0) return { field: field, message: label + " cannot be negative." };
    if (parsed.value > MAX_MONEY) return { field: field, message: label + " is too large to estimate here." };
    return null;
  }

  function readMoney(input, field, label, allowEmpty) {
    var parsed = parseNumber(input[field]);
    var error = moneyError(field, label, parsed, allowEmpty);
    return { error: error, empty: parsed.empty, value: parsed.ok ? parsed.value : null };
  }

  function readUnitAmount(input, field, unitField, label) {
    var money = readMoney(input, field, label, true);
    if (money.error) return money;
    var unit = input[unitField] == null || input[unitField] === "" ? "year" : input[unitField];
    if (unit !== "month" && unit !== "year") {
      return { error: { field: unitField, message: label + " needs a monthly or annual unit." }, value: null, annual: null, unit: null, empty: money.empty };
    }
    var annual = annualize(money.value, unit);
    if (!finite(annual)) {
      return { error: { field: field, message: label + " could not be converted." }, value: null, annual: null, unit: unit, empty: money.empty };
    }
    return { error: null, value: money.value, annual: annual, unit: unit, empty: money.empty };
  }

  function readPercent(input, field, label) {
    var parsed = parseNumber(input[field]);
    if (!parsed.ok) return { error: { field: field, message: label + " needs a plain number." }, value: null, ratio: null, empty: false };
    if (parsed.value < 0 || parsed.value > 100) {
      return { error: { field: field, message: label + " must be from 0 to 100." }, value: null, ratio: null, empty: parsed.empty };
    }
    return { error: null, value: parsed.value, ratio: parsed.value / 100, empty: parsed.empty };
  }

  function blankSlate(input) {
    var keys = [
      "purchase", "downPayment", "ratePct", "termYears", "closingCosts", "rehab", "otherUpfront",
      "rent", "otherIncome", "vacancyPct", "taxes", "insurance", "ownerUtilities", "hoa",
      "maintenance", "otherOperating", "managementPct", "mortgageInsurance", "capexReserve",
      "compLow", "compTypical", "compHigh"
    ];
    for (var i = 0; i < keys.length; i++) {
      var parsed = parseNumber(input[keys[i]]);
      if (!parsed.ok || !parsed.empty) return false;
    }
    return true;
  }

  function push(errors, error) {
    if (error) errors.push(error);
  }

  function analyze(input) {
    var source = input || {};
    if (blankSlate(source)) {
      return { ok: false, idle: true, errors: [], warnings: [], results: null };
    }

    var errors = [];
    var warnings = [];
    var purchase = readMoney(source, "purchase", "Purchase price", false);
    var down = readMoney(source, "downPayment", "Down payment", false);
    var closing = readMoney(source, "closingCosts", "Closing costs", true);
    var rehab = readMoney(source, "rehab", "Rehab", true);
    var upfront = readMoney(source, "otherUpfront", "Other upfront cash", true);
    push(errors, purchase.error);
    push(errors, down.error);
    push(errors, closing.error);
    push(errors, rehab.error);
    push(errors, upfront.error);

    var rate = parseNumber(source.ratePct);
    var term = parseNumber(source.termYears);
    if (!rate.ok) push(errors, { field: "ratePct", message: "Interest rate needs a plain number. Use 0 for a zero-interest loan." });
    else if (rate.value < 0 || rate.value > 100) push(errors, { field: "ratePct", message: "Interest rate must be from 0 to 100." });
    if (!term.ok) push(errors, { field: "termYears", message: "Loan term needs a whole number of years." });
    else if (term.value < 0 || term.value > MAX_YEARS) push(errors, { field: "termYears", message: "Loan term must be from 0 to " + MAX_YEARS + " years." });
    else if (!term.empty && Math.round(term.value) !== term.value) {
      push(errors, { field: "termYears", message: "Loan term needs a whole number of years." });
    }

    var rent = readUnitAmount(source, "rent", "rentUnit", "Scheduled rent");
    var otherIncome = readUnitAmount(source, "otherIncome", "otherIncomeUnit", "Other income");
    var taxes = readUnitAmount(source, "taxes", "taxesUnit", "Property taxes");
    var insurance = readUnitAmount(source, "insurance", "insuranceUnit", "Insurance");
    var utilities = readUnitAmount(source, "ownerUtilities", "ownerUtilitiesUnit", "Owner-paid utilities");
    var hoa = readUnitAmount(source, "hoa", "hoaUnit", "HOA dues");
    var maintenance = readUnitAmount(source, "maintenance", "maintenanceUnit", "Recurring maintenance");
    var otherOperating = readUnitAmount(source, "otherOperating", "otherOperatingUnit", "Other operating costs");
    var mortgageInsurance = readUnitAmount(source, "mortgageInsurance", "mortgageInsuranceUnit", "Mortgage insurance");
    var capex = readUnitAmount(source, "capexReserve", "capexReserveUnit", "Capital reserve");
    [rent, otherIncome, taxes, insurance, utilities, hoa, maintenance, otherOperating, mortgageInsurance, capex].forEach(function (item) {
      push(errors, item.error);
    });

    var vacancy = readPercent(source, "vacancyPct", "Vacancy");
    var management = readPercent(source, "managementPct", "Management");
    push(errors, vacancy.error);
    push(errors, management.error);

    var comps = {
      low: readMoney(source, "compLow", "Low comparable rent", true),
      typical: readMoney(source, "compTypical", "Typical comparable rent", true),
      high: readMoney(source, "compHigh", "High comparable rent", true)
    };
    push(errors, comps.low.error);
    push(errors, comps.typical.error);
    push(errors, comps.high.error);

    var loan = null;
    if (!purchase.error && !down.error) {
      if (down.value > purchase.value) {
        push(errors, { field: "downPayment", message: "Down payment cannot be more than the purchase price. Put extra cash in closing, rehab, or other upfront cash." });
      } else {
        loan = purchase.value - down.value;
      }
    }

    if (loan > 0) {
      if (rate.ok && rate.empty) push(errors, { field: "ratePct", message: "Enter an interest rate. Use 0 for a zero-interest loan." });
      if (term.ok && (term.empty || term.value === 0)) {
        push(errors, { field: "termYears", message: "Enter a loan term of at least 1 year, or set the down payment equal to the purchase price for a cash purchase." });
      }
    }

    if (errors.length) {
      return { ok: false, idle: false, errors: errors, warnings: warnings, results: null };
    }

    var payment = monthlyPayment(loan, rate.empty ? 0 : rate.value, term.empty ? 0 : term.value);
    if (payment == null) {
      return {
        ok: false,
        idle: false,
        errors: [{ field: "termYears", message: "The loan payment could not be calculated from these inputs." }],
        warnings: warnings,
        results: null
      };
    }

    var debtService = payment * 12;
    var cashInvested = down.value + closing.value + rehab.value + upfront.value;
    var scheduledRent = rent.annual;
    var vacancyLoss = vacancy.ratio * scheduledRent;
    var collectedRent = scheduledRent - vacancyLoss;
    var managementCost = management.ratio * collectedRent;
    var effectiveIncome = collectedRent + otherIncome.annual;
    var operatingExpenses = taxes.annual + insurance.annual + utilities.annual + hoa.annual + maintenance.annual + otherOperating.annual + managementCost;
    var noi = effectiveIncome - operatingExpenses;
    var cashFlow = noi - debtService - mortgageInsurance.annual - capex.annual;

    if (![debtService, cashInvested, scheduledRent, vacancyLoss, collectedRent, managementCost, effectiveIncome, operatingExpenses, noi, cashFlow].every(finite)) {
      return {
        ok: false,
        idle: false,
        errors: [{ field: "purchase", message: "These inputs did not produce a usable estimate." }],
        warnings: warnings,
        results: null
      };
    }

    var fixedOperating = operatingExpenses - managementCost;
    var share = (1 - vacancy.ratio) * (1 - management.ratio);
    var neededAfterHaircut = fixedOperating + debtService + mortgageInsurance.annual + capex.annual - otherIncome.annual;
    var breakEven = { status: "rent", annualScheduledRent: null, monthlyScheduledRent: null, message: "" };

    if (!(share > 0)) {
      if (neededAfterHaircut <= 0) {
        breakEven.status = "already";
        breakEven.annualScheduledRent = 0;
        breakEven.monthlyScheduledRent = 0;
        breakEven.message = "Scheduled rent does not add cash at this vacancy and management rate. Other income already covers operating costs, debt service, mortgage insurance, and the capital reserve. Break-even scheduled rent is $0. That is not a market rent.";
      } else {
        breakEven.status = "impossible";
        breakEven.message = "Break-even rent is impossible with these percentages. Vacancy and management leave no share of rent to pay the remaining costs. Lower a percentage or a cost. This is not a rent to charge.";
      }
    } else if (neededAfterHaircut <= 0) {
      breakEven.status = "already";
      breakEven.annualScheduledRent = 0;
      breakEven.monthlyScheduledRent = 0;
      breakEven.message = "Other income already covers operating costs, debt service, mortgage insurance, and the capital reserve. Break-even scheduled rent is $0. That is not a market rent.";
    } else {
      var annualRent = neededAfterHaircut / share;
      if (!finite(annualRent)) {
        breakEven.status = "impossible";
        breakEven.message = "Break-even rent is impossible with these inputs. This is not a rent to charge.";
      } else {
        breakEven.annualScheduledRent = annualRent;
        breakEven.monthlyScheduledRent = annualRent / 12;
        breakEven.message = "This is the scheduled rent that makes cash flow about $0 after vacancy, management, operating costs, debt service, mortgage insurance, and the capital reserve. It is not a suggested rent and not a comparable.";
      }
    }

    var cashOnCash;
    if (!(cashInvested > 0)) {
      cashOnCash = {
        status: "undefined",
        ratio: null,
        message: "Cash-on-cash is not defined because cash invested is $0. Divide-by-zero is left blank on purpose."
      };
    } else {
      var ratio = cashFlow / cashInvested;
      cashOnCash = finite(ratio)
        ? { status: "ratio", ratio: ratio, message: "Annual cash flow divided by cash actually invested." }
        : { status: "undefined", ratio: null, message: "Cash-on-cash could not be calculated." };
    }

    if (vacancy.empty) warnings.push("Vacancy was left blank and counted as 0%.");
    if (management.empty) warnings.push("Management was left blank and counted as 0%.");
    if (rate.empty && loan === 0) warnings.push("Interest rate was left blank. There is no loan, so the rate is not used.");
    if (loan === 0) warnings.push("This is a cash purchase. Debt service is $0. Taxes and insurance are still counted if you entered them.");

    var enteredComps = [];
    [["low", "Low"], ["typical", "Typical"], ["high", "High"]].forEach(function (pair) {
      var item = comps[pair[0]];
      if (!item.empty) enteredComps.push({ key: pair[0], label: pair[1], monthlyRent: item.value });
    });
    if (!comps.low.empty && !comps.high.empty && comps.low.value > comps.high.value) {
      warnings.push("The low comparable rent is higher than the high comparable rent. The worksheet still uses the numbers you typed.");
    }

    return {
      ok: true,
      idle: false,
      errors: [],
      warnings: warnings,
      results: {
        loan: loan,
        monthlyPrincipalInterest: payment,
        annualDebtService: debtService,
        cashInvested: cashInvested,
        scheduledRent: scheduledRent,
        vacancyLoss: vacancyLoss,
        collectedRent: collectedRent,
        otherIncome: otherIncome.annual,
        effectiveIncome: effectiveIncome,
        managementCost: managementCost,
        fixedOperating: fixedOperating,
        operatingExpenses: operatingExpenses,
        noi: noi,
        mortgageInsurance: mortgageInsurance.annual,
        capexReserve: capex.annual,
        cashFlow: cashFlow,
        cashOnCash: cashOnCash,
        breakEven: breakEven,
        comparables: enteredComps,
        assumptions: [
          "Vacancy applies only to scheduled rent.",
          "Other income is counted in full. Lower it yourself if some of it will go uncollected.",
          "Collected rent means scheduled rent after vacancy.",
          "Management is a percent of collected rent, not of scheduled rent and not of other income.",
          "Operating costs are taxes, insurance, owner-paid utilities, HOA, recurring maintenance, other operating costs, and management.",
          "NOI equals effective income minus operating costs. It excludes debt service, mortgage insurance, and the capital reserve.",
          "The loan line is principal and interest only. Do not also enter taxes or insurance inside it.",
          "Cash flow equals NOI minus debt service, mortgage insurance, and the capital reserve.",
          "Cash invested equals down payment plus closing costs, rehab, and other upfront cash. The borrowed amount is not cash invested.",
          "Cash-on-cash equals annual cash flow divided by that cash invested.",
          "Break-even rent is a cash-flow zero, solved so percentage vacancy and management stay on the same basis. It is not a market recommendation."
        ]
      }
    };
  }

  return {
    EXAMPLE: EXAMPLE,
    MAX_YEARS: MAX_YEARS,
    parseNumber: parseNumber,
    monthlyPayment: monthlyPayment,
    roundCents: roundCents,
    analyze: analyze
  };
});
