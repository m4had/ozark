#!/usr/bin/env python3
"""Revenue-operator bookkeeping: idea scoring, ledger, P&L, kill checks, payout proposals.

This tool never moves money. `payout` only writes a proposal that the owner must approve.
"""
import argparse
import csv
import json
import sys
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
CONFIG = ROOT / "config.json"
LEDGER = DATA / "ledger.csv"
STREAMS = DATA / "streams.json"
IDEAS = DATA / "ideas.csv"

COST_CATEGORIES = ["ai_tokens", "hosting", "platform_fees", "ads", "payment_fees", "other"]
LEDGER_FIELDS = ["date", "stream", "kind", "category", "amount_gbp", "description", "approval_ref"]
OWNER_HOURLY_GBP = 15  # opportunity cost used when scoring ideas
MIN_SETUP_GBP = 10  # floor so zero-cash ideas don't score infinitely


class RuleViolation(Exception):
    pass


def load_config(path=CONFIG):
    return json.loads(Path(path).read_text())


def load_streams(path=STREAMS):
    return json.loads(Path(path).read_text())


def read_ledger(path=LEDGER):
    with open(path, newline="") as f:
        rows = list(csv.DictReader(f))
    for r in rows:
        r["amount_gbp"] = float(r["amount_gbp"])
    return rows


# ---------- Phase 1: scoring ----------

def score_idea(idea):
    """Score = expected monthly profit x P(success) / effective setup cost."""
    rev = float(idea["rev_mid"])
    monthly_profit = rev * (1 - float(idea["fee_pct"])) - float(idea["monthly_run_gbp"])
    setup = float(idea["setup_cash_gbp"]) + float(idea["owner_hours"]) * OWNER_HOURLY_GBP
    setup = max(setup, MIN_SETUP_GBP)
    return {
        "monthly_profit": monthly_profit,
        "effective_setup": setup,
        "score": monthly_profit * float(idea["p_success"]) / setup,
    }


def rank_ideas(path=IDEAS):
    with open(path, newline="") as f:
        ideas = list(csv.DictReader(f))
    for idea in ideas:
        idea.update(score_idea(idea))
        if idea["platform_risk"] == "H":
            idea["score"] = 0.0  # high ToS/platform risk is disqualifying
    return sorted(ideas, key=lambda i: i["score"], reverse=True)


# ---------- Ledger with hard-rule checks ----------

def check_spend(cfg, ledger, stream, amount, on, approval_ref):
    limits = {
        "monthly_budget_gbp": cfg.get("monthly_budget_gbp"),
        "per_experiment_budget_gbp": cfg.get("per_experiment_budget_gbp"),
        "single_spend_approval_threshold_gbp": cfg.get("single_spend_approval_threshold_gbp"),
    }
    unset = [k for k, v in limits.items() if v is None]
    if unset:
        raise RuleViolation(f"Budget limits not set by owner ({', '.join(unset)}); no spend allowed.")
    month = on[:7]
    month_spend = sum(r["amount_gbp"] for r in ledger if r["kind"] == "spend" and r["date"][:7] == month)
    stream_spend = sum(r["amount_gbp"] for r in ledger if r["kind"] == "spend" and r["stream"] == stream)
    problems = []
    if month_spend + amount > limits["monthly_budget_gbp"]:
        problems.append(f"monthly budget £{limits['monthly_budget_gbp']:.2f} (would be £{month_spend + amount:.2f})")
    if stream_spend + amount > limits["per_experiment_budget_gbp"]:
        problems.append(f"per-experiment budget £{limits['per_experiment_budget_gbp']:.2f} (would be £{stream_spend + amount:.2f})")
    if amount > limits["single_spend_approval_threshold_gbp"]:
        problems.append(f"single-spend approval threshold £{limits['single_spend_approval_threshold_gbp']:.2f}")
    if problems and not approval_ref:
        raise RuleViolation("Owner written approval required: exceeds " + "; ".join(problems))


def append_ledger(entry, path=LEDGER):
    with open(path, "a", newline="") as f:
        csv.DictWriter(f, fieldnames=LEDGER_FIELDS).writerow(entry)


# ---------- Phase 4: P&L ----------

def pnl(ledger, month=None):
    streams = defaultdict(lambda: {"revenue": 0.0, **{c: 0.0 for c in COST_CATEGORIES}})
    for r in ledger:
        if month and r["date"][:7] != month:
            continue
        s = streams[r["stream"]]
        if r["kind"] == "revenue":
            s["revenue"] += r["amount_gbp"]
        elif r["kind"] == "spend":
            s[r["category"] if r["category"] in COST_CATEGORIES else "other"] += r["amount_gbp"]
    out = {}
    for name, s in streams.items():
        spend = sum(s[c] for c in COST_CATEGORIES)
        profit = s["revenue"] - spend
        out[name] = {**s, "spend": spend, "profit": profit, "roi": (profit / spend) if spend else None}
    return out


def stream_decisions(streams, lifetime, cfg, today):
    decisions = {}
    for st in streams:
        if st.get("status") != "live":
            decisions[st["id"]] = st.get("status", "planned")
            continue
        p = lifetime.get(st["id"], {"revenue": 0.0, "roi": None})
        days = (today - date.fromisoformat(st["launched"])).days
        kill = st.get("kill", {})
        if days >= kill.get("days", 10**9) and p["revenue"] < kill.get("min_revenue", 0):
            decisions[st["id"]] = f"KILL (£{p['revenue']:.2f} < £{kill['min_revenue']} after {days}d)"
        elif cfg.get("scale_roi_threshold") and p["roi"] is not None and p["roi"] > cfg["scale_roi_threshold"]:
            decisions[st["id"]] = f"SCALE candidate (ROI {p['roi']:.1f}x)"
        else:
            decisions[st["id"]] = "keep"
    return decisions


# ---------- Phase 5: payout proposal (never sends) ----------

def payout_proposal(month_pnl, cfg, reserve_gbp):
    net = sum(p["profit"] for p in month_pnl.values())
    tax = max(net, 0) * cfg["tax_set_aside_rate"]
    payout = max(net - reserve_gbp - tax, 0)
    return {"net_profit": net, "reserve": reserve_gbp, "tax_set_aside": tax, "proposed_payout": payout}


def verify_address(cfg, typed):
    on_file = cfg.get("payout_address_on_file")
    if not on_file:
        raise RuleViolation("No payout address on file; owner must set payout_address_on_file.")
    if typed.strip() != on_file.strip():
        raise RuleViolation("Address does not match the one on file. Nothing prepared.")
    return on_file


# ---------- CLI ----------


def cmd_score(args):
    ranked = rank_ideas()
    print("| Rank | # | Idea | Setup £ (cash+owner time) | Profit/mo (mid) | P | Wks to £ | Risk | Comp | Score |")
    print("|---|---|---|---|---|---|---|---|---|---|")
    for i, idea in enumerate(ranked, 1):
        print(f"| {i} | {idea['id']} | {idea['name']} | {idea['effective_setup']:.0f} | {idea['monthly_profit']:.0f} | "
              f"{float(idea['p_success']):.2f} | {idea['weeks_to_first_rev']} | {idea['platform_risk']} | "
              f"{idea['competition']} | {idea['score']:.2f} |")


def cmd_log(args):
    cfg = load_config()
    ledger = read_ledger()
    on = args.date or date.today().isoformat()
    if args.kind == "spend":
        check_spend(cfg, ledger, args.stream, args.amount, on, args.approval_ref)
    append_ledger({"date": on, "stream": args.stream, "kind": args.kind, "category": args.category,
                   "amount_gbp": f"{args.amount:.2f}", "description": args.description,
                   "approval_ref": args.approval_ref or ""})
    print("logged")


def cmd_report(args):
    cfg = load_config()
    ledger = read_ledger()
    month = args.month or date.today().isoformat()[:7]
    monthly = pnl(ledger, month)
    lifetime = pnl(ledger)
    streams = load_streams()
    decisions = stream_decisions(streams, lifetime, cfg, date.today())
    names = {s["id"]: s for s in streams}
    ids = sorted(set(names) | set(monthly))
    print(f"## P&L {month}\n")
    print("| Stream | Status | Spend | Revenue | Net profit | ROI | Decision |")
    print("|---|---|---|---|---|---|---|")
    for sid in ids:
        p = monthly.get(sid, {"spend": 0.0, "revenue": 0.0, "profit": 0.0, "roi": None})
        roi = "—" if p["roi"] is None else f"{p['roi']:.1f}x"
        print(f"| {sid} | {names.get(sid, {}).get('status', 'unlisted')} | £{p['spend']:.2f} | £{p['revenue']:.2f} | "
              f"£{p['profit']:.2f} | {roi} | {decisions.get(sid, '—')} |")
    tot = {k: sum(p[k] for p in monthly.values()) for k in ("spend", "revenue", "profit")}
    print(f"| **Total** | | £{tot['spend']:.2f} | £{tot['revenue']:.2f} | £{tot['profit']:.2f} | | |")


def cmd_payout(args):
    cfg = load_config()
    month_pnl = pnl(read_ledger(), args.month)
    prop = payout_proposal(month_pnl, cfg, args.reserve)
    addr = verify_address(cfg, args.address)
    prop.update({"month": args.month, "to_address": addr, "status": "PENDING OWNER APPROVAL - NOT SENT",
                 "prepared_at": datetime.now().isoformat(timespec="seconds")})
    out = ROOT / "reports" / f"payout-proposal-{args.month}.json"
    out.write_text(json.dumps(prop, indent=2))
    print(json.dumps(prop, indent=2))
    print(f"\nWritten to {out}. Nothing has been sent. Reply 'APPROVED' to authorise.")


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("score").set_defaults(fn=cmd_score)
    lg = sub.add_parser("log")
    lg.add_argument("--stream", required=True)
    lg.add_argument("--kind", choices=["spend", "revenue", "action"], required=True)
    lg.add_argument("--category", default="other")
    lg.add_argument("--amount", type=float, default=0.0)
    lg.add_argument("--description", required=True)
    lg.add_argument("--approval-ref")
    lg.add_argument("--date")
    lg.set_defaults(fn=cmd_log)
    rp = sub.add_parser("report")
    rp.add_argument("--month")
    rp.set_defaults(fn=cmd_report)
    po = sub.add_parser("payout")
    po.add_argument("--month", required=True)
    po.add_argument("--reserve", type=float, required=True, help="GBP to keep back for next month's costs")
    po.add_argument("--address", required=True, help="Must exactly match payout_address_on_file")
    po.set_defaults(fn=cmd_payout)
    args = ap.parse_args(argv)
    try:
        args.fn(args)
    except RuleViolation as e:
        print(f"BLOCKED: {e}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
