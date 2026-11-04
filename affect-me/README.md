# How Does It Affect Me? — Dukktape Studios
Laws in plain English — federal, state and local — matched to your life. Contact: dukktapestudios@gmail.com

## Run it
Data under `data/` is already built. This folder is the static site served at `/affect-me/`.
```
python3 -m http.server 8000
```
Open `http://localhost:8000/affect-me/` from the repo root (or serve this folder and open `/`).
`index.html` can't be double-clicked: browsers block loading the JSON files from `file://`.

`build.py` is not in this folder. It only merges data from local source paths and is not needed to serve the site.

A state with no bills (`hasBills: false` in `data/config.json`, and no `data/states/XX/bills.json`) shows **"{State} bills coming soon"** in the state list and as soon as that state is selected. Federal bills and lawmakers still load. Wyoming is the only one in that state right now. Adding its bills file and setting `hasBills` to true removes the note.

## Sources (read-only)
- `/workspace/affect-me/data/us/` : federal bills, members and per-member votes (119th Congress)
- `/workspace/affect-me/data/states/XX/` : members, ZIP→district tables, `bills_104.json` with roll calls
- `/workspace/dukktape-studios/il-bill-dashboard/data/bills.json` : 800 recent IL bills (titles only, no votes), merged into IL and deduped by bill number

## Checkbox → topic keywords (matched against official title + summary + subjects)
| Box | Keywords (sample) |
|---|---|
| Veteran | veteran, armed forces, military, national guard |
| Own home | property tax, homestead, mortgage, assessment (also adds Taxes) |
| Rent | landlord, tenant, rental, eviction, lease, housing |
| Kids in school | school, student, teacher, child care |
| Business | small business, commerce, sales tax, license |
| Vehicle | vehicle, driver, traffic, highway, toll, fuel, DUI |
| Farm/animals | agriculture, farm, livestock, animal, rural, veterinary |
| Health care | health, medical, insurance, hospital, prescription |
| Disability/benefits | disability, Social Security, SSDI, SSI, Medicaid, SNAP |
| Guns/hunting | firearm, gun, FOID, concealed carry, hunting, fishing |
| Taxes | tax, revenue |
| Utilities/energy | utility, electric, natural gas, solar, nuclear |
| Seniors | senior, aging, retire, pension, nursing home, Medicare |
| Jobs/wages | wage, employ, worker, labor, unemployment, overtime |
| College | college, university, student loan, tuition |
| Criminal justice | criminal, police, sentencing, prison, court |
| Environment/water | environment, water, pollution, climate, conservation |
| Internet/tech | internet, broadband, privacy, cyber, AI, social media |
| Elections | election, voter, ballot, campaign |
Each bill's `topics` array is the match result of those keyword lists.

## Ranking
score = 10 × matched topics + 15 if a state bill names your county ("X County") or town + recency (0–3) + 1 if it has a roll call.
**Local** = state bills naming your county/town only. There's no county-board or city-council data yet.

## Votes
ZIP → biggest-share district (Census tables) → your U.S. Senators/Rep and state lawmakers. Each roll call shows each of your lawmakers as Yea / Nay / "Absent / not recorded".
The "If you knew nothing else" line is auto-generated from the last vote's margin (or "Undecided" with no vote). It's not advice.
