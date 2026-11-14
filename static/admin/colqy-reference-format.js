/* Colqy A6.3r.7a — reversible CSL JSON array round-trip test. */
(() => {
  'use strict';
  if (!window.CMS?.registerCustomFormat) {
    console.error('Colqy References: Sveltia registerCustomFormat is unavailable.');
    return;
  }

  const validate = value => {
    if (!Array.isArray(value)) {
      throw new Error('The reference library must be a CSL JSON array, not an object.');
    }
    const seen = new Set();
    value.forEach((record, index) => {
      if (!record || Array.isArray(record) || typeof record !== 'object') {
        throw new Error(`Reference ${index + 1} must be an object.`);
      }
      if (typeof record.id !== 'string' || !record.id.trim()) {
        throw new Error(`Reference ${index + 1} needs a citation key (id).`);
      }
      if (seen.has(record.id)) {
        throw new Error(`Duplicate citation key: ${record.id}`);
      }
      seen.add(record.id);
    });
    return value;
  };

  const parse = text => validate(JSON.parse(String(text).replace(/^\uFEFF/, '')));
  window.CMS.registerCustomFormat('colqy-csl-array', 'json', {
    fromFile: text => ({ references_json: JSON.stringify(parse(text), null, 2) }),
    toFile: data => {
      if (!data || typeof data.references_json !== 'string') {
        throw new Error('References editor returned no JSON text; save cancelled.');
      }
      return JSON.stringify(parse(data.references_json), null, 2) + '\n';
    },
  });
})();
