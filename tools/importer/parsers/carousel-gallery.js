/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-gallery.
 * Base block: carousel (2 columns; each row = one slide: cell 1 image, cell 2 optional text).
 * Source: https://www.vidaworld.com/vida-kkr-knight-edition.html
 * Selector: div.communitygallery
 * Generated: 2026-08-23
 *
 * Source structure (verified in migration-work/block-context/carousel-gallery/source.html):
 *   <div class="communitygallery">
 *     <section class="community-gallery-main-container ...">
 *       <img> (full-width block background — dropped, block-specific design)
 *       <div class="carousel-track">
 *         <div class="carousel-slide">
 *           <div class="image-container">
 *             <a class="carousel-slide__link" href="https://youtu.be/...">
 *               <img class="carousel-image" alt="Community gallery image N">
 *             </a>
 *       ...  (8 slides: first 4 unique, last 4 are loop clones of the same 4 YouTube links)
 *       <div class="button-container">
 *         <a class="explore-button--kkr-instagram" href="instagram.com/...">
 *           <span>Visit VIDAWorld on Instagram</span> ...
 *
 * Library convention (carousel): 2 columns. Cell 1 = slide image; cell 2 = optional
 * text (title / description / CTA). Each slide is a row.
 *
 * The DM transformer (vida-dm-images.js) converts DM <img> to carrier anchors, so
 * we preserve the linked image (carousel-slide__link anchor wrapping the img) as-is
 * to keep the YouTube destination href. Loop-clone slides are de-duped by href so
 * each moment appears once. The section-level "Visit VIDAWorld on Instagram" CTA is
 * preserved in the text cell of the final slide so it survives the import.
 */
export default function parse(element, { document }) {
  // Slide links: each slide wraps its image in an anchor to a YouTube moment.
  const slideLinks = Array.from(element.querySelectorAll('.carousel-slide a.carousel-slide__link, .carousel-slide a[href]'));

  // De-dupe loop clones by destination href (falls back to image src).
  const seen = new Set();
  const uniqueSlides = [];
  slideLinks.forEach((a) => {
    const img = a.querySelector('img');
    const key = a.getAttribute('href') || (img && img.getAttribute('src')) || '';
    if (!key || seen.has(key)) return;
    seen.add(key);
    if (img) uniqueSlides.push({ link: a, img });
  });

  // Section-level CTA (Instagram) — preserved on the last slide's text cell.
  const ctaLink = element.querySelector('.button-container a[href], a.explore-button');

  // Empty-block guard: no slides means nothing to render.
  if (!uniqueSlides.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  uniqueSlides.forEach(({ link }, idx) => {
    // Cell 1: the linked slide image (anchor preserved for href round-trip).
    // Cell 2: text — empty for slides, except the CTA attached to the last slide.
    const isLast = idx === uniqueSlides.length - 1;
    cells.push([link, isLast && ctaLink ? ctaLink : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-gallery', cells });
  element.replaceWith(block);
}
