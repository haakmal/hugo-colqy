/* Colqy A6.3g - content image lightbox, click-to-toggle intrinsic resolution. */
(() => {
  'use strict';
  const contentSelector = '.cq-primary img, .cq-secondary img';
  const galleryButton = '.cq-gallery__zoom';
  let dialog, photo, caption, counter, viewport, previous, next, hint;
  let triggers = [], index = 0, opener = null;
  let naturalWidth = 0, naturalHeight = 0, fitScale = 1, zoomed = false, loadToken = 0;

  function eligible(img) {
    if (!(img instanceof HTMLImageElement) || !img.matches(contentSelector)) return false;
    if (img.closest('a[href], .cq-lightbox, [data-no-lightbox]')) return false;
    return true;
  }
  function galleryTrigger(img) {
    return img.closest(galleryButton);
  }
  function entryImage(trigger) {
    return trigger.matches('img') ? trigger : trigger.querySelector('img');
  }
  function prepareImages() {
    document.querySelectorAll(contentSelector).forEach(img => {
      if (!eligible(img) || galleryTrigger(img)) return;
      img.classList.add('cq-lightbox-trigger');
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `Open image viewer: ${img.alt || 'Image'}`);
      img.setAttribute('title', 'Open image');
    });
  }
  function ensureDialog() {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.className = 'cq-lightbox';
    dialog.setAttribute('aria-label', 'Image viewer');
    dialog.innerHTML = `
      <div class="cq-lightbox__frame">
        <div class="cq-lightbox__toolbar">
          <span class="cq-lightbox__counter" aria-live="polite"></span>
          <span class="cq-lightbox__hint" aria-live="polite"></span>
          <button type="button" data-close aria-label="Close image viewer" title="Close image viewer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button>
        </div>
        <div class="cq-lightbox__viewport"><img alt=""></div>
        <div class="cq-lightbox__bottom">
          <button type="button" data-previous aria-label="Previous image">Previous</button>
          <p class="cq-lightbox__caption"></p>
          <button type="button" data-next aria-label="Next image">Next</button>
        </div>
      </div>`;
    document.body.append(dialog);
    photo = dialog.querySelector('.cq-lightbox__viewport img');
    viewport = dialog.querySelector('.cq-lightbox__viewport');
    caption = dialog.querySelector('.cq-lightbox__caption');
    counter = dialog.querySelector('.cq-lightbox__counter');
    hint = dialog.querySelector('.cq-lightbox__hint');
    previous = dialog.querySelector('[data-previous]');
    next = dialog.querySelector('[data-next]');
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    previous.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));
    photo.addEventListener('click', event => toggleZoom(event));
    photo.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleZoom();
      }
    });
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('cq-lightbox-open');
      if (opener?.isConnected) opener.focus({ preventScroll: true });
      opener = null;
      photo.removeAttribute('src');
    });
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' && triggers.length > 1) { event.preventDefault(); show(index - 1); }
      if (event.key === 'ArrowRight' && triggers.length > 1) { event.preventDefault(); show(index + 1); }
    });
  }
  function dimensions() {
    // Intrinsic image pixels are the maximum zoom: never invent extra resolution.
    const availableWidth = Math.max(1, viewport.clientWidth - 24);
    const availableHeight = Math.max(1, viewport.clientHeight - 24);
    fitScale = Math.min(1, availableWidth / naturalWidth, availableHeight / naturalHeight);
  }
  function renderZoom() {
    if (!naturalWidth || !naturalHeight) return;
    dimensions();
    if (fitScale >= 0.999) zoomed = false;
    const factor = zoomed ? 1 : fitScale;
    photo.style.width = `${naturalWidth * factor}px`;
    photo.style.height = `${naturalHeight * factor}px`;
    photo.style.maxWidth = 'none';
    photo.style.maxHeight = 'none';
    photo.classList.toggle('is-zoomed', zoomed);
    const canZoom = fitScale < 0.999;
    photo.classList.toggle('can-zoom', canZoom);
    photo.tabIndex = canZoom ? 0 : -1;
    if (canZoom) {
      const label = zoomed ? 'Fit image to window' : 'View image at actual size';
      photo.setAttribute('role', 'button');
      photo.setAttribute('aria-label', label);
      hint.textContent = zoomed ? 'Actual size · click image to fit' : 'Click image for actual size';
    } else {
      photo.removeAttribute('role');
      photo.removeAttribute('aria-label');
      hint.textContent = '';
    }
  }
  function toggleZoom(event) {
    if (fitScale >= 0.999 || !naturalWidth) return;
    const rect = photo.getBoundingClientRect();
    const x = event ? Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width))) : 0.5;
    const y = event ? Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height))) : 0.5;
    zoomed = !zoomed;
    renderZoom();
    viewport.scrollLeft = zoomed ? Math.max(0, naturalWidth * x - viewport.clientWidth / 2) : 0;
    viewport.scrollTop = zoomed ? Math.max(0, naturalHeight * y - viewport.clientHeight / 2) : 0;
  }
  function show(newIndex) {
    if (!triggers.length) return;
    index = (newIndex + triggers.length) % triggers.length;
    const source = entryImage(triggers[index]);
    if (!source) return;
    const figure = source.closest('figure');
    const sourceURL = source.dataset.fullSrc || source.currentSrc || source.src;
    const token = ++loadToken;
    naturalWidth = naturalHeight = 0;
    zoomed = false;
    photo.style.width = photo.style.height = '';
    photo.classList.remove('can-zoom', 'is-zoomed');
    photo.tabIndex = -1;
    hint.textContent = '';
    photo.alt = source.alt || '';
    caption.textContent = figure?.querySelector('figcaption')?.textContent?.trim() || source.alt || '';
    counter.textContent = triggers.length > 1 ? `${index + 1} / ${triggers.length}` : '';
    previous.hidden = next.hidden = triggers.length < 2;
    photo.onload = () => {
      if (token !== loadToken) return;
      naturalWidth = photo.naturalWidth;
      naturalHeight = photo.naturalHeight;
      renderZoom();
      viewport.scrollLeft = viewport.scrollTop = 0;
    };
    photo.onerror = () => { if (token === loadToken) hint.textContent = 'Image could not be loaded'; };
    photo.src = sourceURL;
    if (photo.complete && photo.naturalWidth) photo.onload();
  }
  function open(trigger) {
    ensureDialog();
    const gallery = trigger.closest('.cq-gallery');
    triggers = gallery ? [...gallery.querySelectorAll(galleryButton)] : [trigger];
    opener = trigger;
    if (!dialog.open) dialog.showModal();
    show(triggers.indexOf(trigger));
    document.body.classList.add('cq-lightbox-open');
    dialog.querySelector('[data-close]').focus({ preventScroll: true });
  }
  document.addEventListener('click', event => {
    const gallery = event.target.closest(galleryButton);
    if (gallery) { event.preventDefault(); open(gallery); return; }
    const target = event.target.closest('img.cq-lightbox-trigger');
    if (target && eligible(target)) { event.preventDefault(); open(target); }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const target = event.target;
    if (target?.matches?.('img.cq-lightbox-trigger') && eligible(target)) {
      event.preventDefault(); open(target);
    }
  });
  window.addEventListener('resize', () => {
    if (dialog?.open && naturalWidth) {
      renderZoom();
      if (!zoomed) viewport.scrollLeft = viewport.scrollTop = 0;
    }
  });
  prepareImages();
})();
