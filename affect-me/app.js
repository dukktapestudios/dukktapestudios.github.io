"use strict";
// Everything runs in the browser from this site's own JSON files. No API calls, no keys, nothing stored.
const BOXES = {
 veterans:["I'm a veteran / military family","you served"], kids:["Kids in school","you have kids in school"],
 business:["I own a business","you run a business"], vehicle:["I have a vehicle","you drive"],
 farm:["Farm, rural land or animals","you have land or animals"], health:["Health care / insurance","you use health care"],
 disability:["Disability or benefits (SSDI, SSI, Medicaid, SNAP)","you get benefits"], guns:["Guns, hunting or fishing","you own guns or hunt"],
 taxes:["I pay income or sales taxes","you pay taxes"], utilities:["Utilities / energy bills","you pay utility bills"],
 seniors:["Senior or near retirement","you're near or in retirement"], work:["I work for wages","you work for wages"],
 college:["College / student loans","you deal with college costs"], justice:["Criminal justice / police","you care about policing and courts"],
 environment:["Environment / water","you care about water and land"], tech:["Internet, privacy & tech","you live online like everyone"],
 elections:["Elections & voting","you vote"]};
const HOME = {own:"you own your home", rent:"you rent"};
const LABEL = {veterans:"Veterans",own:"Homeowners",rent:"Renters",kids:"Schools",business:"Business",vehicle:"Vehicles",farm:"Farm & animals",health:"Health care",disability:"Disability & benefits",guns:"Guns & hunting",taxes:"Taxes",utilities:"Utilities",seniors:"Seniors",work:"Jobs & wages",college:"College",justice:"Justice",environment:"Environment",tech:"Tech & privacy",elections:"Elections"};
// One entry per profile answer. Each area names who mainly decides it. Bill links are a keyword match on title and official summary only.
const WATCH = {
 veterans:{title:"Veteran or military family", areas:[
  {area:"VA disability ratings and TDIU", level:"Federal", note:"Congress and the Department of Veterans Affairs set disability ratings and pay, including total disability based on individual unemployability (TDIU).", keys:["tdiu","disability compensation","disabled veteran","service-connected","veterans benefit","veterans benefits"]},
  {area:"VA health care funding", level:"Federal", note:"Congress funds VA hospitals, clinics, and care.", keys:["veterans health","veterans affairs","department of veterans affairs","va clinic"]},
  {area:"GI Bill and VR&E", level:"Federal", note:"Congress sets GI Bill education benefits and Veteran Readiness and Employment.", keys:["gi bill","vr&e","veteran readiness","montgomery gi","post-9/11"]}]},
 disability:{title:"Disability or benefits", areas:[
  {area:"SSDI funding and backlogs", level:"Federal", note:"Social Security runs disability insurance and the wait for a decision.", keys:["ssdi","social security disability","disability insurance","social security"]},
  {area:"SSI", level:"Federal", note:"Supplemental Security Income is a federal benefit. Some states add a supplement.", keys:["supplemental security income","ssi"]},
  {area:"Medicaid and SNAP", level:"State", note:"States run much of Medicaid and food assistance under federal rules.", keys:["medicaid","snap","food stamp"]}]},
 own:{title:"Homeowner", areas:[
  {area:"Property tax and assessments", level:"County", note:"Counties and other local governments assess property and send the bill. The state writes the rules they use.", keys:["property tax","homestead","prop tx","assessment"]},
  {area:"County and school referendums", level:"County", note:"Voters in a county or school district decide many tax and building questions.", keys:["referendum","school levy","tax levy"]},
  {area:"Homestead and assessment limits", level:"State", note:"The legislature sets exemptions and caps that change a home's taxable value.", keys:["homestead","assessment limit","property tax exemption"]}]},
 rent:{title:"Renter", areas:[
  {area:"Landlord, tenant, and eviction rules", level:"State", note:"The legislature sets most rules for leases, fees, and eviction.", keys:["landlord","tenant","eviction","lease"]},
  {area:"Local housing codes", level:"County", note:"Cities and counties inspect rentals and enforce housing codes.", keys:["housing code","rental inspection","building code"]},
  {area:"Federal housing programs", level:"Federal", note:"Congress funds housing vouchers and other rental aid.", keys:["housing voucher","section 8","rental assistance"]}]},
 business:{title:"Small business owner", areas:[
  {area:"Sales tax", level:"State", note:"The state sets the sales-tax rate and what is taxed. Some cities add a local piece.", keys:["sales tax","use tax"]},
  {area:"1099-K and payment reporting", level:"Federal", note:"Congress and the IRS set when card processors and payment apps must report income.", keys:["1099-k","1099","information return"]},
  {area:"Business licenses", level:"State", note:"The state, and often a city or county, decides who needs a license to operate.", keys:["business license","occupational license","professional license"]}]},
 farm:{title:"Farm, rural land, or animals", areas:[
  {area:"Land use", level:"County", note:"Counties and cities write zoning and land-use rules for farms and rural lots.", keys:["zoning","land use","farmland"]},
  {area:"Water", level:"State", note:"States set water-rights and water-quality rules. Local districts often deliver the water.", keys:["water right","drinking water","irrigation","groundwater"]},
  {area:"Propane and energy", level:"State", note:"State utility commissions and legislatures set many rules for electricity, gas, and propane.", keys:["propane","natural gas","rural electric","energy"]}]},
 college:{title:"Student", areas:[
  {area:"Student loans", level:"Federal", note:"Congress sets most student-loan rules and repayment plans.", keys:["student loan","student loans","loan forgiveness"]},
  {area:"Tuition and state scholarships", level:"State", note:"The legislature funds public colleges and state scholarship programs.", keys:["tuition","scholarship","higher education","community college"]}]},
 kids:{title:"Parent of a school-age child", areas:[
  {area:"School funding and rules", level:"State", note:"The legislature sets school funding and most statewide school rules.", keys:["school","student","teacher","pupil"]},
  {area:"School boards and local referendums", level:"County", note:"Local boards and ballot questions decide many school budgets and buildings.", keys:["school board","school referendum","school levy"]},
  {area:"Child care licensing", level:"State", note:"The state licenses child care and sets many of its rules.", keys:["child care","childcare","day care"]}]},
 guns:{title:"Gun owner or hunter", areas:[
  {area:"Purchase, carry, and storage rules", level:"State", note:"States write most rules for buying, carrying, and storing firearms.", keys:["firearm","concealed carry","foid","gun"]},
  {area:"Hunting and fishing seasons", level:"State", note:"The state sets seasons, licenses, and limits.", keys:["hunting","fishing","wildlife"]},
  {area:"Federal firearm and public-land statutes", level:"Federal", note:"Congress writes federal firearm statutes and rules for federal public land.", keys:["firearm","ammunition","public land"]}]},
 seniors:{title:"Retiree or near retirement", areas:[
  {area:"Social Security and Medicare", level:"Federal", note:"Congress sets Social Security and Medicare benefits and funding.", keys:["social security","medicare"]},
  {area:"State pensions", level:"State", note:"The legislature sets rules for public pensions.", keys:["pension","retirement system"]},
  {area:"Local senior tax relief", level:"County", note:"Counties often run senior property-tax relief under state law.", keys:["senior exemption","senior freeze","homestead"]}]},
 health:{title:"Health care", areas:[
  {area:"Health insurance rules", level:"State", note:"States regulate most insurance plans sold inside the state.", keys:["health insurance","insurance"]},
  {area:"Medicare and federal health funding", level:"Federal", note:"Congress funds Medicare and much of Medicaid.", keys:["medicare","medicaid"]},
  {area:"Hospital and clinic licensing", level:"State", note:"The state licenses hospitals and clinics.", keys:["hospital","clinic license"]}]},
 taxes:{title:"Income or sales taxes", areas:[
  {area:"Federal income tax", level:"Federal", note:"Congress writes the federal income-tax code.", keys:["income tax","internal revenue","irs"]},
  {area:"State income and sales tax", level:"State", note:"The legislature sets state income-tax and sales-tax rules.", keys:["income tax","sales tax","use tax"]}]},
 utilities:{title:"Utilities or energy bills", areas:[
  {area:"Electric and gas rates", level:"State", note:"A state commission usually reviews electric and gas rates.", keys:["electric","natural gas","utility rate","public utility"]},
  {area:"Local utility franchises", level:"County", note:"Cities and counties grant some utility franchises.", keys:["franchise","municipal utility"]}]},
 vehicle:{title:"Vehicle owner or driver", areas:[
  {area:"Driver licenses and traffic laws", level:"State", note:"The state issues licenses and writes traffic laws.", keys:["driver","traffic","vehicle","license plate"]},
  {area:"Fuel tax and highway funding", level:"Federal", note:"Congress taxes fuel and sends highway money to the states.", keys:["fuel tax","highway","gas tax"]}]},
 work:{title:"Wage earner", areas:[
  {area:"Federal wage and hour rules", level:"Federal", note:"Congress sets the federal minimum wage and overtime rules.", keys:["minimum wage","overtime","fair labor"]},
  {area:"State wages, leave, and unemployment", level:"State", note:"The legislature sets state wage rules, paid leave, and unemployment insurance.", keys:["minimum wage","unemployment","paid leave","wage"]}]},
 justice:{title:"Criminal justice", areas:[
  {area:"Policing and sentencing", level:"State", note:"The legislature writes most criminal laws and sentencing rules.", keys:["sentenc","criminal","police"]},
  {area:"County jails and sheriffs", level:"County", note:"Counties run jails and elect sheriffs.", keys:["sheriff","county jail","jail"]},
  {area:"Federal criminal law", level:"Federal", note:"Congress writes federal criminal statutes.", keys:["federal crime","sentencing commission"]}]},
 environment:{title:"Environment or water", areas:[
  {area:"Clean-air and clean-water statutes", level:"Federal", note:"Congress writes the main federal air and water statutes.", keys:["clean water","clean air","pollution"]},
  {area:"State permits", level:"State", note:"States issue many environmental permits.", keys:["permit","emission","environmental"]},
  {area:"Local flood and land rules", level:"County", note:"Counties and cities write flood, stormwater, and land rules.", keys:["flood","stormwater","zoning"]}]},
 tech:{title:"Internet, privacy, or tech", areas:[
  {area:"Broadband funding", level:"Federal", note:"Congress funds a large share of rural broadband programs.", keys:["broadband","internet"]},
  {area:"Data privacy", level:"State", note:"States write many consumer privacy rules.", keys:["privacy","data breach","biometric"]}]},
 elections:{title:"Elections and voting", areas:[
  {area:"Federal voting statutes", level:"Federal", note:"Congress writes federal voting and campaign-finance statutes.", keys:["voting rights","campaign finance","election"]},
  {area:"How elections are run", level:"State", note:"The state sets registration, ballots, and vote-counting rules.", keys:["election","voter","ballot"]},
  {area:"Local ballots and referendums", level:"County", note:"Counties run polling places and put local questions on the ballot.", keys:["polling","referendum","election judge"]}]}};
const WATCH_ORDER = ["veterans","disability","own","rent","business","farm","college","kids","guns","seniors","health","taxes","utilities","vehicle","work","justice","environment","tech","elections"];
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cache = {}; const load = p => cache[p] ??= fetch(p).then(r => { if (!r.ok) throw new Error(p); return r.json(); });
let CFG;
for (const [k, v] of Object.entries(BOXES)) $("#boxes").insertAdjacentHTML("beforeend", `<label><input type="checkbox" name="${k}"> ${esc(v[0])}</label>`);
// Shown wherever a state has no bills file yet. Goes away when that state gets bills (hasBills becomes true).
function pendingLabel(s) { return s && !s.hasBills ? `${s.name} bills coming soon` : ""; }
function showPending(code) {
  const note = $("#state-note"); if (!note) return;
  const text = CFG ? pendingLabel(CFG.states[code]) : "";
  note.hidden = !text; note.textContent = text;
}
load("data/config.json").then(c => { CFG = c;
  $("#state").innerHTML = Object.entries(c.states).sort((a,b)=>a[1].name.localeCompare(b[1].name))
    .map(([k, s]) => `<option value="${k}" ${k==="IL"?"selected":""}>${esc(pendingLabel(s) || s.name)}</option>`).join("");
  showPending($("#state").value);
}).catch(() => $("#out").innerHTML = `<div class="card">Couldn't load data. Open this site through a local server (see README).</div>`);
$("#state").addEventListener("change", () => showPending($("#state").value));

function firstSentences(s, n = 300) {
  s = (s || "").replace(/\s+/g, " ").trim(); if (!s) return "";
  const sent = s.match(/[^.!?]+[.!?]+(\s|$)/g) || [s]; let o = sent[0]; if (o.length < 120 && sent[1]) o += sent[1];
  return o.length > n ? o.slice(0, n - 3).replace(/\s\S*$/, "") + "…" : o;
}
function neutral(b) {
  const v = b.votes[b.votes.length - 1];
  if (!v) return b.law ? "Already law — read what it changes." : "Undecided — no floor vote yet. Read the summary first.";
  const share = v.yea / Math.max(1, v.yea + v.nay);
  if (share >= .8) return `Lean yes — it passed with broad support (${v.yea}–${v.nay}).`;
  if (share >= .6) return `Slight lean yes — most lawmakers backed it (${v.yea}–${v.nay}), but not all.`;
  if (share >= .4) return `Toss-up — lawmakers were split (${v.yea}–${v.nay}). Read it before deciding.`;
  return `Lean no — most lawmakers voted against it (${v.yea}–${v.nay}).`;
}
function score(b, prof, local) {
  const hits = b.topics.filter(t => prof.topics[t]);
  const days = b.date ? (Date.now() - Date.parse(b.date)) / 864e5 : 9999;
  const rec = days < 30 ? 3 : days < 120 ? 2 : days < 365 ? 1 : 0;
  return {hits, s: hits.length * 10 + (local ? 15 : 0) + rec + (b.votes.length ? 1 : 0)};
}
function billText(b) { return `${b.title || ""} ${b.summary || ""}`.toLowerCase(); }
function keyHit(text, key) {
  const k = key.toLowerCase();
  if (/\s/.test(k) || /\d/.test(k)) return text.includes(k);
  const body = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z0-9])${body}s?(?:[^a-z0-9]|$)`).test(text);
}
function watchBills(bills, keys) {
  const hits = bills.filter(b => keys.some(k => keyHit(billText(b), k)));
  hits.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const state = hits.filter(b => b.scope !== "fed").slice(0, 2);
  const fed = hits.filter(b => b.scope === "fed").slice(0, 2);
  const out = [];
  for (let i = 0; i < 2; i++) { if (state[i]) out.push(state[i]); if (fed[i]) out.push(fed[i]); }
  return out.slice(0, 3);
}
function watchSection(selected, bills, hasStateBills, stateName, shown) {
  const keys = WATCH_ORDER.filter(k => selected.includes(k) && WATCH[k]);
  const contacts = shown.map(([m, role]) => {
    const who = `${esc(m.name)} (${esc(role)})`;
    return m.url ? `<a href="${esc(m.url)}" target="_blank" rel="noopener">${who}</a>` : who;
  }).join("; ");
  const act = `<p class="nk"><span class="lbl">How to act.</span> Vote in primary elections and in local elections. Those races decide many of the offices that set taxes, schools, and state law. Contact the lawmakers listed above${contacts ? ": " + contacts : "."}</p>`;
  if (!keys.length) return `<section class="card" id="watch"><h2>What to watch</h2><p>Check the boxes that fit you, or set Home, to see policy areas worth following.</p>${act}</section>`;
  const items = keys.map(k => {
    const w = WATCH[k];
    const areas = w.areas.map(a => {
      const found = watchBills(bills, a.keys);
      const links = found.length ? found.map(b => `<a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.label)}</a> <span class="small dim">(${b.scope === "fed" ? "Federal" : esc(stateName)})</span>`).join("; ")
        : `<span class="dim">No bill in this loaded set uses these words yet.</span>`;
      return `<li><b>${esc(a.area)}</b> <span class="pill">${esc(a.level)}</span><p class="small">${esc(a.note)}</p><p class="small"><span class="lbl">Bills in this set:</span> ${links}</p></li>`;
    }).join("");
    return `<li class="watch-item"><h3>${esc(w.title)}</h3><ul class="areas">${areas}</ul></li>`;
  }).join("");
  const pending = hasStateBills ? "" : `<p class="nk">${esc(stateName)} bills coming soon, so the links below are federal bills only.</p>`;
  return `<section class="card" id="watch"><h2>What to watch</h2>
   <p class="small dim">These are policy areas tied to what you marked. The label is the level of government that mainly decides that area. Links are bills already loaded for ${esc(stateName)} and for Congress whose title or official summary contains those words. This page does not rank outcomes.</p>
   ${pending}<ul class="watch">${items}</ul>${act}</section>`;
}
function voteRow(v, mine, getVote) {
  const reps = mine.filter(m => m.chamber === v.chamber || m.chamber === "council");
  const where = v.chamber === "house" ? "House" : v.chamber === "senate" ? "Senate" : v.chamber;
  const cells = reps.map(m => { const x = getVote(m, v); const lab = !x ? "Absent / not recorded" : x;
    return `<span class="v ${esc(x || "")}">${esc(m.name)}: ${esc(lab)}</span>`; }).join("");
  return `<div class="small dim">${esc(where)} · ${esc(v.date)} · ${esc(v.motion || "")} · total ${v.yea}–${v.nay}${v.pdf ? ` · <a href="${esc(v.pdf)}" target="_blank" rel="noopener">roll call</a>` : ""}</div>
   <div>${cells || `<span class="v">Your ${esc(where)} member wasn't in this chamber's vote</span>`}</div>`;
}
$("#f").addEventListener("submit", async e => { e.preventDefault();
  const fd = new FormData(e.target); const code = fd.get("state"); const zip = (fd.get("zip") || "").trim();
  const topics = {}; const selected = [];
  for (const k of Object.keys(BOXES)) if (fd.get(k)) { topics[k] = BOXES[k][1]; selected.push(k); }
  const home = fd.get("home"); if (home) { topics[home] = HOME[home]; selected.push(home); if (home === "own") topics.taxes ??= "you pay property tax"; }
  const prof = {code, zip, county: (fd.get("county") || "").trim().replace(/\s+county$/i, ""), city: (fd.get("city") || "").trim(), topics};
  const out = $("#out"); out.innerHTML = `<div class="card">Loading…</div>`;
  if (!CFG || !CFG.states[code]) { out.innerHTML = `<div class="card">State list is still loading. Try again in a moment.</div>`; return; }
  const S = CFG.states[code]; const base = `data/states/${code}/`;
  showPending(code);
  let zips, mem, usMem, usB, stB;
  try {
    [zips, mem, usMem, usB, stB] = await Promise.all([load(base + "zips.json"), load(base + "members.json"),
      load(`data/us/members_${code}.json`).catch(() => ({members: [], votes: {}})), load("data/us/bills.json"),
      S.hasBills ? load(base + "bills.json").catch(() => null) : null]);
  } catch (err) {
    out.innerHTML = `<div class="card">${esc(pendingLabel(S) || "Couldn't load data for this state.")}</div>`;
    return;
  }
  const hasStateBills = !!(stB && stB.bills && stB.bills.length);
  const z = zips.zips[zip];
  const cd = z?.cd[0]?.[0], hd = z?.house?.[0]?.[0], sd = z?.senate?.[0]?.[0];
  const place = d => (d === 0 || d === "0") ? "At large" : `District ${d}`;
  const myUS = usMem.members.filter(m => m.chamber === "senate" || (z && String(m.district) === String(cd)));
  const mySt = z ? mem.members.filter(m => (m.chamber === "house" && m.district === hd) || (m.chamber === "senate" && m.district === sd) || (S.unicameral && m.district === sd) || m.seat) : [];
  const shown = [...myUS.map(m => [m, m.chamber === "senate" ? "U.S. Senator" : `U.S. Rep., ${place(m.district)}`]),
    ...mySt.map(m => [m, `${m.chamber === "senate" ? S.upperName : S.lowerName}, ${place(m.district)}`])];
  let h = `<section class="card"><h2>Your lawmakers</h2>${z ? "" : `<p class="dim">ZIP ${esc(zip)} wasn't found in ${esc(S.name)}'s Census ZIP list, so only your U.S. Senators are shown and vote lookups are limited.</p>`}
   ${z && (z.cd.length > 1 || z.house.length > 1 || z.senate.length > 1) ? `<p class="small dim">Your ZIP crosses district lines; I used the district that covers most of it.</p>` : ""}
   <div class="reps">${shown.map(([m, r]) => `<div class="rep"><b>${esc(m.name)}</b> (${esc((m.party || "?")[0])})<br><span class="small dim">${esc(r)}</span></div>`).join("")}</div></section>`;
  const terms = [prof.county && prof.county.length > 2 ? new RegExp(`\\b${prof.county.replace(/[^\w ]/g, "")}\\b(?=\\s+county|\\s+co\\b)`, "i") : null,
                 prof.city && prof.city.length > 2 ? new RegExp(`\\b${prof.city.replace(/[^\w ]/g, "")}\\b`, "i") : null].filter(Boolean);
  const loadedBills = [...usB.bills, ...(hasStateBills ? stB.bills : [])];
  h += watchSection(selected, loadedBills, hasStateBills, S.name, shown);
  const all = loadedBills.map(b => {
    const local = b.scope === "state" && terms.some(r => r.test(b.title + " " + b.summary));
    return {b, local, ...score(b, prof, local)}; }).filter(x => x.hits.length || x.local).sort((a, b) => b.s - a.s);
  h += `<section class="card"><h2>What affects you (${all.length})</h2>
   ${Object.keys(topics).length ? "" : `<p>Check a few boxes so I can match laws to you.</p>`}
   ${hasStateBills ? "" : `<p class="nk">${esc(S.name)} bills coming soon. Federal bills and your lawmakers are shown for now.</p>`}
   <p class="small dim">“Local” means a state bill that names your county or town. There's no county-board or city-council data in this site yet.</p></section>`;
  for (const {b, hits, local} of all.slice(0, 300)) {
    const reasons = [...new Set(hits.map(t => topics[t]))];
    const fedV = (m, v) => usMem.votes?.[m.bioguide]?.[v.key];
    const stV = (m, v) => v.byMember?.[m.id];
    const mine = b.scope === "fed" ? myUS : mySt;
    const changes = firstSentences(b.summary) || `Only the short title is available so far: “${b.title}”. Open the official page for details.`;
    h += `<article class="card bill">
     <span class="pill ${b.scope}">${b.scope === "fed" ? "Federal" : esc(S.name)}</span>${local ? `<span class="pill local">Local: names your ${esc(prof.county ? "county" : "town")}</span>` : ""}${hits.map(t => `<span class="pill">${esc(LABEL[t])}</span>`).join("")}
     <h3>${esc(b.label)} — ${esc(b.title)}</h3>
     <p><span class="lbl">What it is:</span> ${b.law ? `Law (${esc(b.law)}). ` : "Bill. "}${esc(b.status)}${b.date ? ` <span class="dim">(${esc(b.date)})</span>` : ""}</p>
     <p><span class="lbl">What it changes for you:</span> ${esc(changes)}</p>
     <p><span class="lbl">Why it matters:</span> ${reasons.length ? `Because ${esc(reasons.slice(0, 3).join(", "))}.` : ""} ${local ? "It names where you live." : ""}</p>
     <p class="nk"><span class="lbl">If you knew nothing else</span> <span class="small dim">(auto-generated from the vote count — not advice)</span>: ${esc(neutral(b))}</p>
     <div><span class="lbl">How your lawmakers voted:</span> ${b.votes.length ? b.votes.map(v => voteRow(v, mine, b.scope === "fed" ? fedV : stV)).join("") : `<span class="dim">No floor roll call in this data yet.</span>`}</div>
     <p><a href="${esc(b.url)}" target="_blank" rel="noopener">Read the official bill page →</a> <span class="small dim">Summary: ${esc(b.summarySource)}</span></p></article>`;
  }
  if (all.length > 300) h += `<p class="dim">Showing the top 300 matches.</p>`;
  out.innerHTML = h; out.scrollIntoView({behavior: "smooth"});
});
