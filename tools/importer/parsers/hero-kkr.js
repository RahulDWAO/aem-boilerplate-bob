/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-kkr.
 * Base block: hero (1 column; rows: name / background image / content).
 * Source: https://www.vidaworld.com/vida-kkr-knight-edition.html
 * Selector: div.vx2herowithprice
 * Generated: 2026-08-23
 *
 * Source structure (verified in migration-work/block-context/hero-kkr/source.html):
 *   <div class="vx2herowithprice webpopup">
 *     <div class="vx2-hero ...">
 *       <div class="vx2-hero__image-container">
 *         <button class="vx2-hero__image-button">
 *           <img class="vx2-hero__image" src="...e99c4ce5...png">   <- full-bleed hero artwork
 *         </button>
 *       </div>
 *       <div class="vx2-hero__content">
 *         <h1 class="vx2-hero__heading"></h1>       <- empty (text baked into artwork)
 *         <h2 class="vx2-hero__subheading"></h2>    <- empty
 *       </div>
 *     </div>
 *     <div class="vida-teaser-info-form">...</div>  <- interactive lead-capture popup (dropped)
 *
 * Library convention (hero): row 2 = Background Image (optional), row 3 = Title /
 * Subheading / CTA (optional). Here the heading/subheading elements are empty and
 * the CTA is a JS-driven form popup (no href / no static text), so only the hero
 * artwork survives. Row 2 carries the image; row 3 is omitted.
 * The lead-capture form (vida-teaser-info-form) is interactive markup that cannot
 * round-trip through a static import and is intentionally excluded.
 */
export default function parse(element, { document }) {
  // Full-bleed hero artwork. Prefer the image inside the hero image container.
  const img = element.querySelector('.vx2-hero__image-container img, .vx2-hero__image, img');

  // Optional headline / subheading — only kept if they carry real text.
  const heading = element.querySelector('h1, .vx2-hero__heading');
  const subheading = element.querySelector('h2, .vx2-hero__subheading');

  // Empty-block guard: nothing to render without artwork or text.
  const hasHeading = heading && heading.textContent.trim();
  const hasSubheading = subheading && subheading.textContent.trim();
  if (!img && !hasHeading && !hasSubheading) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (single-column → one row, one cell).
  if (img) cells.push([img]);

  // Row 3: text content (only if any real heading/subheading text exists).
  const contentCell = [];
  if (hasHeading) contentCell.push(heading);
  if (hasSubheading) contentCell.push(subheading);
  if (contentCell.length) cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-kkr', cells });
  element.replaceWith(block);
}
