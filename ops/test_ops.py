import unittest
from datetime import date

import ops

CFG = {"monthly_budget_gbp": 100, "per_experiment_budget_gbp": 40,
       "single_spend_approval_threshold_gbp": 20, "scale_roi_threshold": 3,
       "tax_set_aside_rate": 0.4, "payout_address_on_file": "addr-123"}


def row(stream, kind, amount, category="other", on="2026-09-10"):
    return {"date": on, "stream": stream, "kind": kind, "category": category, "amount_gbp": amount}


class Guardrails(unittest.TestCase):
    def test_unset_budget_blocks_all_spend(self):
        with self.assertRaises(ops.RuleViolation):
            ops.check_spend({**CFG, "monthly_budget_gbp": None}, [], "s", 1, "2026-09-10", "ok")

    def test_limits_need_approval(self):
        ledger = [row("s", "spend", 35)]
        with self.assertRaises(ops.RuleViolation):  # per-experiment cap
            ops.check_spend(CFG, ledger, "s", 10, "2026-09-10", None)
        with self.assertRaises(ops.RuleViolation):  # single-spend threshold
            ops.check_spend(CFG, [], "t", 25, "2026-09-10", None)
        ops.check_spend(CFG, [], "t", 25, "2026-09-10", "owner-email-2026-09-10")
        ops.check_spend(CFG, [], "t", 5, "2026-09-10", None)

    def test_address_must_match(self):
        with self.assertRaises(ops.RuleViolation):
            ops.verify_address(CFG, "addr-124")
        with self.assertRaises(ops.RuleViolation):
            ops.verify_address({**CFG, "payout_address_on_file": None}, "addr-123")
        self.assertEqual(ops.verify_address(CFG, "addr-123"), "addr-123")


class Accounting(unittest.TestCase):
    def test_pnl_payout_and_kill(self):
        ledger = [row("a", "revenue", 100), row("a", "spend", 10, "ai_tokens"),
                  row("b", "revenue", 5), row("b", "spend", 20, "hosting")]
        p = ops.pnl(ledger)
        self.assertEqual(p["a"]["profit"], 90)
        self.assertEqual(p["a"]["roi"], 9)
        prop = ops.payout_proposal(p, CFG, reserve_gbp=15)
        self.assertEqual(prop["net_profit"], 75)
        self.assertAlmostEqual(prop["tax_set_aside"], 30)
        self.assertAlmostEqual(prop["proposed_payout"], 30)
        streams = [{"id": "a", "status": "live", "launched": "2026-08-01", "kill": {"days": 30, "min_revenue": 50}},
                   {"id": "b", "status": "live", "launched": "2026-08-01", "kill": {"days": 30, "min_revenue": 50}}]
        d = ops.stream_decisions(streams, p, CFG, date(2026, 9, 25))
        self.assertTrue(d["a"].startswith("SCALE"))
        self.assertTrue(d["b"].startswith("KILL"))


if __name__ == "__main__":
    unittest.main()
