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
  const topics = {}; for (const k of Object.keys(BOXES)) if (fd.get(k)) topics[k] = BOXES[k][1];
  const home = fd.get("home"); if (home) { topics[home] = HOME[home]; if (home === "own") topics.taxes ??= "you pay property tax"; }
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
  let h = `<section class="card"><h2>Your lawmakers</h2>${z ? "" : `<p class="dim">ZIP ${esc(zip)} wasn't found in ${esc(S.name)}'s Census ZIP list, so only your U.S. Senators are shown and vote lookups are limited.</p>`}
   ${z && (z.cd.length > 1 || z.house.length > 1 || z.senate.length > 1) ? `<p class="small dim">Your ZIP crosses district lines; I used the district that covers most of it.</p>` : ""}
   <div class="reps">${[...myUS.map(m => [m, m.chamber === "senate" ? "U.S. Senator" : `U.S. Rep., ${place(m.district)}`]),
     ...mySt.map(m => [m, `${m.chamber === "senate" ? S.upperName : S.lowerName}, ${place(m.district)}`])]
     .map(([m, r]) => `<div class="rep"><b>${esc(m.name)}</b> (${esc((m.party || "?")[0])})<br><span class="small dim">${esc(r)}</span></div>`).join("")}</div></section>`;
  const terms = [prof.county && prof.county.length > 2 ? new RegExp(`\\b${prof.county.replace(/[^\w ]/g, "")}\\b(?=\\s+county|\\s+co\\b)`, "i") : null,
                 prof.city && prof.city.length > 2 ? new RegExp(`\\b${prof.city.replace(/[^\w ]/g, "")}\\b`, "i") : null].filter(Boolean);
  const all = [...usB.bills, ...(hasStateBills ? stB.bills : [])].map(b => {
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
