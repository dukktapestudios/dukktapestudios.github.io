/* Generic checks for published personal-location patterns.
   This file does not list any real household address or personal name.
   Public agency pages and public-records datasets are allowlisted. */
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var allowStreet = {
  "usda-504/index.html": true,
  "veterans-day/data.json": true,
  "hypocrisy-tracker/data.json": true
};
var street = /\b\d{2,6}\s+[A-Za-z0-9.'’-]{2,}(?:\s+[A-Za-z0-9.'’-]{2,}){0,4}\s+(?:Rd|Road|St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Ln|Lane|Ct|Court|Way|Trail)\b/i;
var hostname = /\bDESKTOP-[A-Z0-9]+\b/;
var zipField = /<(?:input|textarea)\b[^>]*(?:name|id)=["'][^"']*zip[^"']*["'][^>]*>/gi;
var zipValue = /\b(?:value|placeholder)=["']\d{5}["']/i;
var failed = 0;

function walk(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
    if (entry.name === ".git" || entry.name === "node_modules") return;
    var full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full.indexOf(path.join("affect-me", "data")) !== -1) return;
      walk(full, out);
      return;
    }
    if (!/\.(html|js|md|json|xml|css|txt|svg)$/.test(entry.name)) return;
    out.push(full);
  });
}

var files = [];
walk(root, files);
files.forEach(function (full) {
  var rel = path.relative(root, full).split(path.sep).join("/");
  var text = fs.readFileSync(full, "utf8");
  if (!allowStreet[rel] && street.test(text)) {
    failed += 1;
    console.error("street-like line in " + rel);
  }
  if (hostname.test(text)) {
    failed += 1;
    console.error("computer hostname in " + rel);
  }
  if (rel.endsWith(".html")) {
    var tags = text.match(zipField) || [];
    tags.forEach(function (tag) {
      if (zipValue.test(tag)) {
        failed += 1;
        console.error("ZIP field has a numeric default in " + rel);
      }
    });
  }
});

if (failed) {
  console.error(failed + " privacy-guard findings");
  process.exit(1);
}
console.log("Privacy guard passed.");
