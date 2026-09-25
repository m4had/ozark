# Traffic plan: now to the 7 November MTD deadline

The site handles the search-engine side automatically. This plan covers the parts that need **you**, because they need your own accounts. It takes about **2–3 hours a week**.

Ground rules (hard rule 1, and each site's own rules):
- Post only from your own real accounts and say you made the tool ("I built this…").
- Follow each community's self-promotion rules. Where links to your own site aren't allowed, just answer the question well.
- No fake accounts, no bought likes or reviews, no mass DMs, and no cold emails to sole traders. Under PECR you may email limited companies and LLPs at work addresses, with an opt-out.
- Add the `?ref=` tag shown below to each link so you can see which channel works, once analytics is on.

---

## Before anything else (30 min, one-off)
1. **Google Search Console:** add the property `https://m4had.github.io/ozark/` (HTML-tag verification is easiest; send me the tag and I'll add it), then submit `sitemap.xml`.
2. **Bing Webmaster Tools:** sign in and "Import from Google Search Console". Bing is also notified automatically on every deploy (IndexNow).
3. **Analytics (recommended):** create a free, cookie-free account (GoatCounter or Cloudflare Web Analytics) and send me the snippet. I'll add it and update the privacy page. Without it we can't see whether any of this works.

## Week 1 (from 25 Sep): friends and your own network
- **LinkedIn / Facebook, your own profile.** Post A below. Link: `https://m4had.github.io/ozark/tools/mtd-checker.html?ref=li`
- Send the free MTD checker to 5–10 people you know who are self-employed or landlords, and ask for honest feedback. Feedback is worth more than traffic at this stage.

## Week 2: answer questions where people ask them
Spend 20 minutes a day finding real questions about MTD, late payments or the Renters' Rights Act, and answer them properly:
- **UK Business Forums** (ukbusinessforums.co.uk): answer in the Tax/MTD sections; check its rules on links.
- **Property Tribes** and **LandlordZone** forums: Renters' Rights Act questions. Link the checklist guide only where it genuinely answers the question.
- **Reddit:** r/UKPersonalFinance doesn't allow self-promotion, so answer from gov.uk facts without your link. r/uklandlords and r/smallbusinessuk: check each sub's rules first.
- Use Template C below. Always say "I made this" when you link.

## Week 3: developers (free tools, builds reputation)
- **Show HN** on Hacker News: Post D (uptime + SSL monitor on GitHub Actions). Post it once, on a weekday morning (US time), and reply to comments.
- **dev.to** article: "A free uptime + SSL monitor with nothing but GitHub Actions". I can draft the full article if you want it.

## Week 4: small firms that serve your buyers
- Email **10–20 small accountancy or bookkeeping firms that are limited companies**, at their business address, with Email E. Offer the free MTD checker and calendar for their clients (no charge, no catch). One email each, personalised, with an opt-out line.
- Ask local business groups (Chamber of Commerce, FSB branch) if they'd share the free deadline calendar in their newsletter.

## Weeks 5–6 (26 Oct – 7 Nov): the deadline push
- 26 Oct: Post B ("12 days to your MTD update").
- 31 Oct: repost the MTD guide.
- 4 Nov: Post B again with "3 days".
- After 7 Nov: send newsletter issue 2 to anyone who signed up.

---

## Drafts (edit freely; keep them in your own voice)

**Post A: LinkedIn / Facebook (own profile)**
> If you're self-employed or a landlord, Making Tax Digital might already apply to you. It started in April for anyone with more than £50k of business + property income, and drops to £30k next April.
> I built a free checker that tells you the date it applies to you (nothing you type leaves your browser): https://m4had.github.io/ozark/tools/mtd-checker.html?ref=li
> The next quarterly update is due 7 November. Happy to answer questions.

**Post B: deadline reminder**
> ⏰ 12 days until the 7 November MTD quarterly update. It covers 6 April–5 October (cumulative), and a mistake in August's update gets fixed by sending correct year-to-date figures now. Plain-English checklist: https://m4had.github.io/ozark/guides/mtd-quarterly-update-november-2026.html?ref=li2

**Template C: forum answer (value first)**
> [Answer the question fully in 3–6 sentences using the gov.uk facts.]
> If it helps, I made a free calculator for this: [link]?ref=forum (I run the site; nothing to sign up for.)

**Post D: Show HN**
> Title: Show HN: Free uptime and SSL-expiry monitor using only GitHub Actions
> Text: It checks a list of URLs every 15 minutes and opens a GitHub issue (which emails you) when a site is down or its certificate expires within 14 days. No server and no dependencies, about 60 lines of Node. https://github.com/m4had/ozark/tree/main/products/uptime-monitor. Feedback welcome, especially on edge cases in the TLS check.

**Email E: to small accountancy firms (limited companies only)**
> Subject: Free MTD deadline tools for your clients
> Hi [name], I run a small site of free UK tax tools. With MTD quarterly updates now live, you might find these useful to share with clients: an MTD eligibility checker, a calendar file with every 2026-27 deadline, and a plain-English guide to the 7 November update. All are free, with no sign-up: https://m4had.github.io/ozark/tools/?ref=acct
> If this isn't useful, just reply "no" and I won't contact you again.
> [Your name], kingfish77

---

## What to expect
Search traffic for a new site builds over 3–6 months. The forum answers and deadline posts are what can bring the first visitors and sales before 7 November. I'll re-check the numbers at the 25 October kill review.
