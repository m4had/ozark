// Line illustrations used for demo products and categories when there is no photo.
// Real Shopify product images replace these automatically.
(function () {
  const S = 'fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"';
  const shapes = {
    tee: `<path ${S} d="M74 50 L50 60 L32 86 L50 98 L60 88 L60 152 L140 152 L140 88 L150 98 L168 86 L150 60 L126 50 Q100 68 74 50Z"/>`,
    hoodie: `<path ${S} d="M74 54 L54 62 L40 142 L56 144 L64 96 L64 156 L136 156 L136 96 L144 144 L160 142 L146 62 L126 54 Q100 26 74 54Z"/><path ${S} d="M84 56 Q100 78 116 56"/><path ${S} d="M80 126 H120 V146 H80Z"/><path ${S} d="M94 70 V92 M106 70 V92"/>`,
    cap: `<path ${S} d="M48 124 Q48 66 100 66 Q152 66 152 124Z"/><path ${S} d="M100 124 H170 Q168 138 154 138 H100"/><path ${S} d="M100 66 V124"/><circle cx="100" cy="64" r="4" fill="currentColor"/>`,
    sneaker: `<path ${S} d="M38 132 Q38 104 58 100 L88 92 Q98 112 126 114 Q156 118 166 132 V140 Q166 146 160 146 H44 Q38 146 38 140Z"/><path ${S} d="M38 132 H166"/><path ${S} d="M84 104 L94 98 M92 110 L102 104 M100 114 L110 108"/>`,
    tote: `<path ${S} d="M56 84 H144 L136 158 H64Z"/><path ${S} d="M78 84 V70 Q78 48 100 48 Q122 48 122 70 V84"/>`,
    lamp: `<path ${S} d="M70 58 H130 L148 104 H52Z"/><path ${S} d="M100 104 V150"/><path ${S} d="M70 156 H130"/><path ${S} d="M118 104 V120"/>`,
    candle: `<rect ${S} x="64" y="88" width="72" height="66" rx="12"/><path ${S} d="M64 108 H136"/><path ${S} d="M100 88 V76"/><path fill="currentColor" d="M100 46 Q112 62 100 72 Q88 62 100 46Z"/>`,
    plant: `<path ${S} d="M68 118 H132 L124 158 H76Z"/><path ${S} d="M100 118 V80"/><path ${S} d="M100 96 Q72 96 64 70 Q92 66 100 96Z"/><path ${S} d="M100 86 Q126 84 136 56 Q106 54 100 86Z"/><path ${S} d="M100 80 Q94 58 104 42 Q114 60 100 80Z"/>`,
    mug: `<rect ${S} x="54" y="72" width="70" height="80" rx="10"/><path ${S} d="M124 88 Q150 88 150 110 Q150 132 124 132"/><path ${S} d="M76 58 Q70 50 76 42 M98 58 Q92 50 98 42"/>`,
    pan: `<circle ${S} cx="84" cy="108" r="46"/><circle ${S} cx="84" cy="108" r="34"/><path ${S} d="M130 108 H176"/>`,
    bottle: `<path ${S} d="M86 40 H114 V58 Q130 66 130 84 V152 Q130 160 122 160 H78 Q70 160 70 152 V84 Q70 66 86 58Z"/><path ${S} d="M70 100 H130 M70 128 H130"/>`,
    backpack: `<rect ${S} x="58" y="62" width="84" height="96" rx="20"/><path ${S} d="M58 96 Q100 112 142 96"/><rect ${S} x="76" y="118" width="48" height="26" rx="6"/><path ${S} d="M86 62 V52 Q86 42 100 42 Q114 42 114 52 V62"/>`,
    serum: `<rect ${S} x="74" y="92" width="52" height="66" rx="10"/><path ${S} d="M88 92 V78 H112 V92"/><path ${S} d="M94 78 V54 Q94 44 100 44 Q106 44 106 54 V78"/><path ${S} d="M84 120 H116"/>`,
    headphones: `<path ${S} d="M54 122 V102 Q54 56 100 56 Q146 56 146 102 V122"/><rect ${S} x="44" y="110" width="24" height="44" rx="10"/><rect ${S} x="132" y="110" width="24" height="44" rx="10"/>`,
    speaker: `<rect ${S} x="66" y="46" width="68" height="112" rx="14"/><circle ${S} cx="100" cy="118" r="22"/><circle cx="100" cy="118" r="6" fill="currentColor"/><circle ${S} cx="100" cy="74" r="9"/>`,
    watch: `<path ${S} d="M84 40 H116 L112 70 M84 40 L88 70 M88 130 L84 160 H116 L112 130"/><circle ${S} cx="100" cy="100" r="32"/><path ${S} d="M100 82 V100 L112 108"/>`,
    blocks: `<rect ${S} x="50" y="110" width="44" height="44" rx="4"/><rect ${S} x="106" y="110" width="44" height="44" rx="4"/><rect ${S} x="78" y="58" width="44" height="44" rx="4" transform="rotate(8 100 80)"/><path ${S} d="M64 140 L72 124 L80 140 M120 124 V140 H134"/>`,
    box: `<path ${S} d="M48 76 L100 52 L152 76 L100 100Z"/><path ${S} d="M48 76 V132 L100 156 L152 132 V76"/><path ${S} d="M100 100 V156"/>`,
  };

  // Soft tile colours, picked per product so the grid reads as a varied shop.
  const tones = {
    cobalt: ["#E4E7FA", "#2F38A8"],
    sage: ["#E1ECE4", "#2E5B43"],
    sand: ["#EFE8DA", "#6B5330"],
    lilac: ["#ECE5F5", "#5A3C86"],
    sky: ["#DFEDF3", "#1F5970"],
    blush: ["#F4E4E6", "#8A3443"],
    stone: ["#E8E9EC", "#3A3E4E"],
  };

  window.OMEGA_ART = function (kind, tone, label) {
    const [bg, fg] = tones[tone] || tones.stone;
    const body = shapes[kind] || shapes.box;
    const title = label ? `<title>${String(label).replace(/[<&>"]/g, "")}</title>` : "";
    return `<svg class="art" viewBox="0 0 200 200" role="img" aria-label="${label ? String(label).replace(/[<&>"]/g, "") : "Product illustration"}" style="background:${bg};color:${fg}">${title}${body}</svg>`;
  };
})();
