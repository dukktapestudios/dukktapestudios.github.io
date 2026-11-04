"use strict";
// All processing happens here in the browser. No storage, no network calls except loading this site's own JSON files.
const TOPIC_LABEL = {veterans:"Veterans", taxes:"Taxes", housing:"Housing & property", agriculture:"Farm, rural & animals", firearms:"Guns & hunting",
  disability:"Disability & benefits", smallbiz:"Small business", education:"Schools & education", healthcare:"Health care"};
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let CFG, cache = {};
const load = async p => cache[p] ??= fetch(p).then(r => { if (!r.ok) throw new Error(p); return r.json(); });

function profileTopics(p) {
  const t = {}; const add = (k, why) => (t[k] ??= []).push(why);
  if (p.veteran) { add("veterans", "you're a veteran"); add("healthcare", "VA health care touches veterans"); }
  if (p.veteran && p.rating) add("disability", `you have a VA rating (${p.rating})`);
  if (p.disability) { add("disability", "you get disability benefits"); add("healthcare", "you get disability benefits"); }
  if (p.home === "own") { add("housing", "you own your home"); add("taxes", "you pay property tax"); }
  if (p.home === "rent") add("housing", "you rent");
  if (p.rural) add("agriculture", "you live rural / keep animals");
  if (p.gun) add("firearms", "you own a gun / hunt");
  if (p.smallbiz || p.job === "self") { add("smallbiz", "you run a small business"); add("taxes", "you're self-employed"); }
  if (p.kids === "yes") add("education", "you have kids at home");
  if (p.income) add("taxes", "taxes depend on income");
  if (p.age === "65+" || p.age === "55-64") add("healthcare", "of your age range");
  if (p.job === "public") add("disability", "public-employee disability/pension laws");
  return t;
}
// "Simplified" = the first 1-2 sentences of the OFFICIAL summary, lightly shortened. Never new facts.
function simplify(s) {
  s = s.replace(/^This (act|bill|joint resolution)\s/i, "It ").replace(/\s+/g, " ").trim();
  const sent = s.match(/[^.!?]+[.!?]+(\s|$)/g) || [s]; let out = sent[0];
  if (out.length < 140 && sent[1]) out += sent[1];
  return out.length > 360 ? out.slice(0, 357).replace(/\s\S*$/, "") + "…" : out;
}
function whyLine(bill, pt) {
  const hits = bill.topics.filter(t => pt[t]);
  const reasons = [...new Set(hits.flatMap(t => pt[t]))];
  return `For someone like you: ${reasons.slice(0, 3).join(", ")} — and this ${bill.law || bill.publicAct ? "law" : "bill"} is about ${hits.slice(0, 3).map(t => TOPIC_LABEL[t].toLowerCase()).join(", ")}${hits.length > 3 ? " and more" : ""}. Read the official summary below for exactly what it changes.`;
}
function distPicker(kind, list, chosen) {
  if (list.length < 2) return "";
  return `<select class="dist" data-kind="${kind}">${list.map(([d, s]) => `<option value="${d}" ${d === chosen ? "selected" : ""}>District ${d} (${Math.round(s * 100)}% of ZIP)</option>`).join("")}</select>`;
}
let state = {};
async function run(p) {
  const out = $("#out"); out.innerHTML = `<div class="card">Loading…</div>`;
  const st = Object.entries(CFG.states).find(([k, s]) => s.enabled && s.zipPrefixes.includes(p.zip.slice(0, 3)));
  if (!st) { out.innerHTML = `<div class="card">That ZIP isn't in a state that's turned on yet. Right now: ${Object.values(CFG.states).filter(s => s.enabled).map(s => s.name).join(", ")}.</div>`; return; }
  const [code, S] = st; const F = S.files;
  const [zips, mem, bills, usMem, usBills] = await Promise.all([F.zips, F.members, F.bills, F.usMembers, F.usBills].map(load));
  $("#gen").textContent = `State data built ${bills.generated}; federal data built ${usBills.generated}.`;
  const z = zips.zips[p.zip];
  if (!z) { out.innerHTML = `<div class="card">I couldn't find ZIP ${esc(p.zip)} in the Census ZIP list for ${S.name}. Check it and try again.</div>`; return; }
  state = {p, code, S, z, mem, bills, usMem, usBills, pick: {cd: z.cd[0]?.[0], house: z.house[0]?.[0], senate: z.senate[0]?.[0]}, scope: "all", topic: "all"};
  render();
}
function render() {
  const {p, S, z, mem, bills, usMem, usBills, pick} = state; const pt = profileTopics(p);
  const myUS = usMem.members.filter(m => m.chamber === "senate" || String(m.district) === pick.cd);
  const mySt = mem.members.filter(m => (m.chamber === "house" && m.district === pick.house) || (m.chamber === "senate" && m.district === pick.senate));
  const rep = (m, role, extra = "") => `<div class="rep"><b>${esc(m.name)} <span class="party-${(m.party || "")[0]}">(${esc((m.party || "")[0])})</span></b><small>${role}${extra}</small><br>${m.url ? `<a href="${esc(m.url)}" target="_blank" rel="noopener">Official page</a>` : ""}</div>`;
  const multi = z.cd.length > 1 || z.house.length > 1 || z.senate.length > 1;
  let h = `<section class="card"><h2>Your lawmakers</h2>
   ${multi ? `<p class="dim">Your ZIP crosses district lines, so I picked the district covering most of it. Change it below if needed, or check your exact address on the <a href="https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?form" target="_blank" rel="noopener">Census lookup</a> (opens their site).</p>` : ""}
   <div class="reps">
   ${myUS.filter(m => m.chamber === "senate").map(m => rep(m, "U.S. Senator")).join("")}
   ${myUS.filter(m => m.chamber === "house").map(m => rep(m, `U.S. Representative, District ${m.district}`, "<br>" + distPicker("cd", z.cd, pick.cd))).join("")}
   ${mySt.filter(m => m.chamber === "senate").map(m => rep(m, `${S.upperName}, District ${m.district}`, "<br>" + distPicker("senate", z.senate, pick.senate))).join("")}
   ${mySt.filter(m => m.chamber === "house").map(m => rep(m, `${S.lowerName}, District ${m.district}`, "<br>" + distPicker("house", z.house, pick.house))).join("")}
   </div></section>`;
  const fed = usBills.bills.map(b => ({...b, scope: "fed"})), stb = bills.bills.map(b => ({...b, scope: "state"}));
  let all = [...fed, ...stb].filter(b => b.topics.some(t => pt[t]));
  const topicsHit = [...new Set(all.flatMap(b => b.topics.filter(t => pt[t])))];
  all = all.filter(b => (state.scope === "all" || b.scope === state.scope) && (state.topic === "all" || b.topics.includes(state.topic)));
  all.sort((a, b) => b.topics.filter(t => pt[t]).length - a.topics.filter(t => pt[t]).length);
  const chip = (k, v, label) => `<button class="chip ${state[k] === v ? "on" : ""}" data-k="${k}" data-v="${v}">${label}</button>`;
  h += `<section class="card"><h2>Laws that touch your life (${all.length})</h2>
   ${Object.keys(pt).length ? "" : `<p>Tick a few boxes above so I can match laws to you.</p>`}
   <div class="tabs">${chip("scope", "all", "All")}${chip("scope", "fed", "Federal")}${chip("scope", "state", S.name)}</div>
   <div class="tabs">${chip("topic", "all", "All topics")}${topicsHit.map(t => chip("topic", t, TOPIC_LABEL[t])).join("")}</div>`;
  for (const b of all) {
    const myIds = b.scope === "fed" ? myUS.map(m => [m.bioguide, m]) : mySt.map(m => [m.id, m]);
    const votes = b.votes.map(v => {
      const vb = b.scope === "fed" ? v.votes : v.byMember;
      const mine = myIds.filter(([id, m]) => (b.scope === "fed" || m.chamber === v.chamber) && vb[id]).map(([id, m]) => `<span class="v ${vb[id]}">${esc(m.name.split(" ").slice(-1)[0])}: ${vb[id]}</span>`).join("");
      const where = v.chamber === "house" ? (b.scope === "fed" ? "U.S. House" : "IL House") : (b.scope === "fed" ? "U.S. Senate" : "IL Senate");
      const what = b.scope === "fed" ? v.question : (v.motion || "Floor vote");
      return `<div class="dim">${where}, ${esc(v.date)} — ${esc(what)} (${v.yea}–${v.nay}) ${v.pdf ? `<a href="${esc(v.pdf)}" target="_blank" rel="noopener">roll call</a>` : ""}</div><div class="votes">${mine || `<span class="v">None of your lawmakers recorded on this vote</span>`}</div>`;
    }).join("");
    h += `<article class="bill">
      ${b.topics.map(t => `<span class="tag">${TOPIC_LABEL[t]}</span>`).join("")}<span class="tag">${b.scope === "fed" ? "Federal" : S.name}</span>
      <h3><a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.label)}</a> · ${esc(b.title || b.shortTitle)}</h3>
      <div class="dim">${esc(b.law || b.publicAct || "Not law yet")} · ${esc(b.latestAction)}</div>
      <div class="why">${esc(whyLine(b, pt))}</div>
      <div class="simp"><span class="lbl">Simplified from the official summary</span><br>${esc(simplify(b.officialSummary))}</div>
      <details><summary>Full official summary (${esc(b.summarySource)})</summary><p>${esc(b.officialSummary)}</p></details>
      <div class="vblock"><span class="lbl">How your lawmakers voted</span>${votes || `<div class="dim">No floor roll call found.</div>`}</div>
    </article>`;
  }
  h += `</section>`;
  $("#out").innerHTML = h;
}
document.addEventListener("click", e => { const c = e.target.closest(".chip"); if (c) { state[c.dataset.k] = c.dataset.v; render(); } });
document.addEventListener("change", e => { const s = e.target.closest("select.dist"); if (s) { state.pick[s.dataset.kind] = s.value; render(); } });
$("#f").addEventListener("submit", e => {
  e.preventDefault(); const fd = new FormData(e.target), g = k => (fd.get(k) || "").toString().trim();
  run({zip: g("zip"), age: g("age"), income: g("income"), home: g("home"), job: g("job"), kids: g("kids"), rating: g("rating"),
       veteran: !!fd.get("veteran"), disability: !!fd.get("disability"), rural: !!fd.get("rural"), gun: !!fd.get("gun"), smallbiz: !!fd.get("smallbiz")})
  .catch(err => $("#out").innerHTML = `<div class="card">Something went wrong loading the data (${esc(err.message)}).</div>`);
});
load("config/states.json").then(c => CFG = c);
