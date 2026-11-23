(function () {
  const C = window.OMEGA_CONFIG;
  const API = window.OMEGA_SHOPIFY;
  const DEMO = window.OMEGA_DEMO;
  const ART = window.OMEGA_ART;
  const live = API.live;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  };

  const money = (n, cur) =>
    new Intl.NumberFormat(C.locale, { style: "currency", currency: cur || C.currency }).format(n || 0);
  const sized = (url, w) => url + (url.includes("?") ? "&" : "?") + "width=" + w;

  function media(item, w = 600) {
    if (item.image && item.image.url) {
      return `<img src="${esc(sized(item.image.url, w))}" alt="${esc(item.image.alt || item.title)}" loading="lazy">`;
    }
    return ART(item.art[0], item.art[1], item.title);
  }

  const state = { categories: [], products: new Map(), shopUrl: null, cart: { id: null, checkoutUrl: null, lines: [] }, busy: false };
  const catTitle = (h) => (state.categories.find((c) => c.handle === h) || {}).title || "";

  // ---------- Brand text from config ----------
  $$("[data-brand]").forEach((el) => (el.textContent = C.brand.name));
  $$("[data-free-over]").forEach((el) => (el.textContent = money(C.freeDeliveryOver).replace(/\.00$/, "")));
  $("#year").textContent = new Date().getFullYear();
  $("#contact-link").href = "mailto:" + C.brand.supportEmail;
  if (!live) $("#demo-bar").hidden = false;

  const socialIcons = {
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 3 2.5 5 5.5 5"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/></svg>',
  };
  $("#socials").innerHTML = Object.entries(C.social)
    .filter(([, url]) => url)
    .map(([k, url]) => `<a href="${esc(url)}" aria-label="${k}" target="_blank" rel="noopener">${socialIcons[k] || ""}</a>`)
    .join("");

  // ---------- Rendering ----------
  function productCard(p) {
    state.products.set(p.id, p);
    const off = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
    const soldOut = p.variants.length && !p.variants.some((v) => v.available);
    return `
      <article class="card">
        <button class="card-media" data-product="${esc(p.id)}" aria-label="View ${esc(p.title)}">
          ${media(p)}
          ${off ? `<span class="badge">${off}% off</span>` : ""}
          ${soldOut ? `<span class="badge badge-muted">Sold out</span>` : ""}
        </button>
        <div class="card-body">
          <p class="card-cat">${esc(catTitle(p.category) || p.categoryLabel || "")}</p>
          <h3><button class="link-btn" data-product="${esc(p.id)}">${esc(p.title)}</button></h3>
          <p class="price">
            <span class="now">${money(p.price, p.currency)}</span>
            ${p.compareAt ? `<s>${money(p.compareAt, p.currency)}</s>` : ""}
          </p>
        </div>
        <button class="quick-add" data-quick="${esc(p.id)}" ${soldOut ? "disabled" : ""} aria-label="Add ${esc(p.title)} to basket">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </article>`;
  }

  const renderGrid = (el, list) => (el.innerHTML = list.map(productCard).join(""));

  function renderCategories() {
    $("#category-row").innerHTML = state.categories
      .map(
        (c) => `
        <button class="cat-card" data-category="${esc(c.handle)}">
          <span class="cat-media">${media(c, 500)}</span>
          <span class="cat-name">${esc(c.title)}</span>
        </button>`
      )
      .join("");
    $("#search-cat").innerHTML =
      '<option value="">All categories</option>' +
      state.categories.map((c) => `<option value="${esc(c.handle)}">${esc(c.title)}</option>`).join("");
    $("#footer-cats").innerHTML = state.categories
      .slice(0, 6)
      .map((c) => `<li><a href="#results" data-category="${esc(c.handle)}">${esc(c.title)}</a></li>`)
      .join("");
  }

  function renderHero(items) {
    $("#hero-arch").innerHTML = `<div class="arch-inner">${items
      .slice(0, 4)
      .map((it) => `<div class="arch-tile">${media(it, 500)}</div>`)
      .join("")}</div>`;
  }

  function renderArticles(articles) {
    if (!articles.length) {
      $("#journal").hidden = true;
      $("[data-journal-link]").hidden = true;
      return;
    }
    const fmt = new Intl.DateTimeFormat(C.locale, { day: "numeric", month: "long", year: "numeric" });
    $("#journal-grid").innerHTML = articles
      .map(
        (a) => `
        <a class="post" href="${esc(a.url)}">
          <span class="post-media">${a.image ? media({ image: a.image, title: a.title }, 700) : ART(a.art[0], a.art[1], a.title)}</span>
          <time datetime="${esc(a.date)}">${fmt.format(new Date(a.date))}</time>
          <h3>${esc(a.title)}</h3>
          <p>${esc(a.excerpt || "")}</p>
        </a>`
      )
      .join("");
  }

  function renderReviews() {
    if (!C.reviews.length) return;
    $("#reviews").hidden = false;
    $("#review-row").innerHTML = C.reviews
      .map(
        (r) => `
        <figure class="review">
          <blockquote>${esc(r.quote)}</blockquote>
          <figcaption><strong>${esc(r.name)}</strong>${r.product ? ` on ${esc(r.product)}` : ""}</figcaption>
        </figure>`
      )
      .join("");
  }

  // ---------- Search and category filtering ----------
  async function showResults(title, loader) {
    const section = $("#results");
    section.hidden = false;
    $("#results-title").textContent = title;
    $("#results-grid").innerHTML = "";
    $("#results-empty").hidden = true;
    section.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    try {
      const list = await loader();
      renderGrid($("#results-grid"), list);
      if (!list.length) {
        $("#results-empty").hidden = false;
        $("#results-empty").textContent = "Nothing matches that yet. Try a shorter search or pick another category.";
      }
    } catch (err) {
      $("#results-empty").hidden = false;
      $("#results-empty").textContent = "Products couldn't load: " + err.message;
    }
  }

  function demoFilter(term, cat) {
    const t = term.toLowerCase();
    return DEMO.products.filter(
      (p) => (!cat || p.category === cat) && (!t || (p.title + " " + p.description + " " + catTitle(p.category)).toLowerCase().includes(t))
    );
  }

  function filterCategory(handle) {
    $("#search-cat").value = handle;
    showResults(catTitle(handle), () => (live ? API.collection(handle) : Promise.resolve(demoFilter("", handle))));
  }

  $("#search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const term = $("#search-q").value.trim();
    const cat = $("#search-cat").value;
    if (!term && cat) return filterCategory(cat);
    if (!term) return $("#search-q").focus();
    const label = cat ? `“${term}” in ${catTitle(cat)}` : `Results for “${term}”`;
    showResults(label, async () => {
      if (!live) return demoFilter(term, cat);
      const list = await API.search(term);
      return cat ? list.filter((p) => p.category === cat) : list;
    });
  });

  $("#results-clear").addEventListener("click", () => {
    $("#results").hidden = true;
    $("#search-q").value = "";
    $("#search-cat").value = "";
  });

  $$("[data-scroll]").forEach((b) =>
    b.addEventListener("click", () => {
      const row = $("#category-row");
      row.scrollBy({ left: Number(b.dataset.scroll) * row.clientWidth * 0.8, behavior: "smooth" });
    })
  );

  // ---------- Product dialog ----------
  const dlg = $("#product-dialog");
  let current = null;
  let qty = 1;

  function selectedVariant() {
    const picks = Object.fromEntries($$("#pd-options select").map((s) => [s.name, s.value]));
    return current.variants.find((v) => Object.entries(picks).every(([k, val]) => v.options[k] === val)) || current.variants[0];
  }

  function updateDialogVariant() {
    const v = selectedVariant();
    $("#pd-price").innerHTML = `${money(v.price, v.currency || current.currency)}${v.compareAt && v.compareAt > v.price ? ` <s>${money(v.compareAt, v.currency || current.currency)}</s>` : ""}`;
    $("#pd-add").disabled = !v.available;
    $("#pd-add").textContent = v.available ? "Add to basket" : "Sold out";
    $("#pd-stock").textContent = v.available ? "In stock and ready to send." : "This option is sold out.";
  }

  function openProduct(p) {
    current = p;
    qty = 1;
    $("#pd-qty").textContent = qty;
    $("#pd-media").innerHTML = media(p, 900);
    $("#pd-cat").textContent = catTitle(p.category) || p.categoryLabel || "";
    $("#pd-title").textContent = p.title;
    $("#pd-desc").textContent = p.description || "";

    const optionNames = [...new Set(p.variants.flatMap((v) => Object.keys(v.options)))];
    $("#pd-options").innerHTML = optionNames
      .map((name) => {
        const values = [...new Set(p.variants.map((v) => v.options[name]).filter(Boolean))];
        const first = (p.variants.find((v) => v.available) || p.variants[0]).options[name];
        return `<label class="pd-option"><span>${esc(name)}</span>
          <select name="${esc(name)}">${values.map((val) => `<option ${val === first ? "selected" : ""}>${esc(val)}</option>`).join("")}</select></label>`;
      })
      .join("");
    $$("#pd-options select").forEach((s) => s.addEventListener("change", updateDialogVariant));
    updateDialogVariant();
    dlg.showModal();
  }

  dlg.addEventListener("click", (e) => {
    if (e.target === dlg || e.target.closest("[data-close]")) dlg.close();
    const q = e.target.closest("[data-qty]");
    if (q) {
      qty = Math.max(1, Math.min(20, qty + Number(q.dataset.qty)));
      $("#pd-qty").textContent = qty;
    }
  });

  $("#pd-add").addEventListener("click", async () => {
    const ok = await addToCart(current, selectedVariant(), qty);
    if (ok) {
      dlg.close();
      openCart();
    }
  });

  // ---------- Cart ----------
  const drawer = $("#cart-drawer");
  const backdrop = $("#drawer-backdrop");
  let lastFocus = null;

  function openCart() {
    lastFocus = document.activeElement;
    drawer.classList.add("open");
    drawer.removeAttribute("inert");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.hidden = false;
    $("#cart-close").focus();
  }
  function closeCart() {
    drawer.classList.remove("open");
    drawer.setAttribute("inert", "");
    drawer.setAttribute("aria-hidden", "true");
    backdrop.hidden = true;
    if (lastFocus) lastFocus.focus();
  }
  $("#cart-open").addEventListener("click", openCart);
  $("#cart-close").addEventListener("click", closeCart);
  backdrop.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeCart();
  });
  $$("[data-close-cart]").forEach((a) => a.addEventListener("click", closeCart));

  function saveDemoCart() {
    store.set("omega-demo-cart", JSON.stringify(state.cart.lines));
  }

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  async function withBusy(fn) {
    if (state.busy) return false;
    state.busy = true;
    drawer.classList.add("busy");
    try {
      await fn();
      return true;
    } catch (err) {
      toast("That didn't work: " + err.message);
      return false;
    } finally {
      state.busy = false;
      drawer.classList.remove("busy");
      renderCart();
    }
  }

  function addToCart(p, v, n) {
    return withBusy(async () => {
      if (live) {
        state.cart = await API.addLine(state.cart.id, v.id, n);
        store.set("omega-cart-id", state.cart.id);
      } else {
        const existing = state.cart.lines.find((l) => l.key === v.id);
        if (existing) existing.qty += n;
        else
          state.cart.lines.push({
            key: v.id, variantId: v.id, productId: p.id, title: p.title,
            variantTitle: v.title === "Default" ? "" : v.title, price: v.price,
            currency: C.currency, qty: n, image: p.image, art: p.art,
          });
        saveDemoCart();
      }
      toast(`Added ${p.title} to your basket`);
    });
  }

  function setQty(key, n) {
    return withBusy(async () => {
      if (live) {
        state.cart = await API.updateLine(state.cart.id, key, n);
      } else {
        const line = state.cart.lines.find((l) => l.key === key);
        if (line) line.qty = n;
        state.cart.lines = state.cart.lines.filter((l) => l.qty > 0);
        saveDemoCart();
      }
    });
  }

  function renderCart() {
    const lines = state.cart.lines;
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
    const cur = (lines[0] && lines[0].currency) || C.currency;

    const badge = $("#cart-count");
    badge.hidden = !count;
    badge.textContent = count;
    $("#cart-open").setAttribute("aria-label", count ? `Open basket, ${count} item${count === 1 ? "" : "s"}` : "Open basket");

    $("#cart-empty").hidden = !!lines.length;
    $("#cart-foot").hidden = !lines.length;
    $("#cart-subtotal").textContent = money(subtotal, cur);

    const left = C.freeDeliveryOver - subtotal;
    const pct = Math.min(100, (subtotal / C.freeDeliveryOver) * 100);
    $("#free-meter").hidden = !lines.length;
    $("#free-meter").innerHTML = `<p>${left > 0 ? `Add <strong>${money(left, cur)}</strong> more for free delivery.` : "You've got free delivery."}</p>
      <div class="meter"><span style="width:${pct}%"></span></div>`;

    $("#cart-lines").innerHTML = lines
      .map(
        (l) => `
        <li class="line">
          <span class="line-media">${media(l, 200)}</span>
          <div class="line-info">
            <p class="line-title">${esc(l.title)}</p>
            ${l.variantTitle ? `<p class="line-variant">${esc(l.variantTitle)}</p>` : ""}
            <div class="qty qty-sm">
              <button type="button" data-line="${esc(l.key)}" data-to="${l.qty - 1}" aria-label="Decrease quantity of ${esc(l.title)}">−</button>
              <span>${l.qty}</span>
              <button type="button" data-line="${esc(l.key)}" data-to="${l.qty + 1}" aria-label="Increase quantity of ${esc(l.title)}">+</button>
            </div>
          </div>
          <div class="line-end">
            <strong>${money(l.price * l.qty, l.currency)}</strong>
            <button class="link-btn remove" type="button" data-line="${esc(l.key)}" data-to="0">Remove</button>
          </div>
        </li>`
      )
      .join("");
  }

  $("#cart-lines").addEventListener("click", (e) => {
    const b = e.target.closest("[data-line]");
    if (b) setQty(b.dataset.line, Math.min(50, Number(b.dataset.to)));
  });

  $("#checkout-btn").addEventListener("click", () => {
    if (live && state.cart.checkoutUrl) {
      window.location.href = state.cart.checkoutUrl;
    } else {
      $("#checkout-note").textContent = "Checkout opens once Shopify is connected in config.js. This is demo mode.";
    }
  });

  // ---------- Global clicks ----------
  document.addEventListener("click", (e) => {
    const prod = e.target.closest("[data-product]");
    if (prod) return openProduct(state.products.get(prod.dataset.product));

    const quick = e.target.closest("[data-quick]");
    if (quick) {
      const p = state.products.get(quick.dataset.quick);
      const hasChoices = p.variants.length > 1;
      if (hasChoices) return openProduct(p);
      return addToCart(p, p.variants[0], 1).then((ok) => ok && openCart());
    }

    const cat = e.target.closest("[data-category]");
    if (cat) {
      e.preventDefault();
      return filterCategory(cat.dataset.category);
    }

    const policy = e.target.closest("[data-policy]");
    if (policy && !live) {
      e.preventDefault();
      toast("Policy pages come from Shopify once it's connected.");
    }
  });

  $("#account-link").addEventListener("click", (e) => {
    if (!live) {
      e.preventDefault();
      toast("Customer accounts come from Shopify once it's connected.");
    }
  });

  // ---------- Newsletter ----------
  $("#offer-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const note = $("#offer-note");
    const email = $("#offer-email").value.trim();
    if (!C.newsletterEndpoint) {
      note.textContent = "Sign-up isn't open yet. Check back soon.";
      return;
    }
    try {
      const body = new FormData();
      body.append("email", email);
      await fetch(C.newsletterEndpoint, { method: "POST", body, mode: "no-cors" });
      note.textContent = "You're on the list. Your code is on its way to your inbox.";
      e.target.reset();
    } catch {
      note.textContent = "Sign-up failed. Check your connection and try again.";
    }
  });

  // ---------- Boot ----------
  async function boot() {
    if (!live) {
      state.categories = DEMO.categories.map((c) => ({ ...c, image: null }));
      renderCategories();
      renderHero(DEMO.categories.filter((c) => ["clothing", "home", "tech", "kitchen"].includes(c.handle)).map((c) => ({ ...c, image: null })));
      renderGrid($("#best-grid"), DEMO.products.filter((p) => p.bestSeller).slice(0, 8));
      renderGrid($("#new-grid"), DEMO.products.filter((p) => !p.bestSeller).slice(0, 8));
      renderArticles(DEMO.articles);
      try { state.cart.lines = JSON.parse(store.get("omega-demo-cart") || "[]"); } catch { state.cart.lines = []; }
    } else {
      try {
        const cat = await API.catalog();
        state.shopUrl = cat.shopUrl.replace(/\/$/, "");
        state.categories = cat.categories;
        renderCategories();
        renderHero(cat.best.filter((p) => p.image).length >= 4 ? cat.best.filter((p) => p.image) : cat.categories.filter((c) => c.image));
        renderGrid($("#best-grid"), cat.best);
        renderGrid($("#new-grid"), cat.newest.filter((p) => !cat.best.some((b) => b.id === p.id)).slice(0, 8));
        renderArticles(cat.articles);
        $("#account-link").href = state.shopUrl + "/account";
        $$("[data-policy]").forEach((a) => (a.href = `${state.shopUrl}/policies/${a.dataset.policy}`));
        if (!state.categories.length) $("#categories").hidden = true;
      } catch (err) {
        $("#best-grid").innerHTML = `<p class="empty">Products couldn't load from Shopify: ${esc(err.message)}</p>`;
      }
      const savedId = store.get("omega-cart-id");
      if (savedId) {
        try {
          state.cart = (await API.getCart(savedId)) || state.cart;
          if (!state.cart.id) store.set("omega-cart-id", null);
        } catch {
          store.set("omega-cart-id", null);
        }
      }
    }
    renderReviews();
    renderCart();
  }

  boot();
})();
