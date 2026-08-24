export default function decorate(block) {
  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }

  // The hero title ("A Legacy of Victory meets the Future of Mobility") is
  // baked into the banner artwork, so the page would otherwise have no <h1>
  // and start heading order at <h2>. Add a visually-hidden <h1> (derived from
  // the hero image alt when present, else the document title) so the page has
  // a single, correct top-level heading for assistive tech and SEO — without
  // changing the visual design.
  if (!document.querySelector('main h1')) {
    const img = block.querySelector('img');
    const alt = ((img && img.getAttribute('alt')) || '').trim();
    const title = alt || (document.title || '').split(/[|–-]/)[0].trim() || 'VIDA VX2 Knight Edition';
    const h1 = document.createElement('h1');
    h1.className = 'sr-only';
    h1.textContent = title;
    block.prepend(h1);
  }
}
