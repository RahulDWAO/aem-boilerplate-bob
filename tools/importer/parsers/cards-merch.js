/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-merch.
 * Base block: cards (2 columns; each row = one card: cell 1 image, cell 2 text).
 * Source: https://www.vidaworld.com/vida-kkr-knight-edition.html
 * Selector: div.priceandspec
 * Generated: 2026-08-23
 *
 * Source structure (verified in migration-work/block-context/cards-merch/source.html):
 *   <div class="priceandspec">
 *     <div class="price-and-spec price-and-spec--kkr">
 *       <div class="price-and-spec__container">
 *         <h2 class="scooter-variants-section__title">Exclusive VIDA × KKR Merchandise</h2>
 *             <- section heading: default content (see authoring-analysis rc11 seq1),
 *                lifted out as a sibling so it survives instead of being consumed.
 *         <div class="product-grid">
 *           <div class="product-card-link-wrapper ...">
 *             <div class="product-card ...">
 *               <div class="product-card__image"><img class="product-card__scooter-image"></div>
 *               <div class="product-card__info">
 *                 <div class="product-description">Buy the official KKR jersey</div>
 *                 <div class="product-card-kkr__cta-row">
 *                   <a class="product-card-kkr__know-more" href="https://shop.kkr.in/...">
 *                     <span>Know More</span><img class="...arrow"></a>
 *           ... (2 product cards)
 *
 * Library convention (cards): 2 columns. Cell 1 = product image; cell 2 = text
 * (description + "Know More" CTA). One row per card. The CTA anchor is preserved so
 * the shop destination href round-trips through the import.
 */
export default function parse(element, { document }) {
  // Section heading — default content, not part of the cards block.
  const sectionHeading = element.querySelector('.scooter-variants-section__title, h2');

  // One row per product card.
  const cards = Array.from(element.querySelectorAll('.product-card'));

  const cells = [];
  cards.forEach((card) => {
    // Cell 1: product image.
    const img = card.querySelector('.product-card__image img, img');

    // Cell 2: description + CTA link.
    const content = [];
    const desc = card.querySelector('.product-description');
    if (desc && desc.textContent.trim()) content.push(desc);
    const cta = card.querySelector('.product-card-kkr__know-more, .product-card__info a[href]');
    if (cta) content.push(cta);

    if (img || content.length) {
      cells.push([img || '', content.length ? content : '']);
    }
  });

  // Empty-block guard: no cards → unwrap, leaving original content in place.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-merch', cells });

  // Preserve the section heading (default content) ahead of the block.
  const replacements = [];
  if (sectionHeading) replacements.push(sectionHeading);
  replacements.push(block);
  element.replaceWith(...replacements);
}
