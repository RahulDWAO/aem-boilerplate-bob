/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for the vidaworld.com vida-kkr-product template.
 *
 * Adds EDS section breaks (<hr>) and Section Metadata blocks based on the
 * section boundaries defined in tools/importer/page-templates.json.
 *
 * Uses BOTH hooks (marker pattern): several section boundary selectors are the
 * exact elements block parsers replace via element.replaceWith(block) between
 * the two hooks (e.g. div.vx2herowithprice -> hero-kkr, div.communitygallery
 * -> carousel-gallery, div.KkrFeatureGrid -> cards-kkr-grid, div.descriptioncard
 * -> columns-desc, div.priceandspec -> cards-merch). Those elements no longer
 * exist by afterTransform, so breaks are inserted in beforeTransform (while
 * every section element still exists) using a temporary marker attribute on the
 * <hr>; Section Metadata blocks are inserted in afterTransform, anchored to the
 * surviving marker <hr> (or the original element for the first section).
 *
 * Section boundary selectors (all verified against migration-work/cleaned.html):
 *   rc4  Hero with Interest Form  -> div.vx2herowithprice           (first section, no <hr>)
 *   rc5  Community Gallery        -> div.communitygallery
 *   rc6  Manifesto Text           -> div.manifestosection
 *   rc7  Ride Mode / 360 Visual   -> div.rideModeSection
 *   rc8  KKR Feature Grid         -> div.KkrFeatureGrid              style: light
 *   rc9  Description Card         -> div.descriptioncard
 *   rc10 Power Play Banner        -> div.bannercarousel:nth-of-type(7)
 *   rc11 KKR Merchandise Grid     -> div.priceandspec                style: light
 *   rc12 Hook-Step Challenge      -> div.bannercarousel:nth-of-type(9)
 *
 * Expected output for this template: 8 <hr> (sections.length - 1) and
 * 2 Section Metadata blocks (rc8 and rc11 define style "light").
 *
 * NOTE: named vida-* to avoid colliding with the existing bobcard-sections.js;
 * the BOBCARD transformer is not modified.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

function resolveSectionEl(element, section) {
  const selectors = Array.isArray(section.selector)
    ? section.selector
    : [section.selector].filter(Boolean);
  for (const sel of selectors) {
    if (!sel) continue;
    const el = element.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) return;

  const doc = (payload && payload.document) || element.ownerDocument;

  if (hookName === TransformHook.beforeTransform) {
    // Insert section breaks now, before parsers can replace any section element.
    // Reverse order so earlier insertions don't shift later live boundaries.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      // First section: no leading break needed and (here) no style either.
      if (i === 0 && !section.style) continue;
      const sectionEl = resolveSectionEl(element, section);
      if (!sectionEl) continue; // selector didn't match on this page — skip, never guess

      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === TransformHook.afterTransform) {
    // Parsers have now run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists: the
    // marker <hr> placed above, or (first section, no marker) the element itself.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || resolveSectionEl(element, section);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
