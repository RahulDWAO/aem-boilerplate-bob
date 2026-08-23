import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const MOBILE_QUERY = '(max-width: 899px)';

/**
 * Turns a footer group (a heading/label followed by a link list) into a
 * collapsible accordion on mobile. Multiple groups can be open at once.
 * On mobile a chevron image is injected into the header and the panel is
 * collapsed; the "cities" group detaches its list from the DOM while
 * collapsed (mirrors the source behaviour). Torn down again on desktop.
 * @param {Element} footer The decorated footer root
 */
function setupAccordion(footer) {
  const groups = [...footer.querySelectorAll('.footer-links, .footer-cities')];
  const mq = window.matchMedia(MOBILE_QUERY);

  const build = () => {
    groups.forEach((group) => {
      if (group.dataset.accordion === 'on') return;
      const header = group.querySelector('h2, p');
      const panel = group.querySelector('ul');
      if (!header || !panel) return;

      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-expanded', 'false');
      const chevron = document.createElement('img');
      chevron.className = 'footer-accordion-chevron';
      chevron.src = '/content/images/vida-chevron-down.svg';
      chevron.alt = '';
      chevron.setAttribute('aria-hidden', 'true');
      header.append(chevron);

      const isCities = group.classList.contains('footer-cities');
      group.classList.add('footer-accordion', 'is-collapsed');
      if (isCities) {
        group.dataset.panelStore = 'detached';
        panel.remove();
        group.accordionPanel = panel;
      }

      const toggle = () => {
        const collapsed = group.classList.toggle('is-collapsed');
        header.setAttribute('aria-expanded', String(!collapsed));
        if (isCities) {
          if (!collapsed && group.accordionPanel) group.append(group.accordionPanel);
          else if (collapsed && group.accordionPanel) group.accordionPanel.remove();
        }
      };
      header.addEventListener('click', toggle);
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
      group.accordionToggle = toggle;
      group.dataset.accordion = 'on';
    });
  };

  const teardown = () => {
    groups.forEach((group) => {
      if (group.dataset.accordion !== 'on') return;
      const header = group.querySelector('h2, p');
      if (header) {
        header.removeAttribute('role');
        header.removeAttribute('tabindex');
        header.removeAttribute('aria-expanded');
        const chevron = header.querySelector('.footer-accordion-chevron');
        if (chevron) chevron.remove();
      }
      if (group.classList.contains('footer-cities') && group.accordionPanel
        && !group.contains(group.accordionPanel)) {
        group.append(group.accordionPanel);
      }
      group.classList.remove('footer-accordion', 'is-collapsed');
      delete group.dataset.accordion;
    });
  };

  const apply = () => (mq.matches ? build() : teardown());
  apply();
  mq.addEventListener('change', apply);
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Load the footer content as a fragment: localhost / aem up first, then DA/EDS.
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta
    ? new URL(footerMeta, window.location).pathname
    : '/footer';
  let fragment = await loadFragment('/content/footer');
  if (!fragment || !fragment.firstElementChild) {
    fragment = await loadFragment(footerPath);
  }

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Resolve relative image paths (authored relative to the footer fragment at
  // /content/footer) to absolute /content/… paths so they load on any page URL.
  footer.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('http') && !src.startsWith('/')) {
      img.setAttribute('src', `/content/${src}`);
    }
  });

  // The fragment produces eleven top-level sections, in order:
  //  0 brand logo, 1-4 link columns (Products/Explore/Discover/My Account),
  //  5 city links row, 6 legal links, 7 social icons,
  //  8 registered office address, 9 contact details, 10 copyright.
  const sectionClasses = [
    'footer-brand',
    'footer-links',
    'footer-links',
    'footer-links',
    'footer-links',
    'footer-cities',
    'footer-legal',
    'footer-social',
    'footer-address',
    'footer-contact',
    'footer-copyright',
  ];
  const children = [...footer.children];
  children.forEach((section, i) => {
    if (sectionClasses[i]) section.classList.add(sectionClasses[i]);
  });

  // Top region: brand logo + four link columns, laid out in a row.
  const topRegion = document.createElement('div');
  topRegion.className = 'footer-top';
  children.slice(0, 5).forEach((el) => topRegion.append(el));

  // Legal links + social icons share one horizontal row.
  const legalSocialRow = document.createElement('div');
  legalSocialRow.className = 'footer-legal-social';
  if (children[6]) legalSocialRow.append(children[6]);
  if (children[7]) legalSocialRow.append(children[7]);

  // Bottom bar: address + contact + copyright (divided from the region above).
  const bottomRegion = document.createElement('div');
  bottomRegion.className = 'footer-bottom';
  children.slice(8).forEach((el) => bottomRegion.append(el));

  footer.textContent = '';
  footer.append(topRegion);
  if (children[5]) footer.append(children[5]);
  footer.append(legalSocialRow, bottomRegion);

  block.append(footer);

  setupAccordion(footer);
}
