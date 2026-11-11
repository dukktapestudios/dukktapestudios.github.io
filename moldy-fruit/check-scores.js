/* Recompute every mold level from data.json with the published rule. */
var fs = require("fs");
var path = require("path");
var score = require("./score.js");

var data = JSON.parse(fs.readFileSync(path.join(__dirname, "data.json"), "utf8"));
var failed = 0;

function assert(cond, message) {
  if (!cond) {
    failed += 1;
    console.error("FAIL " + message);
  }
}

assert(score.MAX.pac_share === 50 && score.MAX.missed_votes === 35 && score.MAX.ethics === 15, "weights");
assert(score.MAX.pac_share + score.MAX.missed_votes + score.MAX.ethics === 100, "weights sum to 100");
assert(data.scoring.pac_max === 50 && data.scoring.missed_max === 35 && data.scoring.ethics_max === 15, "data weights");
assert(data.scoring.missed_multiplier === 3.5, "multiplier");
assert(data.scoring.ethics_points.none === 0 && data.scoring.ethics_points.finding === 8 && data.scoring.ethics_points.sanction === 15, "ethics tiers");

assert(score.scorePolitician({ pac: { other_committee: "80", total_receipts: "100" }, votes: { missed: 20, eligible: 100 }, ethics: { tier: "sanction" } }).mold === 100, "caps at 100");
assert(score.scorePolitician({ pac: { other_committee: "0", total_receipts: "100" }, votes: { missed: 0, eligible: 100 }, ethics: { tier: "none" } }).mold === 0, "clean record is 0");
var partial = score.scorePolitician({ pac: { other_committee: "20", total_receipts: "100" }, votes: { missed: null, eligible: 0 }, ethics: { tier: "none" } });
assert(partial.mold === 31 && partial.complete === false, "missing votes renormalize 20 of 65 to 31");
assert(score.scorePolitician({ ethics: { tier: "no_data" } }).mold === null, "all missing stays no data");

var expected = {
  durbin: 25,
  duckworth: 29,
  bost: 56,
  budzinski: 37,
  casten: 34,
  lahood: 70
};

data.politicians.forEach(function (person) {
  var result = score.scorePolitician(person);
  var pac = result.parts[0];
  var missed = result.parts[1];
  var ethics = result.parts[2];
  console.log(person.id + " mold " + result.mold + " sum " + result.sum + " pac " + pac.points + " missed " + missed.points + " ethics " + ethics.points);
  assert(result.mold === expected[person.id], person.id + " mold " + result.mold + " expected " + expected[person.id]);
  assert(person.identity && person.identity.url && person.identity.fact, person.id + " identity source");
  assert(person.pac && person.pac.url && person.pac.fact && person.pac.retrieved === "2026-11-11", person.id + " pac source");
  assert(person.votes && person.votes.fact && person.votes.missed_roll_calls.length === person.votes.missed, person.id + " missed list length");
  assert(person.votes.denominator.length >= 1, person.id + " denominator");
  person.votes.denominator.forEach(function (item) {
    assert(item.url && item.fact, person.id + " denominator fact");
  });
  person.votes.missed_roll_calls.forEach(function (item) {
    assert(item.url && item.fact && item.recorded === "Not Voting", person.id + " roll call " + item.url);
  });
  assert(person.ethics && person.ethics.tier === "none" && ethics.points === 0, person.id + " ethics zero");
  person.ethics.sources.forEach(function (item) {
    assert(item.url && item.fact, person.id + " ethics source");
  });
  assert(person.party === "Democrat" || person.party === "Republican", person.id + " party label");
});

var blob = fs.readFileSync(path.join(__dirname, "data.json"), "utf8") + fs.readFileSync(path.join(__dirname, "index.html"), "utf8") + fs.readFileSync(path.join(__dirname, "app.js"), "utf8") + fs.readFileSync(path.join(__dirname, "methodology.html"), "utf8");
assert(blob.indexOf("DEMO_KEY") === -1 && blob.indexOf("api_key") === -1, "no API key in the page");
assert(blob.indexOf("no data") !== -1, "page can show no data");

if (failed) {
  console.error(failed + " score checks failed");
  process.exit(1);
}
console.log("Score checks passed.");
