# Launch checklist (about 20 minutes of your time)

Everything else is ready. These steps need your identity, so only you can do them.

1. **Open a Gumroad or Lemon Squeezy account** (about 10 min, with ID checks). Both act as merchant of record and handle VAT for you.
2. **Create the listings** by pasting from `launch/listings.md`, uploading the files in `dist/` and the covers in `launch/covers/`. Set up C as a service with the two checkout fields.
3. **Send me:** the 3 product links, your seller name as it should appear on the site, and a contact email.
   I'll put them in `ops/config.json`. The site then builds and deploys itself (`.github/workflows/pages.yml`).
4. **One-time GitHub setting:** repo Settings → Pages → Source: *GitHub Actions*. On the free plan, Pages needs a public repo. If you'd rather keep the repo private, use Netlify or Cloudflare Pages instead (also free) with build command `python3 site/build.py` and output `_site`.
5. **Confirm the launch date.** The 30-day kill clock starts then.

The store listings work on their own from day one. The website is a bonus for sharing links.

**HMRC:** trading income over £1,000 a year means you'll need to register for Self Assessment.
