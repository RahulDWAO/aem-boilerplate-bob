import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Closes any open megamenu panel and clears the active trigger state.
 * @param {Element} nav The nav element
 */
function closeAllPanels(nav) {
  nav.querySelectorAll('.nav-megamenu.is-open').forEach((p) => p.classList.remove('is-open'));
  nav.querySelectorAll('.nav-trigger[aria-expanded="true"]').forEach((t) => t.setAttribute('aria-expanded', 'false'));
}

/**
 * Closes the mobile drawer and resets the hamburger to its default state.
 * @param {Element} nav The nav element
 */
function closeMobileMenu(nav) {
  nav.setAttribute('aria-expanded', 'false');
  const button = nav.querySelector('.nav-hamburger button');
  if (button) button.setAttribute('aria-label', 'Open navigation');
  document.body.style.overflowY = '';
}

/**
 * Toggles the mobile drawer open/closed.
 * @param {Element} nav The nav element
 */
function toggleMobileMenu(nav) {
  const expanded = nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

/**
 * Wires a trigger to its megamenu panel: open on hover (desktop), toggle on
 * click, and support keyboard (Enter/Space). Panels are also opened when the
 * pointer enters the panel itself so it stays open while the user moves into it.
 * @param {Element} nav The nav element
 * @param {Element} trigger The trigger anchor/button
 * @param {Element} panel The associated .nav-megamenu panel
 */
function wireMegamenu(nav, trigger, panel) {
  const open = () => {
    if (!isDesktop.matches) return;
    closeAllPanels(nav);
    panel.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    panel.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  };

  trigger.addEventListener('mouseenter', open);
  panel.addEventListener('mouseenter', () => { if (isDesktop.matches) panel.classList.add('is-open'); });

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = panel.classList.contains('is-open');
    closeAllPanels(nav);
    if (!isOpen) {
      panel.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      trigger.click();
    }
  });

  return { open, close };
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment (localhost then DA/EDS)
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  let fragment = await loadFragment('/content/nav');
  if (!fragment || !fragment.firstElementChild) {
    fragment = await loadFragment(navPath);
  }

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // The fragment produces five sections, in order:
  // 0 brand/logo, 1 nav triggers, 2 Products megamenu, 3 Explore megamenu, 4 actions
  const sections = [...nav.children];
  const [brand, triggers, products, explore, actions] = sections;
  if (brand) brand.classList.add('nav-brand');
  if (triggers) triggers.classList.add('nav-links');
  if (products) {
    products.classList.add('nav-megamenu', 'nav-megamenu-products', 'nav-panel');
    products.dataset.depth = '0';
  }
  if (explore) {
    explore.classList.add('nav-megamenu', 'nav-megamenu-explore', 'nav-panel');
    explore.dataset.depth = '0';
  }
  if (actions) actions.classList.add('nav-actions');

  // Strip EDS button decoration from any decorated links (logo, actions).
  nav.querySelectorAll('a.button').forEach((a) => {
    const container = a.closest('.button-container');
    a.className = '';
    if (container) container.className = '';
  });

  // Resolve relative nav image paths (authored relative to /content/nav) to
  // absolute /content/… paths so they load on any page URL.
  nav.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('http') && !src.startsWith('/')) {
      img.setAttribute('src', `/content/${src}`);
    }
  });

  // Build the fixed header bar: logo (left), nav links (center), actions (right).
  const bar = document.createElement('div');
  bar.className = 'nav-bar';
  const barInner = document.createElement('div');
  barInner.className = 'nav-bar-inner';

  // Turn the Products / Explore link list into hover triggers bound to panels.
  const triggerMap = { products, explore };
  if (triggers) {
    triggers.querySelectorAll('a').forEach((a) => {
      const key = (a.getAttribute('href') || '').replace('#', '');
      const panel = triggerMap[key];
      a.classList.add('nav-trigger');
      a.setAttribute('role', 'button');
      a.setAttribute('aria-haspopup', 'true');
      a.setAttribute('aria-expanded', 'false');
      a.removeAttribute('href');
      a.setAttribute('tabindex', '0');
      if (panel) wireMegamenu(nav, a, panel);
    });
  }

  // Convert the first action (Test Ride) into a primary CTA-styled link, and
  // the India entry into a country selector affordance.
  if (actions) {
    const items = [...actions.querySelectorAll('li')];
    const cta = items[0]?.querySelector('a');
    if (cta) cta.classList.add('nav-cta');
    const country = items[1]?.querySelector('a');
    if (country) {
      country.classList.add('nav-country');
      country.setAttribute('role', 'button');
      country.setAttribute('aria-haspopup', 'true');
      country.setAttribute('aria-expanded', 'false');
      country.removeAttribute('href');
      country.setAttribute('tabindex', '0');
      country.addEventListener('click', (e) => {
        e.preventDefault();
        const expanded = country.getAttribute('aria-expanded') === 'true';
        country.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    }
  }

  if (brand) barInner.append(brand);
  if (triggers) barInner.append(triggers);
  if (actions) barInner.append(actions);

  // Hamburger for mobile — prepended so it sits at the left on small screens.
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMobileMenu(nav));
  barInner.prepend(hamburger);

  bar.append(barInner);

  // Assemble: bar first, then the megamenu panels (full-width, below the bar).
  const assembled = [bar];
  if (products) assembled.push(products);
  if (explore) assembled.push(explore);
  nav.replaceChildren(...assembled);

  nav.setAttribute('aria-expanded', 'false');

  // Close panels when the pointer leaves the whole nav (desktop hover-out).
  nav.addEventListener('mouseleave', () => { if (isDesktop.matches) closeAllPanels(nav); });

  // Close on Escape; also close mobile drawer on Escape.
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      closeAllPanels(nav);
      if (!isDesktop.matches) closeMobileMenu(nav);
    }
  });

  // Close desktop panels when clicking outside the header.
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeAllPanels(nav);
  });

  // Reset state and reflow when crossing the desktop/mobile breakpoint.
  isDesktop.addEventListener('change', () => {
    closeMobileMenu(nav);
    closeAllPanels(nav);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
