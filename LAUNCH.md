# Launch checklist (owner actions, about 1–2 hours)

Only you can do these steps, because they need your identity or your legal name.

1. **Payment account.** Pick one:
   - **Gumroad** or **Lemon Squeezy** (recommended for A and B). They act as merchant of record, so they handle EU VAT and deliver the file for you. Upload the two `.xlsx` files from `dist/`.
   - **Stripe Payment Links** (good for C, since it's a service). You'll need to deliver files yourself.
2. **Create 3 products and paste the links** into `site/`, replacing `PAYMENT_LINK_MTD`, `PAYMENT_LINK_LANDLORD` and `PAYMENT_LINK_A11Y`. Replace `SELLER_LEGAL_NAME` and `CONTACT_EMAIL` too.
3. **Host `site/`** for free on GitHub Pages, Netlify or Cloudflare Pages. A domain (~£10/yr) is optional and must be approved against your budget.
4. **Tell me the launch date.** I'll set `launched` in `ops/data/streams.json` and the 30-day kill clock starts then.
5. **Report sales** (or connect me to the sales export). Every sale goes into the ledger:
   `python3 ops/ops.py log --stream A --kind revenue --amount 14 --description "Gumroad sale"`

**HMRC:** trading income over £1,000 a year (the trading allowance) means you'll need to register for Self Assessment.
