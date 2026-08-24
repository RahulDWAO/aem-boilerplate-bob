import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-merch-card-image';
      else div.className = 'cards-merch-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('li').forEach((li) => {
    const img = li.querySelector('picture > img');
    if (!img) return;
    // Source alt is often empty or a placeholder like "null null"; derive a
    // meaningful accessible name from the card's description so the product
    // image (and the card link) has a discernible name.
    const alt = (img.getAttribute('alt') || '').trim();
    const description = li.querySelector('.cards-merch-card-body p')?.textContent.trim();
    const resolvedAlt = (!alt || /^(null\s*)+$/i.test(alt)) && description ? description : alt;
    const optimizedPic = createOptimizedPicture(img.src, resolvedAlt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
