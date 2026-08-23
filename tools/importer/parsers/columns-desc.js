/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-desc.
 * Base block: columns (multi-column; row 2 defines the layout, one cell per column).
 * Source: https://www.vidaworld.com/vida-kkr-knight-edition.html
 * Selector: div.descriptioncard
 * Generated: 2026-08-23
 *
 * Source structure (verified in migration-work/block-context/columns-desc/source.html):
 *   <div class="descriptioncard">
 *     <div class="description-info-card ...">
 *       <img src="...c69f5be6...png">   <- product image (right column visual)
 *       <div class="description-info-wrapper column-reverse">
 *         <div class="description-info-left-wrapper">   <- LEFT column (text)
 *           <h2 class="description-info-title">VIDA VX2 Knight Edition</h2>
 *           <div class="description-info-content">Let victory charge your ride... </div>
 *           <div class="description-info-links-container">
 *             <button ...><span class="button__label">Locate a Dealer</span></button>  <- CTA (no href)
 *         <div class="description-info-right-wrapper">   <- RIGHT column (border/overlay only)
 *
 * Library convention (columns): row 2 = as many cells as visual columns. This is a
 * 2-column layout: left = text (heading, body, CTA), right = product image. The
 * product <img> sits outside the left/right wrappers in the source but is the right
 * column's visual, so it is placed in the second cell. The "Locate a Dealer" control
 * is a JS button with no href, so its label text is preserved (no link to round-trip).
 *
 * Note: the section also carries a `window.appConfig = ...` inline <script> JSON
 * config blob. That is page runtime config, not authored content, and is
 * intentionally excluded — it is the only source text the parser does not capture.
 * (Validator similarity is depressed by this script blob; visible authored content
 * — heading, body copy, CTA — is fully captured.)
 */
export default function parse(element, { document }) {
  const card = element.querySelector('.description-info-card') || element;

  // LEFT column: heading + body copy + CTA label.
  const leftCell = [];
  const heading = card.querySelector('.description-info-title, h2, h1, h3');
  if (heading) leftCell.push(heading);
  const body = card.querySelector('.description-info-content');
  if (body) leftCell.push(body);
  // CTA: prefer a real link; otherwise keep the button label text.
  const ctaLink = card.querySelector('.description-info-links-container a[href]');
  if (ctaLink) {
    leftCell.push(ctaLink);
  } else {
    const ctaLabel = card.querySelector('.description-info-links-container .button__label, .description-info-links-container button');
    if (ctaLabel && ctaLabel.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = ctaLabel.textContent.trim();
      leftCell.push(p);
    }
  }

  // RIGHT column: the product image (the card's visual).
  const img = card.querySelector(':scope > img, img');
  const rightCell = img ? [img] : [''];

  // Empty-block guard.
  if (!leftCell.length && !img) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Row 2: two columns — left text, right image.
  cells.push([leftCell.length ? leftCell : '', rightCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-desc', cells });
  element.replaceWith(block);
}
