import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * KKR feature grid — a masonry of linked image tiles.
 *
 * Authored content: each row holds an <a> that wraps one or more <picture>
 * elements (captions are baked into the artwork). The source renders these as
 * a 3-column masonry:
 *   col 1 = two stacked tiles, col 2 = one tall tile, col 3 = two stacked tiles.
 *
 * We flatten the authored rows into individual tiles (preserving each tile's
 * link target) and distribute them across three columns so the CSS can
 * reproduce the masonry. The single-tile centre column is flagged so it can
 * stretch to the full masonry height on desktop.
 */
export default function decorate(block) {
  // 1. Flatten authored rows into an ordered list of linked tiles.
  const tiles = [];
  [...block.children].forEach((row) => {
    const link = row.querySelector('a');
    const pictures = [...row.querySelectorAll('picture')];
    if (!pictures.length) return;
    const href = link ? link.getAttribute('href') : null;
    pictures.forEach((picture) => {
      const tile = document.createElement(href ? 'a' : 'div');
      if (href) tile.href = href;
      tile.className = 'cards-kkr-grid-tile';
      tile.append(picture);
      tiles.push(tile);
    });
  });

  // 2. Optimize images.
  tiles.forEach((tile) => {
    const img = tile.querySelector('img');
    if (!img) return;
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    tile.querySelector('picture').replaceWith(optimized);
  });

  // 3. Distribute tiles across three columns.
  // For the canonical 5-tile layout: [2, 1, 2] with the centre column tall.
  // Otherwise fall back to an even, order-preserving split.
  let groups;
  let tallIndex = -1;
  if (tiles.length === 5) {
    groups = [[tiles[0], tiles[1]], [tiles[2]], [tiles[3], tiles[4]]];
    tallIndex = 1;
  } else {
    const cols = Math.min(3, tiles.length) || 1;
    groups = Array.from({ length: cols }, () => []);
    tiles.forEach((tile, i) => groups[i % cols].push(tile));
  }

  // 4. Build the masonry DOM.
  const masonry = document.createElement('div');
  masonry.className = 'cards-kkr-grid-masonry';
  groups.forEach((group, i) => {
    const col = document.createElement('div');
    col.className = 'cards-kkr-grid-col';
    if (i === tallIndex) col.classList.add('cards-kkr-grid-col-tall');
    group.forEach((tile) => col.append(tile));
    masonry.append(col);
  });

  block.textContent = '';
  block.append(masonry);
}
