/* Colqy Spatial — progressive enhancement. No CMS dependency. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const app = document.getElementById('cq-app');
  if (!app) return;
  const primary = document.getElementById('cq-primary');
  const secondary = document.getElementById('cq-secondary');
  const support = document.getElementById('cq-support-content');
  const overlay = document.getElementById('cq-overlay');
  const panel = document.getElementById('cq-panel');
  const panelBody = document.getElementById('cq-panel-body');
  const contextButton = document.getElementById('cq-context-button');
  const statusButton = document.getElementById('cq-status-button');
  const closeButton = document.getElementById('cq-panel-close');
  const narrow = window.matchMedia('(max-width: 800px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hasSupport = () => Boolean(support.querySelector('.cq-support-document, .cq-footnotes'));
  const panelMode = () => secondary.dataset.mobileMode === 'panel';
  let opener = null;
  let active = null;
  let movedSupport = false;

  // Hugo's semantic footnote links remain in the original document; move the
  // generated endnotes only when a supporting region exists and JS is active.
  const notes = primary.querySelector('.footnotes, [role="doc-endnotes"]');
  const footnoteSlot = support.querySelector('#cq-footnote-slot');
  if (notes && footnoteSlot) {
    notes.classList.add('cq-footnotes');
    const footnoteHeading = document.createElement('h2');
    footnoteHeading.className = 'cq-support-meta';
    footnoteHeading.textContent = 'FOOTNOTES';
    footnoteSlot.append(footnoteHeading, notes);
  }
  const syncContext = () => {
    contextButton.hidden = !(narrow.matches && panelMode() && hasSupport());
    statusButton.hidden = !(narrow.matches && panelMode() && Boolean(support.querySelector('#cq-source-statuses')));
  };
  const restoreSupport = () => {
    if (movedSupport) {
      secondary.append(support);
      movedSupport = false;
    }
  };
  const closePanel = (restore = true) => {
    if (overlay.hidden) return;
    restoreSupport();
    overlay.hidden = true;
    app.inert = false;
    document.body.classList.remove('cq-panel-open');
    document.querySelectorAll('[data-panel-open]').forEach(b => b.setAttribute('aria-expanded', 'false'));
    if (restore && opener && opener.isConnected && !opener.hidden) opener.focus({preventScroll:true});
    opener = null;
    active = null;
  };
  const openPanel = (kind, focusId) => {
    if (kind === 'context' && (!narrow.matches || !panelMode() || !hasSupport())) return;
    if (!overlay.hidden) closePanel(false);
    opener = document.activeElement;
    active = kind;
    overlay.dataset.panel = kind;
    panelBody.replaceChildren();
    if (kind === 'context') {
      panelBody.append(support);
      movedSupport = true;
    } else {
      const template = document.getElementById(`cq-${kind}-template`);
      if (template) panelBody.append(template.content.cloneNode(true));
    }
    panel.setAttribute('aria-label', kind === 'context' ? 'Supporting content' : kind === 'navigation' ? 'Navigation' : 'Site information');
    overlay.hidden = false;
    app.inert = true;
    document.body.classList.add('cq-panel-open');
    if (opener?.hasAttribute('data-panel-open')) opener.setAttribute('aria-expanded', 'true');
    panel.focus({preventScroll:true});
    if (focusId) {
      const target = document.getElementById(focusId);
      if (target && panel.contains(target)) {
        target.setAttribute('tabindex', '-1');
        target.scrollIntoView({block:'center',behavior:'instant'});
        target.focus({preventScroll:true});
      }
    }
  };
  document.querySelectorAll('[data-panel-open]').forEach(button => button.addEventListener('click', () => openPanel(button.dataset.panelOpen, button.dataset.panelFocus)));
  // Chapter heading links in a mobile TOC target the primary reading region.
  // Close the floating panel before scrolling and focusing the destination.
  panelBody.addEventListener('click', event => {
    if (active !== 'context') return;
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    const target = document.getElementById(id);
    if (!target || !primary.contains(target)) return;
    event.preventDefault();
    closePanel(false);
    target.setAttribute('tabindex', '-1');
    target.scrollIntoView({block:'start', behavior:'auto'});
    target.focus({preventScroll:true});
  });
  closeButton.addEventListener('click', () => closePanel());
  document.getElementById('cq-scrim').addEventListener('click', () => closePanel());
  document.addEventListener('keydown', event => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closePanel(); return; }
    if (event.key !== 'Tab') return;
    const focusables = [...panel.querySelectorAll('a[href],button:not([disabled]),[tabindex="0"]')].filter(el => el.getClientRects().length);
    if (!focusables.length) { event.preventDefault(); panel.focus(); return; }
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (!focusables.includes(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first).focus(); }
    else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  document.addEventListener('click', event => {
    // A6.3r.3: open bibliographic references in the mobile supporting panel.
    const citation = event.target.closest('a[href^="#ref-"]');
    if (citation && narrow.matches && panelMode() && hasSupport()) {
      const id = decodeURIComponent(citation.hash.slice(1));
      if (support.querySelector(`[id="${CSS.escape(id)}"]`)) {
        event.preventDefault();
        openPanel('context', id);
        return;
      }
    }
    const note = event.target.closest('a[href^="#fn"],a[role="doc-noteref"]');
    if (note && narrow.matches && panelMode() && hasSupport()) {
      const id = decodeURIComponent(note.hash.slice(1));
      if (support.querySelector(`[id="${CSS.escape(id)}"]`)) { event.preventDefault(); openPanel('context', id); }
    }
  });
  const syncHeader = () => {
    if (narrow.matches || app.dataset.headerSticky === 'true') { app.dataset.headerHidden = 'false'; return; }
    const eligible = [primary,secondary].filter(el => el.scrollHeight - el.clientHeight >= 116);
    if (!eligible.length) { app.dataset.headerHidden = 'false'; return; }
    const shouldHide = eligible.some(el => el.scrollTop >= 84);
    const shouldShow = eligible.every(el => el.scrollTop <= 16);
    if (shouldHide) app.dataset.headerHidden = 'true';
    else if (shouldShow) app.dataset.headerHidden = 'false';
  };
  primary.addEventListener('scroll',syncHeader,{passive:true});
  secondary.addEventListener('scroll',syncHeader,{passive:true});
  narrow.addEventListener('change',() => { if (active === 'context') closePanel(false); syncContext(); syncHeader(); });
  window.addEventListener('resize',syncContext,{passive:true});
  syncContext();
})();
