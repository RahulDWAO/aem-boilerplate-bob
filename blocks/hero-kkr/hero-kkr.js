/**
 * Build the VIDA lead-capture interest form popup, matching the source.
 * The source hero overlays a trigger button that opens a modal with:
 * name, city, mobile, a terms/privacy consent checkbox, and a Generate OTP
 * button (disabled until the form is valid). Submission is client-side only
 * (no backend) — on submit we show the source's confirmation message.
 */
function buildInterestForm(block) {
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'hero-kkr-interest-trigger';
  trigger.textContent = "I'm Interested";
  trigger.setAttribute('aria-haspopup', 'dialog');

  const overlay = document.createElement('div');
  overlay.className = 'hero-kkr-modal-overlay';
  overlay.hidden = true;

  const dialog = document.createElement('div');
  dialog.className = 'hero-kkr-modal';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', 'Register your interest');

  dialog.innerHTML = `
    <button type="button" class="hero-kkr-modal-close" aria-label="Close">&times;</button>
    <form class="hero-kkr-form" novalidate>
      <div class="hero-kkr-field">
        <input type="text" name="name" id="hero-kkr-name" placeholder="Enter your name*" autocomplete="name" required>
      </div>
      <div class="hero-kkr-field">
        <input type="text" name="city" id="hero-kkr-city" placeholder="Select your city*" autocomplete="address-level2" required>
      </div>
      <div class="hero-kkr-field">
        <input type="tel" name="mobile" id="hero-kkr-mobile" placeholder="Enter your mobile number*" inputmode="numeric" pattern="[0-9]{10}" maxlength="10" autocomplete="tel" required>
      </div>
      <label class="hero-kkr-consent">
        <input type="checkbox" name="consent" checked>
        <span>I agree to the
          <a href="/terms-and-conditions.html" target="_blank" rel="noopener">terms &amp; Condition</a> and
          <a href="/privacy-policy.html" target="_blank" rel="noopener">privacy policy</a>
        </span>
      </label>
      <button type="submit" class="hero-kkr-submit" disabled>Generate OTP</button>
    </form>
    <div class="hero-kkr-thanks" hidden>
      <h3>Thank you for your interest!<br>We will get back to you shortly.</h3>
    </div>
  `;

  overlay.append(dialog);
  block.append(trigger, overlay);

  const form = dialog.querySelector('.hero-kkr-form');
  const thanks = dialog.querySelector('.hero-kkr-thanks');
  const submit = dialog.querySelector('.hero-kkr-submit');
  const closeBtn = dialog.querySelector('.hero-kkr-modal-close');
  let lastFocused = null;

  const isValid = () => form.checkValidity() && form.querySelector('[name="consent"]').checked;
  const refreshSubmit = () => { submit.disabled = !isValid(); };

  const open = () => {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    form.querySelector('#hero-kkr-name').focus();
  };
  const close = () => {
    overlay.hidden = true;
    document.body.style.overflow = '';
    form.hidden = false;
    thanks.hidden = true;
    form.reset();
    refreshSubmit();
    if (lastFocused) lastFocused.focus();
  };

  trigger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) close(); });
  form.addEventListener('input', refreshSubmit);
  form.addEventListener('change', refreshSubmit);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!isValid()) return;
    // Client-side only: no backend endpoint. Show the source's confirmation.
    form.hidden = true;
    thanks.hidden = false;
  });
  refreshSubmit();
}

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

  buildInterestForm(block);
}
