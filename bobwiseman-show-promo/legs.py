"""Group shows.json into legs and write the variables for the next one.

A leg is a run of shows by the same act with no more than MAX_GAP days between them. The next leg
is the first one with a show on or after --today. A leg of one show gets the single-show promo
(promo-rig/), anything longer gets the leg promo (promo-leg/).

  python3 legs.py --today 2026-10-07            # list the legs, write next-leg.json
"""
import argparse, datetime as dt, json

MAX_GAP = 7
p = argparse.ArgumentParser()
p.add_argument("--today", default=dt.date.today().isoformat())
a = p.parse_args()
today = dt.date.fromisoformat(a.today)

rows = json.load(open("shows.json"))
for r in rows:
    r["_d"] = dt.date.fromisoformat(r["iso"])
rows = [r for r in rows if r["_d"] >= today]

legs = []
for r in rows:
    if legs and legs[-1][-1]["act"] == r["act"] and (r["_d"] - legs[-1][-1]["_d"]).days <= MAX_GAP:
        legs[-1].append(r)
    else:
        legs.append([r])

def span(leg):
    a, b = leg[0]["_d"], leg[-1]["_d"]
    if a == b:
        return a.strftime("%b ").upper() + str(a.day)
    if a.month == b.month:
        return a.strftime("%b ").upper() + f"{a.day}-{b.day}"
    return a.strftime("%b ").upper() + str(a.day) + " - " + b.strftime("%b ").upper() + str(b.day)

for leg in legs:
    print(f"{span(leg):16} {len(leg):2} show(s)  {leg[0]['act']}  {leg[0]['city']} .. {leg[-1]['city']}")

leg = legs[0]
withs = sorted({r["with"] for r in leg})
out = {
    "kind": "single" if len(leg) == 1 else "leg",
    "act": leg[0]["act"],
    "with": withs[0] if len(withs) == 1 else "",
    "span": span(leg),
    "dates": json.dumps([{k: r[k] for k in ("dow", "date", "city", "venue", "with")} for r in leg], ensure_ascii=False),
}
if out["kind"] == "single":
    out = {k: leg[0][k] for k in ("act", "with", "dow", "date", "city", "venue", "slug")} | {"kind": "single"}
else:
    out["slug"] = "leg-" + span(leg).lower().replace(" ", "")
kind = out.pop("kind")
json.dump(out, open("next-leg.json", "w"), indent=1, ensure_ascii=False)
print("next:", kind, "->", "promo-leg/" if kind == "leg" else "promo-rig/", "with next-leg.json")
