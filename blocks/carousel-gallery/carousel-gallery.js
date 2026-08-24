// Update aria state + indicator dots for the active slide index.
function setActiveState(block, slideIndex) {
  block.dataset.activeSlide = slideIndex;
  block.dispatchEvent(new CustomEvent('carousel-gallery:slide', { detail: slideIndex }));

  const slides = block.querySelectorAll('.carousel-gallery-slide');
  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) link.setAttribute('tabindex', '-1');
      else link.removeAttribute('tabindex');
    });
  });

  const indicators = block.querySelectorAll('.carousel-gallery-slide-indicator');
  indicators.forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    }
  });
}

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-gallery');
  setActiveState(block, parseInt(slide.dataset.slideIndex, 10));
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-gallery-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  // Center the target slide. scrollIntoView respects scroll-snap and viewport
  // bounds — unlike scrollTo({left: offsetLeft}), which overshoots on the
  // centre-snapped peek layout (the last slides' offsetLeft exceeds maxScroll,
  // so the browser clamps and the carousel stalls).
  activeSlide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  // Set active state directly — the IntersectionObserver may not fire for the
  // clamped last slides, so we can't rely on it alone.
  setActiveState(block, realSlideIndex);
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-gallery-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-gallery-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

const AUTOPLAY_INTERVAL = 4000;

/**
 * Auto-advance the gallery, matching the source's looping behaviour.
 * Accessibility guards: respect prefers-reduced-motion, and pause while the
 * user is hovering, focused within, or the tab is hidden.
 */
function startAutoplay(block) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) return;

  let timer = null;
  // Track our own index rather than reading dataset.activeSlide: on the peek
  // layout the IntersectionObserver (0.5 threshold) doesn't always mark a new
  // active slide, which would otherwise stall autoplay on slide 0.
  let autoIndex = parseInt(block.dataset.activeSlide || '0', 10);
  const advance = () => {
    const slides = block.querySelectorAll('.carousel-gallery-slide');
    autoIndex = (autoIndex + 1) % slides.length;
    showSlide(block, autoIndex);
  };
  // Keep our counter in sync when the user drives the carousel (dots/scroll).
  block.addEventListener('carousel-gallery:slide', (e) => {
    if (typeof e.detail === 'number') autoIndex = e.detail;
  });
  const play = () => {
    if (timer) return;
    timer = window.setInterval(advance, AUTOPLAY_INTERVAL);
  };
  const pause = () => {
    if (!timer) return;
    window.clearInterval(timer);
    timer = null;
  };

  block.addEventListener('mouseenter', pause);
  block.addEventListener('mouseleave', play);
  block.addEventListener('focusin', pause);
  block.addEventListener('focusout', play);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else play();
  });
  // Stop autoplaying if the user opts out of motion mid-session.
  reduceMotion.addEventListener('change', (e) => (e.matches ? pause() : play()));

  play();
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-gallery-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-gallery-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-gallery-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-gallery-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-gallery-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-gallery-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-gallery-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-gallery-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="Previous Slide"></button>
      <button type="button" class="slide-next" aria-label="Next Slide"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    // Off-screen slides (all but the first) are below the fold and initially
    // hidden in the peek track — defer their image requests without competing
    // for bandwidth. Fidelity-invisible perf hint.
    if (idx > 0) {
      slide.querySelectorAll('img').forEach((img) => {
        img.loading = 'lazy';
        img.setAttribute('fetchpriority', 'low');
      });
    }

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-gallery-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="Show Slide ${idx + 1} of ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  // Slides in this gallery are pure image cards. Any trailing content
  // (e.g. the "Visit VIDAWorld on Instagram" CTA authored in the last row's
  // second cell) is hoisted into a persistent footer shown below the dots,
  // matching the source design. Empty content cells are discarded.
  const ctaNodes = [];
  block.querySelectorAll('.carousel-gallery-slide-content').forEach((content) => {
    if (content.textContent.trim() || content.querySelector('a, img, picture')) {
      ctaNodes.push(...content.childNodes);
    }
    content.remove();
  });
  if (ctaNodes.length) {
    const cta = document.createElement('div');
    cta.classList.add('carousel-gallery-cta');
    ctaNodes.forEach((node) => cta.append(node));
    block.append(cta);
  }

  if (!isSingleSlide) {
    bindEvents(block);
    startAutoplay(block);
  }
}
