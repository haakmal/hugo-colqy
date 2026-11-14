/* Colqy A6.3r.2 — Sveltia citation picker; no repository writes. */
(() => {
  'use strict';
  if (!window.CMS?.registerEditorComponent) return;
  const scriptUrl = document.currentScript?.src || new URL('colqy-references.js', document.baseURI).href;
  const libraryUrl = new URL('references-index.json', scriptUrl).href;
  const KEY = /^[A-Za-z0-9][A-Za-z0-9._:/+\-]*$/;
  const splitKeys = value => String(value || '')
    .split(/\s*;\s*@?\s*/).map(x => x.replace(/^@/, '').trim())
    .filter(x => KEY.test(x));
  const unique = values => [...new Set(values)];
  const citation = values => {
    const keys = unique(values).filter(x => KEY.test(x));
    return keys.length ? `[@${keys.join('; @')}]` : '';
  };
  const formatPerson = person => {
    if (!person || typeof person !== 'object') return '';
    return person.literal || [person.family, person.given].filter(Boolean).join(', ');
  };
  const shortLabel = item => {
    const people = Array.isArray(item.author) ? item.author : [];
    const author = people.length ? formatPerson(people[0]) : (item.editor?.[0] ? formatPerson(item.editor[0]) : item.id);
    const year = item.issued?.['date-parts']?.[0]?.[0] || 'n.d.';
    return `${author} (${year})`;
  };
  // A6.3r.7d: only successful Sveltia saves update the in-session library.
  // Unsaved draft edits must never be offered as references.
  let lastSavedReferences = null;
  let indexSource = 'published';
  const validateEntries = entries => {
    if (!Array.isArray(entries)) throw new Error('Reference library must be a CSL JSON array.');
    const ids = new Set();
    for (const item of entries) {
      if (!item || typeof item !== 'object' || Array.isArray(item) ||
          typeof item.id !== 'string' || !KEY.test(item.id) || ids.has(item.id)) {
        throw new Error('Invalid or duplicated citation keys in reference library.');
      }
      ids.add(item.id);
    }
    return entries;
  };
  if (window.CMS?.registerEventListener) {
    window.CMS.registerEventListener({
      name: 'postSave',
      handler: ({ entry }) => {
        if (!entry?.get || entry.get('collection') !== 'reference_library') return;
        try {
          const raw = entry.getIn(['data', 'references_json']);
          const saved = validateEntries(JSON.parse(raw));
          lastSavedReferences = saved;
          indexSource = 'saved';
        } catch (error) {
          console.warn('Colqy References: could not read the saved library:', error);
        }
      },
    });
  } else {
    console.warn('Colqy References: Sveltia postSave hooks unavailable; using published index.');
  }
  const getIndex = async () => {
    if (lastSavedReferences) {
      indexSource = 'saved';
      return validateEntries(lastSavedReferences);
    }
    const response = await fetch(libraryUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Reference index unavailable (HTTP ${response.status}).`);
    const index = await response.json();
    if (index.version !== 1 || !Array.isArray(index.entries)) {
      throw new Error('Invalid published reference index. Run the citation-aware build.');
    }
    indexSource = 'published';
    return validateEntries(index.entries);
  };
  // Read-only diagnostic helper; not a Sveltia repository-writing API.
  window.ColqyReferenceSync = Object.freeze({
    getIndex,
    source: () => indexSource,
    savedCount: () => lastSavedReferences?.length ?? null,
  });
  /* A6.4a.1: scoped styles are in /admin/colqy-reference-ui.css. */
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const pick = async existing => {
    let entries;
    try { entries = await getIndex(); }
    catch (error) {
      // Never insert a placeholder key when the reference index is unavailable.
      window.alert(`${error.message}\nRun: python3 tools/sync-reference-index-a6-3r2.py`);
      return null;
    }
    return new Promise(resolve => {
      const dialog = el('dialog', 'cq-ref-dialog');
      dialog.setAttribute('aria-label', 'Insert citation');
      const wrap = el('div', 'cq-ref-wrap');
      const head = el('div', 'cq-ref-head');
      const title = el('h2', 'cq-ref-title', 'Insert citation');
      const count = el('span', 'cq-ref-note');
      head.append(title, count);
      const search = el('input', 'cq-ref-search');
      search.type = 'search';
      search.placeholder = 'Search author, title, year or citation key';
      search.setAttribute('aria-label', 'Search references');
      const results = el('div', 'cq-ref-results');
      results.setAttribute('role', 'group');
      results.setAttribute('aria-label', 'Reference results');
      const note = el('p', 'cq-ref-note', indexSource === 'saved'
        ? 'Using your most recently saved reference library.'
        : 'Using the published reference index. After saving in Sveltia, updates are available immediately in this session; a reload before deployment may show older data.');
      const actions = el('div', 'cq-ref-actions');
      const cancel = el('button', '', 'Cancel');
      cancel.type = 'button';
      const confirm = el('button', '', 'Insert');
      confirm.type = 'button';
      confirm.dataset.primary = '';
      const selected = new Set(existing.filter(k => entries.some(e => e.id === k)));
      const unavailable = existing.filter(k => !entries.some(e => e.id === k));
      const missing = el('p', 'cq-ref-note');
      if (unavailable.length) missing.textContent = `Not in library: ${unavailable.join(', ')}. Existing citation keys are preserved unless you replace this citation.`;
      const update = () => {
        confirm.disabled = selected.size === 0;
        count.textContent = `${selected.size} selected`;
      };
      const draw = () => {
        results.replaceChildren();
        const q = search.value.toLowerCase().trim();
        const filtered = entries.filter(item => [item.id, item.title, shortLabel(item), item.type]
          .join(' ').toLowerCase().includes(q));
        if (!filtered.length) results.append(el('p', 'cq-ref-note', entries.length ? 'No matching references.' : 'Library is empty. Import references first.'));
        filtered.slice(0, 150).forEach(item => {
          const row = el('label', 'cq-ref-row');
          const checkbox = el('input');
          checkbox.type = 'checkbox';
          checkbox.value = item.id;
          checkbox.checked = selected.has(item.id);
          checkbox.addEventListener('change', () => {
            if (checkbox.checked) selected.add(item.id); else selected.delete(item.id);
            update();
          });
          const text = el('span');
          text.append(el('strong', '', shortLabel(item)));
          text.append(el('span', 'cq-ref-meta', item.title || item.id));
          text.append(el('span', 'cq-ref-meta', item.id));
          row.append(checkbox, text);
          results.append(row);
        });
        if (filtered.length > 150) results.append(el('p', 'cq-ref-note', 'Showing first 150 results. Refine your search.'));
      };
      let settled = false;
      const finish = value => {
        if (settled) return;
        settled = true;
        if (dialog.open) dialog.close();
        dialog.remove();
        resolve(value);
      };
      dialog.addEventListener('cancel', event => { event.preventDefault(); finish(null); });
      dialog.addEventListener('close', () => finish(null));
      cancel.addEventListener('click', () => finish(null));
      confirm.addEventListener('click', () => finish({ keys: [...selected].join('; @') }));
      search.addEventListener('input', draw);
      actions.append(cancel, confirm);
      wrap.append(head, search, missing, results, note, actions);
      dialog.append(wrap);
      document.body.append(dialog);
      draw(); update();
      dialog.showModal();
      search.focus();
    });
  };
  window.CMS.registerEditorComponent({
    id: 'colqy-citation',
    label: 'Citation',
    icon: 'format_quote',
    type: 'inline',
    pattern: /\[@(?<keys>[A-Za-z0-9._:/+\-]+(?:;\s*@?[A-Za-z0-9._:/+\-]+)*)\]/,
    trigger: '[@',
    toInline: ({ keys = '' } = {}) => citation(splitKeys(keys)),
    toPreview: ({ keys = '' } = {}) => {
      const span = el('span', 'cq-citation-preview', citation(splitKeys(keys)));
      span.title = 'Citation keys (formatting follows in the CSL rendering stage)';
      return span;
    },
    onInsert: async () => pick([]),
    onEdit: async ({ data } = {}) => pick(splitKeys(data?.keys)),
  });
})();
