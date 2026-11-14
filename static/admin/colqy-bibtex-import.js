/* Colqy A6.3r.7b — BibTeX paste/import using Sveltia's supported custom field API.
   Citation.js 0.9.0 is loaded on demand; no undocumented repository-write API. */
(() => {
  'use strict';
  const CMS = window.CMS;
  if (!CMS?.registerFieldType || !window.h || !window.createClass) {
    console.error('Colqy BibTeX: Sveltia custom field API is unavailable.');
    return;
  }
  const h = window.h;
  const createClass = window.createClass;
  const KEY = /^[A-Za-z0-9][A-Za-z0-9._:/+\-]*$/;
  const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/citation-js/0.9.0/citation.min.js';
  let citationPromise;

  function loadCitation() {
    if (citationPromise) return citationPromise;
    citationPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = CDN;
      script.async = true;
      script.onload = () => {
        try {
          const mod = typeof window.require === 'function' ? window.require('citation-js') : window.Cite;
          const Cite = mod?.Cite || mod?.default || mod;
          if (typeof Cite !== 'function') throw new Error('Citation.js loaded without a usable Cite constructor.');
          resolve(Cite);
        } catch (error) { reject(error); }
      };
      script.onerror = () => reject(new Error('Could not load Citation.js. Check internet access or the browser content-security policy.'));
      document.head.append(script);
    }).catch(error => { citationPromise = undefined; throw error; });
    return citationPromise;
  }

  function parseLibrary(value) {
    const entries = JSON.parse(typeof value === 'string' ? value : '[]');
    if (!Array.isArray(entries)) throw new Error('References must remain a CSL JSON array.');
    const seen = new Set();
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.id !== 'string' || !KEY.test(entry.id)) {
        throw new Error('Existing library contains an invalid reference ID.');
      }
      if (seen.has(entry.id)) throw new Error(`Existing library has duplicate key: ${entry.id}`);
      seen.add(entry.id);
    }
    return entries;
  }

  function headers(text) {
    // This only checks entry identifiers; Citation.js performs the actual BibTeX parsing.
    const matches = [...text.matchAll(/(?:^|\n)\s*@([a-z][\w-]*)\s*[({]\s*([^,\s]+)\s*,/gi)];
    return matches.filter(m => !['string', 'comment', 'preamble'].includes(m[1].toLowerCase())).map(m => m[2]);
  }

  function reviewBibtex(text, existing, parsed) {
    const known = new Set(existing.map(x => x.id));
    const inputKeys = headers(text);
    if (!inputKeys.length) throw new Error('No BibTeX entries found. Paste complete @article, @book, or similar entries.');
    if (!Array.isArray(parsed)) throw new Error('Citation.js did not return a CSL JSON array.');
    const counts = new Map();
    for (const key of inputKeys) counts.set(key, (counts.get(key) || 0) + 1);
    const repeated = new Set([...counts].filter(([, n]) => n > 1).map(([key]) => key));
    const results = [];
    const issues = [];
    for (const key of repeated) issues.push(`Repeated key in paste: ${key} (skipped)`);
    const parsedIDs = new Set();
    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.id !== 'string') {
        issues.push('Unrecognised entry without a citation key (skipped)'); continue;
      }
      const key = entry.id;
      parsedIDs.add(key);
      if (!KEY.test(key)) { issues.push(`Invalid key: ${key} (skipped)`); continue; }
      if (!counts.has(key)) { issues.push(`Unexpected parsed key: ${key} (skipped)`); continue; }
      if (repeated.has(key)) continue;
      if (known.has(key)) { issues.push(`Already in library: ${key} (skipped)`); continue; }
      if (typeof entry.title !== 'string' || !entry.title.trim()) {
        issues.push(`Missing title: ${key} (skipped)`); continue;
      }
      if (results.some(x => x.id === key)) { issues.push(`Repeated parsed key: ${key} (skipped)`); continue; }
      results.push(entry);
    }
    for (const key of counts.keys()) {
      if (!parsedIDs.has(key) && !repeated.has(key)) issues.push(`Could not parse entry: ${key} (skipped)`);
    }
    return { entries: results, issues, count: inputKeys.length };
  }

  // Manual reference management. Only a defined subset is edited; all other CSL
  // properties survive a round trip. Citation IDs are immutable after creation.
  const MANUAL_TYPES = [
    ['article-journal', 'Journal article'], ['book', 'Book'],
    ['chapter', 'Book chapter'], ['paper-conference', 'Conference paper'],
    ['thesis', 'Thesis'], ['report', 'Report'], ['webpage', 'Webpage'],
    ['document', 'Other document'],
  ];
  const emptyManual = () => ({ id: '', type: 'article-journal', title: '',
    author: '', year: '', container: '', publisher: '', DOI: '', URL: '' });
  const authorLines = record => (Array.isArray(record.author) ? record.author : [])
    .map(person => person.literal || [person.family, person.given].filter(Boolean).join(', ')).join('\n');
  const editManual = record => ({
    id: record.id || '', type: record.type || 'document', title: record.title || '',
    author: authorLines(record), year: String(record.issued?.['date-parts']?.[0]?.[0] || ''),
    container: record['container-title'] || '', publisher: record.publisher || '',
    DOI: record.DOI || '', URL: record.URL || '',
  });
  function validateManual(form, library, editingKey) {
    const id = form.id.trim();
    if (!KEY.test(id)) throw new Error('Citation key must contain letters, numbers or . _ : / + -.');
    if (editingKey && id !== editingKey) throw new Error('Citation keys cannot be changed when editing.');
    if (!editingKey && library.some(x => x.id === id)) throw new Error(`Citation key already exists: ${id}`);
    if (!form.title.trim()) throw new Error('A reference title is required.');
    if (form.year.trim() && !/^\d{4}$/.test(form.year.trim())) throw new Error('Year must be four digits.');
    if (form.URL.trim() && !/^https?:\/\//i.test(form.URL.trim())) throw new Error('URL must begin with https:// or http://.');
    if (!form.type.trim()) throw new Error('Reference type is required.');
    if (editingKey && !library.some(x => x.id === editingKey)) throw new Error(`Reference not found: ${editingKey}`);
    const record = editingKey ? { ...library.find(x => x.id === editingKey) } : {};
    record.id = id;
    record.type = form.type;
    record.title = form.title.trim();
    const lines = form.author.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    if (lines.length && (!editingKey || form.author !== authorLines(record))) {
      record.author = lines.map(line => {
        const comma = line.indexOf(',');
        if (comma === -1) return { literal: line };
        const family = line.slice(0, comma).trim();
        const given = line.slice(comma + 1).trim();
        if (!family) throw new Error('Author family name cannot be empty.');
        return given ? { family, given } : { family };
      });
    } else if (!lines.length) delete record.author;
    if (form.year.trim()) {
      const oldParts = record.issued?.['date-parts']?.[0];
      if (!editingKey || Number(form.year.trim()) !== oldParts?.[0]) {
        const nextParts = Array.isArray(oldParts) ? [...oldParts] : [];
        nextParts[0] = Number(form.year.trim());
        record.issued = { ...(record.issued || {}), 'date-parts': [nextParts] };
      }
    } else delete record.issued;
    for (const [key, value] of [['container-title', form.container], ['publisher', form.publisher],
      ['DOI', form.DOI], ['URL', form.URL]]) {
      if (value.trim()) record[key] = value.trim(); else delete record[key];
    }
    return record;
  }

  /* A6.4a.1: scoped styles are in /admin/colqy-reference-ui.css. */

  const Control = createClass({
    getInitialState() { return { paste: '', query: '', preview: null, busy: false, message: '', error: '',
      manualOpen: false, manual: emptyManual(), editingKey: null, removalKey: null }; },
    startAdd() { this.setState({ manualOpen: true, manual: emptyManual(), editingKey: null, removalKey: null, error: '', message: '' }); },
    startEdit(key) {
      try {
        const entry = this.getLibrary().find(x => x.id === key);
        if (!entry) throw new Error(`Reference not found: ${key}`);
        this.setState({ manualOpen: true, manual: editManual(entry), editingKey: key, removalKey: null, error: '', message: '' });
      } catch (error) { this.setState({ error: error.message }); }
    },
    updateManual(field, value) { this.setState({ manual: { ...this.state.manual, [field]: value }, error: '' }); },
    saveManual() {
      try {
        const library = this.getLibrary();
        const key = this.state.editingKey;
        const entry = validateManual(this.state.manual, library, key);
        const updated = key ? library.map(x => x.id === key ? entry : x) : [...library, entry];
        this.props.onChange(JSON.stringify(updated, null, 2));
        this.setState({ manualOpen: false, manual: emptyManual(), editingKey: null, removalKey: null,
          preview: null, error: '', message: `${key ? 'Updated' : 'Added'} ${entry.id} in the draft. Use Sveltia Save to persist.` });
      } catch (error) { this.setState({ error: error.message }); }
    },
    removeReference(key) {
      try {
        const library = this.getLibrary();
        if (!library.some(x => x.id === key)) throw new Error(`Reference not found: ${key}`);
        if (this.state.removalKey !== key) { this.setState({ removalKey: key, error: '' }); return; }
        this.props.onChange(JSON.stringify(library.filter(x => x.id !== key), null, 2));
        this.setState({ removalKey: null, manualOpen: false, editingKey: null, preview: null,
          message: `Removed ${key} from the draft. Existing Markdown citations are not changed. Use Sveltia Save to persist.`, error: '' });
      } catch (error) { this.setState({ error: error.message }); }
    },
    getLibrary() { return parseLibrary(this.props.value); },
    async previewImport() {
      this.setState({ busy: true, preview: null, message: '', error: '' });
      try {
        const existing = this.getLibrary();
        const Cite = await loadCitation();
        const cite = new Cite(this.state.paste);
        const parsed = cite.data;
        const preview = reviewBibtex(this.state.paste, existing, parsed);
        this.setState({ preview, busy: false });
      } catch (error) {
        this.setState({ busy: false, error: `Import preview failed: ${error.message}` });
      }
    },
    importPreview() {
      try {
        const current = this.getLibrary();
        const preview = this.state.preview;
        if (!preview?.entries?.length) return;
        const ids = new Set(current.map(x => x.id));
        const accepted = preview.entries.filter(x => !ids.has(x.id));
        if (!accepted.length) { this.setState({ preview: null, message: 'No new references to add.' }); return; }
        this.props.onChange(JSON.stringify([...current, ...accepted], null, 2));
        this.setState({ paste: '', preview: null, message: `${accepted.length} reference(s) added to the draft. Use Sveltia Save to write the library.`, error: '' });
      } catch (error) { this.setState({ error: error.message }); }
    },
    render() {
      let library = [], libraryError = '';
      try { library = this.getLibrary(); } catch (error) { libraryError = error.message; }
      const preview = this.state.preview;
      const query = this.state.query.toLowerCase().trim();
      const filtered = library.filter(x => [x.id, x.title, x.type, authorLines(x), x.issued?.['date-parts']?.[0]?.[0]].join(' ').toLowerCase().includes(query));
      const id = this.props.forID || 'colqy-reference-library';
      const previewRow = (entry, index) => h('div', { className: 'cq-bibtex-item', key: `${entry.id}-${index}` },
        h('div', { className: 'cq-bibtex-item-main' },
          h('strong', {}, entry.title || entry.id),
          h('p', { className: 'cq-bibtex-small' }, `${entry.id} · ${entry.type || 'reference'}`)));
      const libraryRow = (entry, index) => h('div', { className: 'cq-bibtex-item', key: `${entry.id}-${index}` },
        h('div', { className: 'cq-bibtex-item-main' },
          h('strong', {}, entry.title || entry.id),
          h('p', { className: 'cq-bibtex-small' }, `${entry.id} · ${entry.type || 'reference'}`)),
        h('div', { className: 'cq-bibtex-item-actions' },
          h('button', { type: 'button', onClick: () => this.startEdit(entry.id) }, 'Edit'),
          h('button', { type: 'button', onClick: () => this.removeReference(entry.id) },
            this.state.removalKey === entry.id ? 'Confirm removal' : 'Remove')),
        this.state.removalKey === entry.id && h('p', { className: 'cq-ref-warning', role: 'alert' },
          'Removing this record can break citations in existing content. Click Confirm removal again, or cancel below.'),
        this.state.removalKey === entry.id && h('button', { type: 'button', onClick: () => this.setState({ removalKey: null }) }, 'Cancel removal'));
      const manualField = (key, label, multiline = false) => h('div', { className: 'cq-ref-manual-field', key },
        h('label', { htmlFor: `${id}-manual-${key}` }, label),
        multiline ? h('textarea', { id: `${id}-manual-${key}`, rows: 3, value: this.state.manual[key],
          onChange: event => this.updateManual(key, event.target.value) })
          : h('input', { id: `${id}-manual-${key}`, value: this.state.manual[key],
            readOnly: key === 'id' && !!this.state.editingKey,
            onChange: event => this.updateManual(key, event.target.value) }));
      return h('section', { className: 'cq-bibtex' },
        h('p', { className: 'cq-bibtex-small' }, `${library.length} reference(s) in the site library. Paste a BibTeX export, preview it, then confirm the import.`),
        h('label', { htmlFor: `${id}-paste` }, 'Paste BibTeX entries'),
        h('textarea', { id: `${id}-paste`, value: this.state.paste, placeholder: '@article{smith2024,\n  title = {An Example},\n  author = {Smith, Jane},\n  year = {2024}\n}',
          onChange: event => this.setState({ paste: event.target.value, preview: null, message: '', error: '' }) }),
        h('div', { className: 'cq-bibtex-actions' },
          h('button', { type: 'button', disabled: !this.state.paste.trim() || this.state.busy || !!libraryError,
            onClick: () => this.previewImport() }, this.state.busy ? 'Parsing…' : 'Preview import'),
          h('button', { type: 'button', 'data-primary': true, disabled: !preview?.entries?.length || this.state.busy || !!libraryError,
            onClick: () => this.importPreview() }, `Add ${preview?.entries?.length || 0} to library`)),
        libraryError && h('p', { role: 'alert', className: 'cq-bibtex-errors' }, libraryError),
        this.state.error && h('p', { role: 'alert', className: 'cq-bibtex-errors' }, this.state.error),
        this.state.message && h('p', { role: 'status', className: 'cq-bibtex-small' }, this.state.message),
        preview && h('div', {},
          h('strong', {}, `${preview.entries.length} new of ${preview.count} detected`),
          preview.entries.length > 0 && h('div', { className: 'cq-bibtex-list' }, preview.entries.slice(0, 100).map(previewRow)),
          preview.issues.length > 0 && h('div', { className: 'cq-bibtex-errors', role: 'status' },
            h('strong', {}, `${preview.issues.length} skipped or unparsed`),
            h('ul', {}, preview.issues.map((message, i) => h('li', { key: i }, message))))),
        h('p', { className: 'cq-bibtex-small' }, 'Imports do not overwrite existing keys. After importing, click Sveltia Save. The citation picker updates after its search index is regenerated by the publishing workflow.'),
        h('div', { className: 'cq-bibtex-actions' },
          h('button', { type: 'button', onClick: () => this.state.manualOpen ? this.setState({ manualOpen: false, editingKey: null, error: '' }) : this.startAdd() },
            this.state.manualOpen ? 'Close manual editor' : 'Add reference manually')),
        this.state.manualOpen && h('div', { className: 'cq-ref-manual' },
          h('strong', {}, this.state.editingKey ? `Edit ${this.state.editingKey}` : 'New reference'),
          h('p', { className: 'cq-bibtex-small' }, this.state.editingKey
            ? 'Citation key is locked. Fields not shown here are preserved.'
            : 'Enter a unique citation key and the bibliographic information available.'),
          h('div', { className: 'cq-ref-manual-grid' },
            manualField('id', 'Citation key'),
            h('div', { className: 'cq-ref-manual-field' },
              h('label', { htmlFor: `${id}-manual-type` }, 'Reference type'),
              h('select', { id: `${id}-manual-type`, value: this.state.manual.type,
                onChange: event => this.updateManual('type', event.target.value) },
                ...[...MANUAL_TYPES, ...(this.state.editingKey && !MANUAL_TYPES.some(([value]) => value === this.state.manual.type) ? [[this.state.manual.type, this.state.manual.type + ' (existing)']] : [])].map(([value, label]) => h('option', { key: value, value }, label)))),
            manualField('title', 'Title'), manualField('year', 'Publication year'),
            manualField('container', 'Journal or book title'), manualField('publisher', 'Publisher'),
            manualField('DOI', 'DOI'), manualField('URL', 'URL')),
          manualField('author', 'Authors — one per line, Family, Given', true),
          h('div', { className: 'cq-bibtex-actions' },
            h('button', { type: 'button', 'data-primary': true, disabled: !!libraryError,
              onClick: () => this.saveManual() }, this.state.editingKey ? 'Update reference' : 'Add to library'),
            h('button', { type: 'button', onClick: () => this.setState({ manualOpen: false, editingKey: null, error: '' }) }, 'Cancel'))),
        h('label', { htmlFor: `${id}-search` }, 'Search current library'),
        h('input', { id: `${id}-search`, type: 'search', value: this.state.query, placeholder: 'Title, author or citation key',
          onChange: event => this.setState({ query: event.target.value }) }),
        h('div', { className: 'cq-bibtex-list' }, filtered.slice(0, 100).map(libraryRow),
          filtered.length > 100 && h('p', { className: 'cq-bibtex-small' }, 'Showing first 100 references. Refine your search.')),
        h('details', { className: 'cq-bibtex-details' },
          h('summary', {}, 'Advanced · Edit CSL JSON directly'),
          h('p', { className: 'cq-bibtex-small' }, 'Retained for compatibility. Invalid JSON will prevent saving.'),
          h('textarea', { value: typeof this.props.value === 'string' ? this.props.value : '[]',
            onChange: event => { this.props.onChange(event.target.value); this.setState({ preview: null }); },
            'aria-label': 'Advanced CSL JSON editor' })));
    },
  });

  CMS.registerFieldType('colqy-bibtex-library', Control);
  window.ColqyBibtexImport = Object.freeze({ reviewBibtex, parseLibrary, validateManual, editManual, emptyManual });
})();
