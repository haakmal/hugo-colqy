#!/usr/bin/env python3
"""Generate a Pandoc CSL citation cache for Colqy's Hugo templates.

No source Markdown is rewritten. The cache is derived and may be committed so
plain Hugo builds work without Pandoc. Re-run after reference/citation edits.
"""
import argparse
import html
import json
import re
import subprocess
import sys
from pathlib import Path

KEY = r'[A-Za-z0-9][A-Za-z0-9._:/+\-]*'
CLUSTER = re.compile(r'\[\s*@' + KEY + r'(?:\s*[,;]\s*@?' + KEY + r')*\s*\]')
KEY_IN_CLUSTER = re.compile(r'@(' + KEY + r')')
CITE_PARAGRAPH = re.compile(r'<p>COLQY_CITE_(\d+)\s+(.*?)</p>', re.S)
BIBLIOGRAPHY = re.compile(r'(<div id="refs"\b[\s\S]*?</div>\s*</div>|<div id="refs"\b[\s\S]*?</div>)', re.S)


def frontmatter(text):
    lines = text.splitlines(keepends=True)
    if not lines or lines[0].strip() != '---':
        return '', text
    for i in range(1, len(lines)):
        if lines[i].strip() == '---':
            return ''.join(lines[1:i]), ''.join(lines[i + 1:])
    raise ValueError('Unclosed YAML front matter')


def clusters_in_body(body):
    """Find citation clusters, including multi-line clusters and editor spacing.

    Excludes fenced and inline code, comments and shortcode tags. This still
    cannot protect literal citation text in every Markdown/HTML construct; the
    Hugo renderer has the same documented limitation as A6.3r.3.
    """
    visible = []
    fence = None
    for line in body.splitlines(keepends=True):
        trimmed = line.lstrip()
        fm = re.match(r'(`{3,}|~{3,})', trimmed)
        if fm:
            if fence is None:
                fence = fm.group(1)
            elif fm.group(1)[0] == fence[0] and len(fm.group(1)) >= len(fence):
                fence = None
            visible.append('\n' if line.endswith('\n') else '')
            continue
        visible.append(('\n' if line.endswith('\n') else '') if fence else line)
    text = ''.join(visible)
    text = re.sub(r'<!--.*?-->', '', text, flags=re.S)
    text = re.sub(r'`+[^`\n]*`+', '', text)
    text = re.sub(r'{{[%<].*?[>%]}}', '', text, flags=re.S)
    found = []
    for match in CLUSTER.finditer(text):
        if match.group() not in found:
            found.append(match.group())
    return found


def cluster_keys(cluster):
    """Extract ordered keys from one accepted cluster."""
    keys = [part.strip().lstrip('@').strip() for part in re.split(r'[;,]', cluster[1:-1])]
    if not keys or any(not re.fullmatch(KEY, key) for key in keys):
        raise ValueError(f'Invalid citation cluster: {cluster}')
    return keys


def canonical_cluster(cluster):
    return '[@' + '; @'.join(cluster_keys(cluster)) + ']'


def cluster_pattern(cluster):
    """RE2-compatible regex for the same keys despite editor spacing.

    Hugo finds each matching rendered HTML text fragment and replaces it using
    literal string replacement, avoiding regex substitution of CSL HTML.
    """
    keys = cluster_keys(cluster)
    return r'\[\s*@' + re.escape(keys[0]) + ''.join(
        r'\s*[,;]\s*@?' + re.escape(key) for key in keys[1:]) + r'\s*\]'


def resolve_style(root, metadata, default_style):
    style = metadata.get('citation_style') or default_style
    if not style or style == 'pandoc-default':
        return None
    if not isinstance(style, str) or not re.fullmatch(r'[A-Za-z0-9_.\-]+\.csl', style):
        raise ValueError('citation_style must be a .csl filename in assets/csl/')
    path = root / 'assets/csl' / style
    if not path.is_file():
        raise ValueError(f'CSL style not found: {path}')
    return path


def citeproc(pandoc, library, clusters, style):
    input_text = '\n\n'.join(f'COLQY_CITE_{i} {canonical_cluster(raw)}' for i, raw in enumerate(clusters)) + '\n'
    args = [pandoc, '--citeproc', '-f', 'markdown', '-t', 'html',
            '--bibliography', str(library), '--metadata=link-citations:true']
    if style:
        args += ['--csl', str(style)]
    completed = subprocess.run(args, input=input_text, text=True, capture_output=True, check=False)
    if completed.returncode:
        raise ValueError(f'Pandoc failed: {completed.stderr.strip()}')
    output = completed.stdout
    found = {int(i): rendered.strip() for i, rendered in CITE_PARAGRAPH.findall(output)}
    if set(found) != set(range(len(clusters))):
        raise ValueError('Pandoc returned unexpected citation output; no cache was written')
    bib_start = output.find('<div id="refs"')
    if bib_start < 0:
        raise ValueError('Pandoc did not generate a bibliography; no cache was written')
    bibliography = output[bib_start:].strip()
    # Bibliography HTML comes from Pandoc, not user-entered template HTML.
    return [{'raw': raw, 'pattern': cluster_pattern(raw), 'html': found[i]} for i, raw in enumerate(clusters)], bibliography


def generate(root, pandoc):
    library = root / 'data/references.json'
    if not library.is_file():
        raise ValueError('Missing data/references.json; complete A6.3r.1 first')
    entries = json.loads(library.read_text(encoding='utf-8'))
    if not isinstance(entries, list) or any(not isinstance(x, dict) or not isinstance(x.get('id'), str) for x in entries):
        raise ValueError('Reference library must be a CSL JSON array with IDs')
    ids = [x['id'] for x in entries]
    if len(ids) != len(set(ids)):
        raise ValueError('Duplicate keys in reference library')
    known = set(ids)
    settings = root / 'data/citation-settings.yaml'
    default_style = 'pandoc-default'
    if settings.exists():
        try:
            import yaml
        except ImportError as exc:
            raise ValueError('PyYAML required when citation-settings.yaml exists') from exc
        obj = yaml.safe_load(settings.read_text(encoding='utf-8')) or {}
        default_style = obj.get('default_style', default_style)
    result = {}
    for path in sorted((root / 'content').rglob('*.md')):
        raw = path.read_text(encoding='utf-8-sig')
        fm, body = frontmatter(raw)
        clusters = clusters_in_body(body)
        if not clusters:
            continue
        missing = sorted({key for c in clusters for key in cluster_keys(c)} - known)
        if missing:
            raise ValueError(f'{path.relative_to(root)}: missing citation keys: {", ".join(missing)}')
        metadata = {}
        if fm:
            import yaml
            metadata = yaml.safe_load(fm) or {}
            if not isinstance(metadata, dict):
                raise ValueError(f'{path}: invalid front matter')
        style = resolve_style(root, metadata, default_style)
        replacements, bibliography = citeproc(pandoc, library, clusters, style)
        key = path.relative_to(root / 'content').as_posix()
        result[key] = {'replacements': replacements, 'bibliography': bibliography,
                       'style': style.name if style else 'pandoc-default'}
    return json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2) + '\n'


def main():
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--dry-run', action='store_true')
    group.add_argument('--apply', action='store_true')
    group.add_argument('--check', action='store_true')
    parser.add_argument('--pandoc', default='pandoc')
    args = parser.parse_args()
    root = Path.cwd()
    output = root / 'data/citation_cache.json'
    try:
        updated = generate(root, args.pandoc)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        sys.exit('Citation processing stopped; cache unchanged: ' + str(exc))
    existing = output.read_text(encoding='utf-8') if output.exists() else None
    changed = updated != existing
    if args.check:
        if changed:
            sys.exit('Citation cache is stale. Run --apply after updating citations or references.')
        print('Citation cache is current.')
    elif args.dry_run:
        print(f'{len(json.loads(updated))} cited documents; cache {"would change" if changed else "is current"}. No files modified.')
    elif changed:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(updated, encoding='utf-8')
        print(f'Updated {output}: {len(json.loads(updated))} cited documents.')
    else:
        print('Citation cache already current.')


if __name__ == '__main__':
    main()
