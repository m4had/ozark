// Omega store settings. This is the only file you need to edit to connect Shopify.
window.OMEGA_CONFIG = {
  brand: {
    name: "Omega",
    tagline: "Everything, from A to Ω.",
    supportEmail: "hello@example.com", // replace with your support address
  },

  // Leave both blank to run with demo products.
  // Fill both in to load your real products and send customers to Shopify checkout.
  // See store/README.md for how to get these.
  shopify: {
    storeDomain: "", // e.g. "omega-store.myshopify.com"
    storefrontAccessToken: "", // public Storefront API token (safe to put in the browser)
    apiVersion: "2025-01",
  },

  // Used for demo prices and when Shopify doesn't send a currency.
  currency: "GBP",
  locale: "en-GB",

  // Order value that gets free delivery. Shown in the benefits strip.
  freeDeliveryOver: 50,

  // Where the "10% off your first order" form sends emails.
  // Paste a form endpoint here (e.g. from Shopify Forms, Klaviyo or Mailchimp).
  // Left blank, the form tells visitors sign-up isn't open yet.
  newsletterEndpoint: "",

  // Customer reviews shown on the home page. The section stays hidden while this is empty.
  // Only add real reviews from real customers, e.g.
  // { quote: "Arrived in two days and fits perfectly.", name: "Sam K.", product: "Loopback Hoodie" },
  reviews: [],

  social: {
    instagram: "",
    tiktok: "",
    facebook: "",
  },
};
