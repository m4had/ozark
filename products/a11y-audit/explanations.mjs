// Plain-English explanations for the axe-core rules small-business sites fail most often.
// Rules not listed fall back to axe's own one-line help text.
const RULES = {
  'color-contrast': {
    title: 'Text does not stand out enough from its background',
    why: 'People with low vision or colour blindness, or anyone reading on a phone in sunlight, may not be able to read it.',
    fix: 'Darken the text or lighten the background until normal text has a contrast ratio of at least 4.5:1 (3:1 for large text). A free contrast checker will tell you the ratio.',
  },
  'image-alt': {
    title: 'Images are missing a text description (alt text)',
    why: 'Screen-reader users hear nothing, or just the file name, so they miss what the image shows.',
    fix: 'Add an alt attribute describing the image\'s purpose, e.g. alt="Red leather handbag, front view". Use alt="" for purely decorative images.',
  },
  'link-name': {
    title: 'Links have no readable name',
    why: 'Screen readers announce just "link", so users cannot tell where it goes. Common with icon-only links.',
    fix: 'Put visible text inside the link, or add an aria-label such as aria-label="Instagram".',
  },
  'button-name': {
    title: 'Buttons have no readable name',
    why: 'Screen-reader users hear "button" with no clue what it does (e.g. basket, menu, close).',
    fix: 'Add text inside the button or an aria-label, e.g. aria-label="Open menu".',
  },
  label: {
    title: 'Form fields have no label',
    why: 'Screen-reader and voice-control users cannot tell what to type, which can block checkout or contact forms.',
    fix: 'Give each input a <label for="..."> that matches its id. Placeholder text on its own is not enough.',
  },
  'select-name': {
    title: 'Drop-down menus have no label',
    why: 'Users of assistive technology cannot tell what the drop-down is for.',
    fix: 'Add a <label> linked to the <select>, or an aria-label.',
  },
  'html-has-lang': {
    title: 'The page does not declare its language',
    why: 'Screen readers may read English text with the wrong pronunciation rules.',
    fix: 'Add lang="en-GB" (or the right language) to the <html> tag in your theme or template.',
  },
  'html-lang-valid': {
    title: 'The page language code is not valid',
    why: 'Screen readers cannot pick the right voice.',
    fix: 'Use a valid code such as lang="en-GB".',
  },
  'document-title': {
    title: 'The page has no title',
    why: 'The title is the first thing screen readers announce and what appears in browser tabs and search results.',
    fix: 'Add a unique, descriptive <title> to each page.',
  },
  'frame-title': {
    title: 'Embedded frames (maps, videos, widgets) have no title',
    why: 'Screen-reader users cannot tell what the embedded content is.',
    fix: 'Add a title attribute to each <iframe>, e.g. title="Map showing our shop location".',
  },
  'aria-hidden-focus': {
    title: 'Hidden content can still receive keyboard focus',
    why: 'Keyboard users land on elements they cannot see and screen readers do not announce, which is disorienting.',
    fix: 'Remove aria-hidden from focusable elements, or make them unfocusable with tabindex="-1" or the inert attribute.',
  },
  'duplicate-id-aria': {
    title: 'Several elements share the same ID used for accessibility',
    why: 'Labels and descriptions may be attached to the wrong element.',
    fix: 'Make every id on the page unique.',
  },
  'list': {
    title: 'Lists are not built correctly',
    why: 'Screen readers announce the wrong number of items or no list at all.',
    fix: '<ul> and <ol> should contain only <li> elements (plus <script>/<template>).',
  },
  'listitem': {
    title: 'List items are outside a list',
    why: 'Screen readers cannot announce them as part of a list.',
    fix: 'Wrap <li> elements in a <ul> or <ol>.',
  },
  'meta-viewport': {
    title: 'Zooming is disabled on mobile',
    why: 'People with low vision cannot pinch-zoom to read.',
    fix: 'Remove maximum-scale=1 and user-scalable=no from the viewport meta tag.',
  },
  'target-size': {
    title: 'Tap targets are too small or too close together',
    why: 'People with limited dexterity or tremors hit the wrong link or button.',
    fix: 'Make buttons and links at least 24×24 CSS pixels, or leave enough space around them.',
  },
  'link-in-text-block': {
    title: 'Links in text can only be spotted by colour',
    why: 'Colour-blind visitors may not see that the text is a link.',
    fix: 'Underline links within paragraphs (or give them another non-colour cue).',
  },
  'input-image-alt': {
    title: 'Image buttons have no text alternative',
    why: 'Screen-reader users cannot tell what the button does.',
    fix: 'Add an alt attribute describing the action, e.g. alt="Search".',
  },
  'svg-img-alt': {
    title: 'SVG images have no text alternative',
    why: 'Screen-reader users miss what the graphic conveys.',
    fix: 'Add role="img" and an aria-label or <title> inside the SVG; hide decorative SVGs with aria-hidden="true".',
  },
  'aria-required-children': {
    title: 'Interactive widgets are missing required parts',
    why: 'Menus, tabs or lists built with ARIA may not work with screen readers.',
    fix: 'Ensure elements with roles like menu, tablist or listbox contain the required child roles (menuitem, tab, option).',
  },
  'nested-interactive': {
    title: 'Clickable elements are nested inside each other',
    why: 'Screen readers may skip the inner control and keyboard users may not reach it.',
    fix: 'Do not put links or buttons inside other links or buttons.',
  },
};

export function explain(ruleId, fallbackHelp) {
  return RULES[ruleId] ?? {
    title: fallbackHelp,
    why: 'This can stop some disabled visitors from using this part of the site.',
    fix: 'See the technical reference below for exact steps; your web developer or theme provider can apply it.',
  };
}
