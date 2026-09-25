# ops – revenue operator workspace

| Path | Purpose |
|---|---|
| `config.json` | Owner-set limits (budgets, approval threshold, ROI threshold, tax rate, payout address). `null` blocks all spend. |
| `data/ideas.csv` | Phase 1 idea estimates (inputs to scoring) |
| `data/streams.json` | Live/killed streams and their kill criteria |
| `data/ledger.csv` | Append-only log of every action, spend and revenue item |
| `reports/` | Discovery, plans, status and payout proposals |

```
python3 ops.py score                                  # Phase 1 ranking
python3 ops.py log --stream A --kind spend --category hosting --amount 5 --description "..." [--approval-ref ...]
python3 ops.py log --stream A --kind revenue --amount 19 --description "Gumroad sale #1"
python3 ops.py report --month 2026-10                 # Phase 4 P&L + kill/scale decisions
python3 ops.py payout --month 2026-10 --reserve 20 --address <addr>   # Phase 5 proposal only, never sends
python3 -m unittest test_ops
```

Stream entry format for `data/streams.json`:
`{"id": "A", "name": "MTD workbook", "status": "live", "launched": "2026-10-01", "kill": {"days": 30, "min_revenue": 50}}`
