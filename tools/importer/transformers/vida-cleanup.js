/* eslint-disable */
/* global WebImporter */

/**
 * Site-wide cleanup transformer for vidaworld.com (AEM Sites / Sling site whose
 * global chrome is delivered via Experience Fragments).
 *
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content. All selectors below were verified against
 * migration-work/cleaned.html for the vida-kkr-product template
 * (source: https://www.vidaworld.com/vida-kkr-knight-edition.html).
 *
 * Verified selectors (with cleaned.html references):
 *   - .cmp-experiencefragment--country-selector  -> country/region selector EF (line 26)
 *   - .cmp-experiencefragment--header-vida-v2-0   -> global header/nav EF, contains <header> (line 40)
 *   - .cmp-experiencefragment--footer-vida-v2-0   -> global site footer EF (line 658)
 *   - header                                      -> nav <header> inside the header EF (line 287)
 *   - [id^="batBeacon"]                           -> Bing UET tracking beacon <div>/<img> (line 845)
 *
 * None of these are authored per page; they are populated by the site shell
 * (experience fragments + analytics/tracking). The main VX2 KKR page content
 * (vx2herowithprice, communitygallery, ... priceandspec) sits in a sibling
 * container and is untouched by these selectors. Removed in afterTransform
 * because they sit outside the block content wrappers and do not affect block
 * parsing.
 *
 * NOTE: named vida-* to avoid colliding with the existing bobcard-*
 * transformers; the BOBCARD transformers are not modified.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome (selectors verified in cleaned.html)
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--country-selector', // country/region selector experience fragment
      '.cmp-experiencefragment--header-vida-v2-0', // global header/nav experience fragment
      '.cmp-experiencefragment--footer-vida-v2-0', // global footer experience fragment
      'header', // nav header (inside header EF; belt-and-suspenders)
      '[id^="batBeacon"]', // Bing UET tracking beacon (div + img)
    ]);
  }
}
