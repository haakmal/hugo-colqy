#!/usr/bin/env python3
"""Guarded, non-destructive Colqy A6.5.1 installer. Run from repository root."""
from pathlib import Path
import argparse
import difflib
import hashlib
import sys

try:
    import yaml
except ImportError:
    sys.exit('PyYAML required: python3 -m pip install "PyYAML>=6,<7"')

PACKAGE = Path(__file__).resolve().parents[1]
OLD_HASHES = {
    '.github/workflows/colqy-pages.yml': 'd37dac5e0534f234014c349f3a9b89ac23e4d0f4e69f489c759014b09161169b',
    'tools/check-deployment-a6-4b1.py': 'c5244924d08b1dfcd4af7a83d90799821a65c8e2232935ab13669aece4181e3d',
}
NEW_FILES = ('tools/bind-cms-repository.py', 'docs/A6_5_1_REPOSITORY_BINDING.md',
             'tools/test-a6-5-1.py', 'INCREMENT-A6.5.1.md')


def sha(data):
    return hashlib.sha256(data).hexdigest()


def transform_config(source):
    before = yaml.safe_load(source)
    if not isinstance(before, dict) or not isinstance(before.get('backend'), dict):
        raise ValueError('Missing Sveltia backend')
    if before['backend'].get('name') != 'github':
        raise ValueError('Expected Sveltia GitHub backend')
    current = before['backend'].get('repo')
    if current == 'YOUR_ACCOUNT/YOUR_REPOSITORY':
        return source
    if current != 'haakmal/hugo-colqy':
        raise ValueError(f'Unexpected Sveltia backend.repo: {current!r}; no files modified')
    old = '  repo: haakmal/hugo-colqy'
    if source.count(old) != 1:
        raise ValueError('Could not safely identify the repository line')
    new = source.replace(old, '  repo: YOUR_ACCOUNT/YOUR_REPOSITORY', 1)
    after = yaml.safe_load(new)
    after['backend']['repo'] = current
    if after != before:
        raise ValueError('Unrelated CMS configuration changed')
    return new


def plan():
    updates = {}
    config = Path('static/admin/config.yml')
    if not config.is_file():
        raise ValueError('Run from the hugo-colqy repository root')
    updates[config] = transform_config(config.read_text(encoding='utf-8'))
    for rel, old_hash in OLD_HASHES.items():
        target = Path(rel)
        payload = PACKAGE / 'payload' / rel
        if not target.is_file() or not payload.is_file():
            raise ValueError(f'Missing {rel}')
        old_bytes = target.read_bytes()
        new_bytes = payload.read_bytes()
        if sha(old_bytes) not in (old_hash, sha(new_bytes)):
            raise ValueError(f'Unexpected local modifications in {rel}; review before applying')
        updates[target] = new_bytes.decode('utf-8')
    for rel in NEW_FILES:
        target = Path(rel)
        payload = (PACKAGE / 'payload' / rel) if rel.startswith('tools/bind') else PACKAGE / rel
        if not payload.is_file():
            raise ValueError(f'Archive is missing {rel}')
        data = payload.read_text(encoding='utf-8')
        if target.exists() and target.read_text(encoding='utf-8') != data:
            raise ValueError(f'Existing {rel} differs; refusing to overwrite')
        updates[target] = data
    return updates


def main():
    parser = argparse.ArgumentParser()
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument('--dry-run', action='store_true')
    action.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    try:
        updates = plan()
    except Exception as exc:
        sys.exit('A6.5.1 stopped; no files modified: ' + str(exc))
    pending = [(p, text) for p, text in updates.items() if not p.exists() or p.read_text(encoding='utf-8') != text]
    if not pending:
        print('A6.5.1 already applied; no changes.')
        return
    for path, text in pending:
        print(('UPDATE ' if path.exists() else 'CREATE ') + str(path))
        if args.dry_run and path.exists():
            print(''.join(difflib.unified_diff(path.read_text(encoding='utf-8').splitlines(True),
                 text.splitlines(True), fromfile=str(path), tofile=str(path) + ' (A6.5.1)')))
    if args.apply:
        for path, text in pending:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text, encoding='utf-8')
        print('A6.5.1 applied. Tracked CMS source is neutral; generated CMS binding happens after Hugo builds.')
    else:
        print('Dry run only; no files modified.')


if __name__ == '__main__':
    main()
