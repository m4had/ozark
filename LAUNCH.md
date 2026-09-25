# Launch checklist – crypto checkout

Customers pay **USDC on Base** straight to your wallet `0xE52739159fB0762bcBeD4bAe9f97644b4A348a25`.
You don't need a payment account. The site build stays blocked until items 1 and 2 are done.

1. **Confirm your wallet can receive USDC on Base.** Normal wallets with a seed phrase (MetaMask, Coinbase Wallet, Rabby, Ledger) can. A smart-contract wallet may exist on only one network. Then set `crypto_checkout.network_confirmed` to `true` in `ops/config.json`, or just tell me.
2. **Seller details.** The law (Consumer Contracts Regulations 2013, E-Commerce Regulations 2002) requires a name, a geographic address and an email on the site. Send them to me or fill in `shop` in `ops/config.json`. A business address service is fine if you don't want to show your home address.
3. **Hosting.** Pick one:
   - Make the repo private and use Netlify or Cloudflare Pages (free), with build command `python3 site/build.py` and output folder `_site`. **Recommended:** while the repo is public, anyone can download the paid files from GitHub for free.
   - Keep it public and use GitHub Pages: Settings → Pages → Source: *GitHub Actions*, then merge to `main`.
4. **Tell me the launch date** so the 30-day kill clocks start.

**How checkout works**
- The buyer pays from a browser wallet, or sends from an exchange and pastes the transaction hash.
- The page checks the payment on Base: the right token, sent to your address, for at least the right amount. It then unlocks the download.
- For services (accessibility report, cookie check), the buyer emails the transaction link and their website address.

**Know the limits**
- There's no server, so a determined person could still find the download files. That's acceptable at £5–£21 prices.
- The same transaction hash could be reused by someone else.
- Crypto payments are final. Refunds for faulty files are sent from your wallet by you, never by me.

**Tax.** HMRC treats crypto received for sales as trading income at its £ value on the day you receive it. I record each sale in the ledger at that value, and the monthly report shows how much to set aside for tax.
