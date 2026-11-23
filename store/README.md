# Omega store

A static storefront for Omega that runs on Shopify. Products, categories, prices, stock and blog posts come from your Shopify store, and customers pay on Shopify's secure checkout.

Until Shopify is connected, the site runs in demo mode with sample products and a working basket. Checkout is switched off in demo mode.

## Files

| File | What it's for |
| --- | --- |
| `config.js` | Brand name, Shopify connection, currency, free-delivery threshold, newsletter, reviews and social links. **The only file you need to edit.** |
| `index.html` | Page layout |
| `styles.css` | Colours, fonts and layout. The colour tokens are at the top. |
| `app.js` | Search, categories, product pop-up and basket |
| `shopify.js` | Talks to the Shopify Storefront API |
| `demo-data.js`, `art.js` | Sample products and illustrations, used only in demo mode |
| `logo.svg`, `logo-mark.svg` | Wordmark and icon (also used as the favicon) |

## Preview it locally

```bash
cd store && python3 -m http.server 8000
```

Then open http://localhost:8000.

## Connect your Shopify store

1. **Create the store.** Sign up at shopify.com. You'll get an address like `omega-store.myshopify.com`.
2. **Add products.** In Shopify admin go to Products and add each one with photos, price, compare-at price (for sale prices), and variants such as Size or Colour.
3. **Create categories.** Go to Products → Collections and make one collection per category (Clothing, Home, Kitchen…). Give each collection an image, or the site uses the first product's photo. A product's first collection is the category shown on its card.
4. **Get a Storefront API token.**
   - Install the free **Headless** sales channel from the Shopify App Store.
   - Open Headless → **Create storefront**.
   - Under Storefront API, copy the **public access token**.
   - Under Storefront API permissions, make sure product listings, collections, checkouts/carts and content (blog) reads are switched on.
5. **Publish products to the Headless channel.** On each product (or in bulk from the product list), add the Headless storefront under Sales channels. Products that aren't published there won't appear.
6. **Paste the details into `config.js`:**

   ```js
   shopify: {
     storeDomain: "omega-store.myshopify.com",
     storefrontAccessToken: "paste-your-public-token-here",
     apiVersion: "2025-01",
   },
   ```

   The public Storefront token is meant to live in the browser. It can only read your catalogue and create baskets. **Never** paste an Admin API token (one starting `shpat_`) here.

7. Reload the site. The demo banner disappears, your products load, and **Check out** sends customers to Shopify checkout.

### What comes from Shopify once connected

- **Best sellers:** Shopify's best-selling sort. **New in:** most recently added products.
- **Categories:** your collections (the automatic `frontpage` and `all` ones are hidden).
- **Journal:** your three latest blog articles (Online Store → Blog posts). The section hides itself if you have none.
- **Account icon and policy links:** your Shopify customer account page and policies (Settings → Policies).
- **Discount codes, shipping and taxes:** handled at Shopify checkout.

## Before you launch

- Set `supportEmail` in `config.js`.
- **Newsletter:** set `newsletterEndpoint` to a form endpoint from your email tool (Shopify Forms, Klaviyo, Mailchimp) and create the 10% welcome code in Shopify under Discounts. Until then, the form tells visitors sign-up isn't open yet. If you won't offer 10%, change the wording in `index.html`.
- **Reviews:** add real customer reviews to `reviews` in `config.js` and the section appears. Don't publish made-up reviews. It's misleading to shoppers and breaks UK consumer law (DMCC Act 2024).
- **Benefits strip** in `index.html`: check the delivery time, the 30-day returns promise and the payment methods match what you actually offer.
- Add your social links in `config.js`.

## Hosting

It's plain HTML, CSS and JavaScript with no build step, so you can host the `store` folder anywhere static: Netlify, Cloudflare Pages, Vercel or GitHub Pages. Then point your own domain at it.

If you'd rather run everything on Shopify, the same design can be rebuilt as a Shopify theme instead.
