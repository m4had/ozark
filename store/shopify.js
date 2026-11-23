// Shopify Storefront API client. Loads products, collections and blog posts,
// and keeps a Shopify cart so checkout happens on Shopify's secure checkout page.
(function () {
  const cfg = window.OMEGA_CONFIG.shopify;
  const live = Boolean(cfg.storeDomain && cfg.storefrontAccessToken);
  const endpoint = live
    ? `https://${cfg.storeDomain.replace(/^https?:\/\//, "").replace(/\/$/, "")}/api/${cfg.apiVersion}/graphql.json`
    : null;

  async function gql(query, variables = {}) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": cfg.storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) throw new Error(`Shopify returned ${res.status}. Check storeDomain and storefrontAccessToken in config.js.`);
    const json = await res.json();
    if (json.errors && json.errors.length) throw new Error(json.errors.map((e) => e.message).join("; "));
    return json.data;
  }

  const PRODUCT_FIELDS = `
    id handle title description productType
    featuredImage { url altText }
    collections(first: 3) { nodes { handle } }
    variants(first: 50) {
      nodes {
        id title availableForSale
        price { amount currencyCode }
        compareAtPrice { amount }
        selectedOptions { name value }
      }
    }`;

  const CART_FIELDS = `
    id checkoutUrl totalQuantity
    cost { subtotalAmount { amount currencyCode } }
    lines(first: 100) {
      nodes {
        id quantity
        merchandise {
          ... on ProductVariant {
            id title
            price { amount currencyCode }
            image { url altText }
            product { id title handle featuredImage { url altText } }
          }
        }
      }
    }`;

  function normProduct(p) {
    const variants = p.variants.nodes.map((v) => ({
      id: v.id,
      title: v.title,
      options: Object.fromEntries(
        v.selectedOptions.filter((o) => !(o.name === "Title" && o.value === "Default Title")).map((o) => [o.name, o.value])
      ),
      price: Number(v.price.amount),
      currency: v.price.currencyCode,
      compareAt: v.compareAtPrice ? Number(v.compareAtPrice.amount) : null,
      available: v.availableForSale,
    }));
    const first = variants.find((v) => v.available) || variants[0] || {};
    return {
      id: p.id,
      handle: p.handle,
      title: p.title,
      description: p.description,
      category: p.collections.nodes[0] ? p.collections.nodes[0].handle : "",
      categoryLabel: p.productType || "",
      image: p.featuredImage ? { url: p.featuredImage.url, alt: p.featuredImage.altText || p.title } : null,
      art: ["box", "stone"],
      price: first.price,
      compareAt: first.compareAt && first.compareAt > first.price ? first.compareAt : null,
      currency: first.currency,
      variants,
    };
  }

  function normCart(c) {
    if (!c) return null;
    return {
      id: c.id,
      checkoutUrl: c.checkoutUrl,
      lines: c.lines.nodes.map((l) => {
        const m = l.merchandise;
        const img = m.image || m.product.featuredImage;
        return {
          key: l.id,
          variantId: m.id,
          productId: m.product.id,
          title: m.product.title,
          variantTitle: m.title === "Default Title" ? "" : m.title,
          price: Number(m.price.amount),
          currency: m.price.currencyCode,
          qty: l.quantity,
          image: img ? { url: img.url, alt: img.altText || m.product.title } : null,
          art: ["box", "stone"],
        };
      }),
    };
  }

  const api = {
    live,

    async catalog() {
      const data = await gql(`{
        collections(first: 20, sortKey: TITLE) {
          nodes { handle title image { url altText } products(first: 1) { nodes { featuredImage { url altText } } } }
        }
        best: products(first: 8, sortKey: BEST_SELLING) { nodes { ${PRODUCT_FIELDS} } }
        newest: products(first: 8, sortKey: CREATED_AT, reverse: true) { nodes { ${PRODUCT_FIELDS} } }
        articles(first: 3, sortKey: PUBLISHED_AT, reverse: true) {
          nodes { title excerpt publishedAt onlineStoreUrl image { url altText } }
        }
        shop { name primaryDomain { url } }
      }`);
      const categories = data.collections.nodes
        .filter((c) => c.handle !== "frontpage" && c.handle !== "all")
        .map((c) => {
          const img = c.image || (c.products.nodes[0] && c.products.nodes[0].featuredImage);
          return { handle: c.handle, title: c.title, image: img ? { url: img.url, alt: img.altText || c.title } : null, art: ["box", "stone"] };
        });
      return {
        categories,
        best: data.best.nodes.map(normProduct),
        newest: data.newest.nodes.map(normProduct),
        articles: data.articles.nodes.map((a) => ({
          title: a.title,
          excerpt: a.excerpt,
          date: a.publishedAt,
          url: a.onlineStoreUrl || "#",
          image: a.image ? { url: a.image.url, alt: a.image.altText || a.title } : null,
        })),
        shopUrl: data.shop.primaryDomain ? data.shop.primaryDomain.url : `https://${cfg.storeDomain}`,
      };
    },

    async search(term) {
      const data = await gql(
        `query($q: String!) { products(first: 24, query: $q) { nodes { ${PRODUCT_FIELDS} } } }`,
        { q: term }
      );
      return data.products.nodes.map(normProduct);
    },

    async collection(handle) {
      const data = await gql(
        `query($h: String!) { collection(handle: $h) { title products(first: 24) { nodes { ${PRODUCT_FIELDS} } } } }`,
        { h: handle }
      );
      return data.collection ? data.collection.products.nodes.map(normProduct) : [];
    },

    async getCart(id) {
      const data = await gql(`query($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`, { id });
      return normCart(data.cart);
    },

    async addLine(cartId, variantId, qty) {
      if (!cartId) {
        const d = await gql(
          `mutation($lines: [CartLineInput!]) { cartCreate(input: { lines: $lines }) { cart { ${CART_FIELDS} } userErrors { message } } }`,
          { lines: [{ merchandiseId: variantId, quantity: qty }] }
        );
        return check(d.cartCreate);
      }
      const d = await gql(
        `mutation($id: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $id, lines: $lines) { cart { ${CART_FIELDS} } userErrors { message } } }`,
        { id: cartId, lines: [{ merchandiseId: variantId, quantity: qty }] }
      );
      return check(d.cartLinesAdd);
    },

    async updateLine(cartId, lineId, qty) {
      if (qty <= 0) {
        const d = await gql(
          `mutation($id: ID!, $ids: [ID!]!) { cartLinesRemove(cartId: $id, lineIds: $ids) { cart { ${CART_FIELDS} } userErrors { message } } }`,
          { id: cartId, ids: [lineId] }
        );
        return check(d.cartLinesRemove);
      }
      const d = await gql(
        `mutation($id: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $id, lines: $lines) { cart { ${CART_FIELDS} } userErrors { message } } }`,
        { id: cartId, lines: [{ id: lineId, quantity: qty }] }
      );
      return check(d.cartLinesUpdate);
    },
  };

  function check(payload) {
    if (payload.userErrors && payload.userErrors.length) throw new Error(payload.userErrors.map((e) => e.message).join("; "));
    return normCart(payload.cart);
  }

  window.OMEGA_SHOPIFY = api;
})();
