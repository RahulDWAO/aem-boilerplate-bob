/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-vida-kkr-product.js
  var import_vida_kkr_product_exports = {};
  __export(import_vida_kkr_product_exports, {
    default: () => import_vida_kkr_product_default
  });

  // tools/importer/parsers/hero-kkr.js
  function parse(element, { document }) {
    const img = element.querySelector(".vx2-hero__image-container img, .vx2-hero__image, img");
    const heading = element.querySelector("h1, .vx2-hero__heading");
    const subheading = element.querySelector("h2, .vx2-hero__subheading");
    const hasHeading = heading && heading.textContent.trim();
    const hasSubheading = subheading && subheading.textContent.trim();
    if (!img && !hasHeading && !hasSubheading) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (img) cells.push([img]);
    const contentCell = [];
    if (hasHeading) contentCell.push(heading);
    if (hasSubheading) contentCell.push(subheading);
    if (contentCell.length) cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-kkr", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-gallery.js
  function parse2(element, { document }) {
    const slideLinks = Array.from(element.querySelectorAll(".carousel-slide a.carousel-slide__link, .carousel-slide a[href]"));
    const seen = /* @__PURE__ */ new Set();
    const uniqueSlides = [];
    slideLinks.forEach((a) => {
      const img = a.querySelector("img");
      const key = a.getAttribute("href") || img && img.getAttribute("src") || "";
      if (!key || seen.has(key)) return;
      seen.add(key);
      if (img) uniqueSlides.push({ link: a, img });
    });
    const ctaLink = element.querySelector(".button-container a[href], a.explore-button");
    if (!uniqueSlides.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    uniqueSlides.forEach(({ link }, idx) => {
      const isLast = idx === uniqueSlides.length - 1;
      cells.push([link, isLast && ctaLink ? ctaLink : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-kkr-grid.js
  function parse3(element, { document }) {
    const tiles = Array.from(element.querySelectorAll("a.kkr-feature-grid__tile, .kkr-feature-grid__masonry a[href]"));
    const cells = [];
    tiles.forEach((a) => {
      const img = a.querySelector("img");
      if (!img) return;
      cells.push([a, ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-kkr-grid", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-desc.js
  function parse4(element, { document }) {
    const card = element.querySelector(".description-info-card") || element;
    const leftCell = [];
    const heading = card.querySelector(".description-info-title, h2, h1, h3");
    if (heading) leftCell.push(heading);
    const body = card.querySelector(".description-info-content");
    if (body) leftCell.push(body);
    const ctaLink = card.querySelector(".description-info-links-container a[href]");
    if (ctaLink) {
      leftCell.push(ctaLink);
    } else {
      const ctaLabel = card.querySelector(".description-info-links-container .button__label, .description-info-links-container button");
      if (ctaLabel && ctaLabel.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = ctaLabel.textContent.trim();
        leftCell.push(p);
      }
    }
    const img = card.querySelector(":scope > img, img");
    const rightCell = img ? [img] : [""];
    if (!leftCell.length && !img) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([leftCell.length ? leftCell : "", rightCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-desc", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-merch.js
  function parse5(element, { document }) {
    const sectionHeading = element.querySelector(".scooter-variants-section__title, h2");
    const cards = Array.from(element.querySelectorAll(".product-card"));
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector(".product-card__image img, img");
      const content = [];
      const desc = card.querySelector(".product-description");
      if (desc && desc.textContent.trim()) content.push(desc);
      const cta = card.querySelector(".product-card-kkr__know-more, .product-card__info a[href]");
      if (cta) content.push(cta);
      if (img || content.length) {
        cells.push([img || "", content.length ? content : ""]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-merch", cells });
    const replacements = [];
    if (sectionHeading) replacements.push(sectionHeading);
    replacements.push(block);
    element.replaceWith(...replacements);
  }

  // tools/importer/transformers/vida-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--country-selector",
        // country/region selector experience fragment
        ".cmp-experiencefragment--header-vida-v2-0",
        // global header/nav experience fragment
        ".cmp-experiencefragment--footer-vida-v2-0",
        // global footer experience fragment
        "header",
        // nav header (inside header EF; belt-and-suspenders)
        '[id^="batBeacon"]'
        // Bing UET tracking beacon (div + img)
      ]);
    }
  }

  // tools/importer/transformers/vida-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function resolveSectionEl(element, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector].filter(Boolean);
    for (const sel of selectors) {
      if (!sel) continue;
      const el = element.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;
    const doc = payload && payload.document || element.ownerDocument;
    if (hookName === TransformHook2.beforeTransform) {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = resolveSectionEl(element, section);
        if (!sectionEl) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === TransformHook2.afterTransform) {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || resolveSectionEl(element, section);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/transformers/vida-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function findLinkedDmCarrier(img) {
    if (!img || !img.parentElement) return null;
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
      let foundNode = false;
      for (const child of parent.children) {
        if (child === node) {
          foundNode = true;
        } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
          return null;
        }
      }
      if (!foundNode) return null;
      node = parent;
      parent = parent.parentElement;
    }
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform3(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/import-vida-kkr-product.js
  var PAGE_TEMPLATE = {
    name: "vida-kkr-product",
    description: "VIDA VX2 KKR Knight Edition product/campaign landing page: hero with interest form, community gallery carousel, manifesto text, KKR feature grid, description card (2-col), merchandise banner carousels, price-and-spec section, header + footer experience fragments.",
    urls: [
      "https://www.vidaworld.com/vida-kkr-knight-edition.html"
    ],
    blocks: [
      {
        name: "hero-kkr",
        instances: ["div.vx2herowithprice"]
      },
      {
        name: "carousel-gallery",
        instances: ["div.communitygallery"]
      },
      {
        name: "cards-kkr-grid",
        instances: ["div.KkrFeatureGrid"],
        section: "light"
      },
      {
        name: "columns-desc",
        instances: ["div.descriptioncard"]
      },
      {
        name: "cards-merch",
        instances: ["div.priceandspec"],
        section: "light"
      }
    ],
    sections: [
      {
        id: "rc4",
        name: "Hero with Interest Form",
        selector: "div.vx2herowithprice",
        style: null,
        blocks: ["hero-kkr"],
        defaultContent: []
      },
      {
        id: "rc5",
        name: "Community Gallery Carousel",
        selector: "div.communitygallery",
        style: null,
        blocks: ["carousel-gallery"],
        defaultContent: []
      },
      {
        id: "rc6",
        name: "Manifesto Text",
        selector: "div.manifestosection",
        style: null,
        blocks: [],
        defaultContent: ["div.manifestosection h2", "div.manifestosection p"]
      },
      {
        id: "rc7",
        name: "Ride Mode / 360 Visual",
        selector: "div.rideModeSection",
        style: null,
        blocks: [],
        defaultContent: ["div.rideModeSection img"]
      },
      {
        id: "rc8",
        name: "KKR Feature Grid",
        selector: "div.KkrFeatureGrid",
        style: "light",
        blocks: ["cards-kkr-grid"],
        defaultContent: []
      },
      {
        id: "rc9",
        name: "Description Card (2-column)",
        selector: "div.descriptioncard",
        style: null,
        blocks: ["columns-desc"],
        defaultContent: []
      },
      {
        id: "rc10",
        name: "Power Play Banner",
        selector: "div.bannercarousel:nth-of-type(7)",
        style: null,
        blocks: [],
        defaultContent: ["div.bannercarousel:nth-of-type(7) img"]
      },
      {
        id: "rc11",
        name: "KKR Merchandise Grid",
        selector: "div.priceandspec",
        style: "light",
        blocks: ["cards-merch"],
        defaultContent: ["div.priceandspec h2"]
      },
      {
        id: "rc12",
        name: "Hook-Step Challenge Banner",
        selector: "div.bannercarousel:nth-of-type(9)",
        style: null,
        blocks: [],
        defaultContent: ["div.bannercarousel:nth-of-type(9) img"]
      }
    ]
  };
  var parsers = {
    "hero-kkr": parse,
    "carousel-gallery": parse2,
    "cards-kkr-grid": parse3,
    "columns-desc": parse4,
    "cards-merch": parse5
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : [],
    transform3
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      let matched = false;
      blockDef.instances.forEach((selector) => {
        if (matched) return;
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) return;
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
        matched = true;
      });
      if (!matched) {
        console.warn(`Block "${blockDef.name}" not found with any selector: ${blockDef.instances.join(", ")}`);
      }
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_vida_kkr_product_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_vida_kkr_product_exports);
})();
