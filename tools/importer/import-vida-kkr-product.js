/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroKkrParser from './parsers/hero-kkr.js';
import carouselGalleryParser from './parsers/carousel-gallery.js';
import cardsKkrGridParser from './parsers/cards-kkr-grid.js';
import columnsDescParser from './parsers/columns-desc.js';
import cardsMerchParser from './parsers/cards-merch.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/vida-cleanup.js';
import sectionsTransformer from './transformers/vida-sections.js';
import dmImagesTransformer from './transformers/vida-dm-images.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'vida-kkr-product',
  description: 'VIDA VX2 KKR Knight Edition product/campaign landing page: hero with interest form, community gallery carousel, manifesto text, KKR feature grid, description card (2-col), merchandise banner carousels, price-and-spec section, header + footer experience fragments.',
  urls: [
    'https://www.vidaworld.com/vida-kkr-knight-edition.html',
  ],
  blocks: [
    {
      name: 'hero-kkr',
      instances: ['div.vx2herowithprice'],
    },
    {
      name: 'carousel-gallery',
      instances: ['div.communitygallery'],
    },
    {
      name: 'cards-kkr-grid',
      instances: ['div.KkrFeatureGrid'],
      section: 'light',
    },
    {
      name: 'columns-desc',
      instances: ['div.descriptioncard'],
    },
    {
      name: 'cards-merch',
      instances: ['div.priceandspec'],
      section: 'light',
    },
  ],
  sections: [
    {
      id: 'rc4',
      name: 'Hero with Interest Form',
      selector: 'div.vx2herowithprice',
      style: null,
      blocks: ['hero-kkr'],
      defaultContent: [],
    },
    {
      id: 'rc5',
      name: 'Community Gallery Carousel',
      selector: 'div.communitygallery',
      style: null,
      blocks: ['carousel-gallery'],
      defaultContent: [],
    },
    {
      id: 'rc6',
      name: 'Manifesto Text',
      selector: 'div.manifestosection',
      style: null,
      blocks: [],
      defaultContent: ['div.manifestosection h2', 'div.manifestosection p'],
    },
    {
      id: 'rc7',
      name: 'Ride Mode / 360 Visual',
      selector: 'div.rideModeSection',
      style: null,
      blocks: [],
      defaultContent: ['div.rideModeSection img'],
    },
    {
      id: 'rc8',
      name: 'KKR Feature Grid',
      selector: 'div.KkrFeatureGrid',
      style: 'light',
      blocks: ['cards-kkr-grid'],
      defaultContent: [],
    },
    {
      id: 'rc9',
      name: 'Description Card (2-column)',
      selector: 'div.descriptioncard',
      style: null,
      blocks: ['columns-desc'],
      defaultContent: [],
    },
    {
      id: 'rc10',
      name: 'Power Play Banner',
      selector: 'div.bannercarousel:nth-of-type(7)',
      style: null,
      blocks: [],
      defaultContent: ['div.bannercarousel:nth-of-type(7) img'],
    },
    {
      id: 'rc11',
      name: 'KKR Merchandise Grid',
      selector: 'div.priceandspec',
      style: 'light',
      blocks: ['cards-merch'],
      defaultContent: ['div.priceandspec h2'],
    },
    {
      id: 'rc12',
      name: 'Hook-Step Challenge Banner',
      selector: 'div.bannercarousel:nth-of-type(9)',
      style: null,
      blocks: [],
      defaultContent: ['div.bannercarousel:nth-of-type(9) img'],
    },
  ],
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'hero-kkr': heroKkrParser,
  'carousel-gallery': carouselGalleryParser,
  'cards-kkr-grid': cardsKkrGridParser,
  'columns-desc': columnsDescParser,
  'cards-merch': cardsMerchParser,
};

// TRANSFORMER REGISTRY - cleanup first, then sections (adds <hr> breaks + metadata),
// then DM/Scene7 image rewrite (runs afterTransform, converts DM <img> to carrier anchors)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
  dmImagesTransformer,
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

  template.blocks.forEach((blockDef) => {
    let matched = false;
    blockDef.instances.forEach((selector) => {
      if (matched) return; // instances are ordered fallbacks - stop after first that matches
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) return;
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
      matched = true;
    });
    if (!matched) {
      console.warn(`Block "${blockDef.name}" not found with any selector: ${blockDef.instances.join(', ')}`);
    }
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata + DM images)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map root URL to /index to avoid importer crash)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
