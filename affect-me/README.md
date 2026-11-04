# How Does It Affect Me? (Illinois + federal)
Static, client-side site. No server, no storage, no analytics, no outside requests from the browser (CSP enforces 'self').

## Run locally
    python3 -m http.server 8799 --directory /workspace/affect-me   # open http://localhost:8799

## Refresh data (all keyless, real sources)
    cd pipeline && python3 fetch_federal.py && python3 fetch_illinois.py
Needs raw inputs in pipeline/raw (see the curl list at the top of each script's docstring):
- Census 2020 ZCTA relationship files (cd119, sldl2024, sldu2024, Illinois)  -> ZIP -> districts
- unitedstates/congress-legislators legislators-current.json                  -> members of Congress
- Voteview H119/S119 rollcalls, votes, members CSVs                           -> federal roll calls
- GovInfo BILLSTATUS bulk XML                                                 -> CRS summaries, policy areas
- github.com/openstates/people data/il                                        -> IL legislators
- ilga.gov Public Acts list, Bill Status pages, roll-call PDFs (pdftotext)    -> IL bills + votes

## Add a state
1. Write pipeline/fetch_<st>.py producing data/states/XX/{members,bills_*,zip_districts}.json in the same shape
   (Open States API v3 with a free key is the easiest source for any state's bills + votes).
2. Run fetch_federal.py with STATE = "XX".
3. Add the state to config/states.json with enabled: true and its ZIP prefixes.
