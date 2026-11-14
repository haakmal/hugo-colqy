/* Colqy A6.4a.2 — non-destructive contextual visibility for the Content editor.
   Sveltia does not support dependent fields natively. Never change field values. */
(() => {
  'use strict';
  const HIDDEN = 'data-colqy-context-hidden';
  const NOTE = 'cq-context-note';
  const LABELS = /^(?:Title|Content type|Page address|Summary|Primary content|Content|Collections|Tags|Draft|Supporting content|Index thumbnail|Statuses|Publication date|Featured|Exclude from automatic listings|Advanced)/i;
  const norm = value => String(value || '').replace(/\s+/g, ' ').replace(/\s*\*\s*$/, '').trim();
  const isLabel = (node, expected) => {
    const value = norm(node.textContent);
    return expected === 'supporting_content'
      ? /^Supporting content(?:\s*\(.*\))?$/i.test(value)
      : /^Content type$/i.test(value);
  };
  const controls = el => el.querySelector('select, [role="combobox"], [contenteditable="true"], textarea, [role="textbox"], input');

  // Find the smallest safe field wrapper. Never hide a parent containing other top-level fields.
  const wrapperFor = label => {
    let candidate = null;
    for (let parent = label.parentElement, depth = 0; parent && depth < 8; parent = parent.parentElement, depth++) {
      const otherLabels = [...parent.querySelectorAll('label')].filter(l => l !== label && LABELS.test(norm(l.textContent)));
      if (otherLabels.length) break;
      if (controls(parent)) candidate = parent;
      if (parent.matches?.('[data-field-name], [data-field], .field, .field-wrapper, .cms-field')) {
        if (controls(parent)) return parent;
      }
    }
    return candidate;
  };
  const locate = name => {
    const direct = document.querySelector(`[data-field-name="${name}"], [data-field="${name}"], [data-testid="field-${name}"]`);
    if (direct && controls(direct)) return direct;
    for (const label of document.querySelectorAll('label')) {
      if (!isLabel(label, name)) continue;
      const wrapper = wrapperFor(label);
      if (wrapper) return wrapper;
    }
    return null;
  };
  const typeFrom = field => {
    if (!field) return null;
    const select = field.querySelector('select');
    let value = select?.value || '';
    if (!value) {
      const input = field.querySelector('input[name*="content_type"], input[id*="content_type"]');
      value = input?.value || '';
    }
    if (!value) {
      const combo = field.querySelector('[role="combobox"], button[aria-haspopup="listbox"]');
      value = combo?.getAttribute('data-value') || combo?.getAttribute('aria-valuetext') || combo?.textContent || '';
    }
    value = norm(value).toLowerCase();
    if (value === 'article' || value === 'page' || value === 'project') return value;
    return null;
  };
  const hasContent = field => {
    if (!field) return null;
    const editors = [...field.querySelectorAll('textarea, [contenteditable="true"], [role="textbox"]')];
    if (!editors.length) return null; // Editor collapsed or unavailable: preserve visibility.
    for (const editor of editors) {
      const value = editor.matches('textarea, input') ? editor.value : editor.textContent;
      if (norm(value)) return true;
      if (editor.querySelector?.('img, figure, [data-lexical-decorator]')) return true;
    }
    return false;
  };
  const note = field => {
    let element = [...field.querySelectorAll('.' + NOTE)].find(x => x.dataset.colqyNote === 'article');
    if (!element) {
      element = document.createElement('p');
      element.className = NOTE;
      element.dataset.colqyNote = 'article';
      element.setAttribute('role', 'note');
      element.textContent = 'This supporting content is retained but not rendered in Articles. Move it to Primary content if it should be published.';
      field.prepend(element);
    }
    return element;
  };
  const apply = (type, field) => {
    if (!field) return;
    const filled = hasContent(field);
    // Hide only a known-empty field on Articles. No data is removed or rewritten.
    const hide = type === 'article' && filled === false;
    if (hide) field.setAttribute(HIDDEN, 'true');
    else field.removeAttribute(HIDDEN);
    const existing = field.querySelector('.' + NOTE + '[data-colqy-note="article"]');
    if (type === 'article' && filled === true) note(field);
    else existing?.remove();
  };
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const supporting = locate('supporting_content');
    if (!supporting) return;
    const type = typeFrom(locate('content_type'));
    // Unknown type: never hide a field based on a guess.
    apply(type, supporting);
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };
  const observer = new MutationObserver(schedule);
  const start = () => {
    if (!document.body) return;
    observer.observe(document.body, {childList: true, subtree: true});
    document.addEventListener('change', schedule, true);
    document.addEventListener('input', schedule, true);
    document.addEventListener('click', schedule, true);
    schedule();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
