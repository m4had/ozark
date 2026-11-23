// Demo catalogue shown until Shopify is connected in config.js.
// Once connected, products, categories (collections) and journal posts (blog articles) come from Shopify.
(function () {
  const sizes = (list) => list.map((v) => ({ Size: v }));
  const colours = (list) => list.map((v) => ({ Colour: v }));

  const categories = [
    { handle: "clothing", title: "Clothing", art: ["hoodie", "cobalt"] },
    { handle: "bags-shoes", title: "Bags & shoes", art: ["sneaker", "sand"] },
    { handle: "home", title: "Home", art: ["lamp", "sage"] },
    { handle: "kitchen", title: "Kitchen", art: ["mug", "blush"] },
    { handle: "beauty", title: "Beauty", art: ["serum", "lilac"] },
    { handle: "tech", title: "Tech", art: ["headphones", "stone"] },
    { handle: "outdoors", title: "Outdoors", art: ["backpack", "sky"] },
    { handle: "kids", title: "Kids", art: ["blocks", "sand"] },
  ];

  // [title, category, art kind, tone, price, compareAt, options, bestSeller, description]
  const rows = [
    ["Everyday Heavy Tee", "clothing", "tee", "cobalt", 18, 24, sizes(["S", "M", "L", "XL"]), true, "A 240gsm cotton tee that holds its shape wash after wash. Relaxed fit, dropped shoulder."],
    ["Loopback Hoodie", "clothing", "hoodie", "stone", 42, 52, sizes(["S", "M", "L", "XL"]), true, "Brushed loopback cotton with a lined hood and a roomy front pocket."],
    ["Six-Panel Cap", "clothing", "cap", "sage", 16, null, colours(["Sage", "Black", "Sand"]), false, "Washed cotton cap with an adjustable strap. One size."],
    ["Court Low Trainer", "bags-shoes", "sneaker", "sand", 64, 80, sizes(["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"]), true, "Leather upper, cushioned insole and a grippy cupsole for everyday wear."],
    ["Canvas Tote", "bags-shoes", "tote", "blush", 14, null, colours(["Natural", "Black"]), false, "Heavy canvas tote with long handles and an inside pocket."],
    ["Arc Table Lamp", "home", "lamp", "sage", 48, null, colours(["Sage", "Chalk"]), false, "Warm, dimmable light with a linen shade. Bulb included."],
    ["Cedar & Fig Candle", "home", "candle", "sand", 22, 28, [{}], true, "Soy wax candle with a 45-hour burn time in a reusable glass jar."],
    ["Easy Fern in Ceramic Pot", "home", "plant", "sage", 26, null, [{}], false, "A hardy fern that forgives missed waterings, potted and ready to place."],
    ["Stoneware Mug, Set of 2", "kitchen", "mug", "blush", 19, null, colours(["Blush", "Ink"]), false, "Hand-glazed 350ml mugs. Dishwasher and microwave safe."],
    ["Cast Iron Skillet 26cm", "kitchen", "pan", "stone", 38, 45, [{}], true, "Pre-seasoned skillet that goes from hob to oven to table."],
    ["Insulated Bottle 750ml", "outdoors", "bottle", "sky", 24, null, colours(["Sky", "Black", "Sage"]), true, "Keeps drinks cold for 24 hours or hot for 12. Leak-proof lid."],
    ["Daypack 22L", "outdoors", "backpack", "sky", 58, 70, colours(["Navy", "Black"]), false, "Water-resistant daypack with a padded laptop sleeve and side bottle pockets."],
    ["Hydrating Serum 30ml", "beauty", "serum", "lilac", 21, null, [{}], false, "A lightweight daily serum with hyaluronic acid for all skin types."],
    ["Over-Ear Wireless Headphones", "tech", "headphones", "stone", 89, 119, colours(["Graphite", "Chalk"]), true, "Active noise cancelling, 40-hour battery and fast USB-C charging."],
    ["Pocket Bluetooth Speaker", "tech", "speaker", "cobalt", 35, null, colours(["Cobalt", "Black"]), false, "Small speaker, full sound. Waterproof and good for 12 hours of play."],
    ["Field Watch 38mm", "tech", "watch", "sand", 72, 90, [{}], true, "Quartz movement, sapphire-coated glass and a quick-release strap."],
    ["Wooden Stacking Blocks", "kids", "blocks", "sand", 20, null, [{}], false, "Twenty beech blocks finished with child-safe paint. Ages 18 months and up."],
  ];

  const products = rows.map(([title, category, kind, tone, price, compareAt, options, best, description], i) => {
    const handle = title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return {
      id: "demo-" + i,
      handle,
      title,
      category,
      description,
      image: null,
      art: [kind, tone],
      bestSeller: best,
      price,
      compareAt,
      variants: options.map((opts, j) => ({
        id: `demo-${i}-${j}`,
        title: Object.values(opts).join(" / ") || "Default",
        options: opts,
        price,
        compareAt,
        available: true,
      })),
    };
  });

  const articles = [
    { title: "Ten things that make a small flat feel bigger", date: "2026-11-12", excerpt: "Lighting, mirrors and a few clever buys that open up a room without a renovation.", art: ["lamp", "sage"], url: "#" },
    { title: "How to look after cast iron, the easy way", date: "2026-11-03", excerpt: "Seasoning, cleaning and the one thing you should never do with your skillet.", art: ["pan", "stone"], url: "#" },
    { title: "What to pack for a weekend away", date: "2026-10-24", excerpt: "A carry-on list that covers city breaks, coastal walks and the train home.", art: ["backpack", "sky"], url: "#" },
  ];

  window.OMEGA_DEMO = { categories, products, articles };
})();
