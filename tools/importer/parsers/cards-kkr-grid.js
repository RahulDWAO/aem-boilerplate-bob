/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-kkr-grid.
 * Base block: cards (2 columns; each row = one card: cell 1 image, cell 2 text).
 * Source: https://www.vidaworld.com/vida-kkr-knight-edition.html
 * Selector: div.KkrFeatureGrid
 * Generated: 2026-08-23
 *
 * Source structure (verified in migration-work/block-context/cards-kkr-grid/source.html):
 *   <div class="KkrFeatureGrid">
 *     <section class="kkr-feature-grid">
 *       <div class="kkr-feature-grid__masonry">
 *         <div class="kkr-feature-grid__col">
 *           <a class="kkr-feature-grid__tile ..." href="https://.../vx2-plus-electric-scooter.html">
 *             <picture><img src="https://.../Grid-A-ride-echoes-Mobile.png"></picture>
 *           </a>
 *           ... (5 linked image tiles total, spread across columns)
 *       <div class="kkr-feature-grid__specs">
 *         <button ...>View Specifications</button>  <- disclosure (default content, dropped from block)
 *
 * Library convention (cards): 2 columns. Cell 1 = image; cell 2 = text (title /
 * description / CTA). Each card is a row. Here every tile is an image-only link
 * (the caption/label is baked into the image artwork), so cell 2 is empty and the
 * linked image goes in cell 1 (anchor preserved so the destination href survives).
 * The "View Specifications" disclosure is treated as default content (see
 * authoring-analysis rc8 seq2) and excluded from the block.
 */
export default function parse(element, { document }) {
  // Feature tiles: each is an anchor wrapping a picture/image.
  const tiles = Array.from(element.querySelectorAll('a.kkr-feature-grid__tile, .kkr-feature-grid__masonry a[href]'));

  const cells = [];
  tiles.forEach((a) => {
    const img = a.querySelector('img');
    if (!img) return;
    // Cell 1: linked image (anchor preserved for href round-trip). Cell 2: empty
    // (label baked into artwork) — kept to hold the 2-column shape.
    cells.push([a, '']);
  });

  // Empty-block guard: no tiles → unwrap, leaving original content in place.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-kkr-grid', cells });
  element.replaceWith(block);
}
