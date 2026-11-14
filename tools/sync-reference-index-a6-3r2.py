#!/usr/bin/env python3
"""Generate a read-only, browser-searchable index from canonical CSL JSON."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import tempfile

KEY = re.compile(r'^[A-Za-z0-9][A-Za-z0-9._:/+\-]*$')

def create_index(path):
    source = path.read_bytes()
    data = json.loads(source.decode('utf-8-sig'))
    if not isinstance(data, list):
        raise ValueError('Canonical reference library must be a CSL JSON array')
    seen = set()
    items = []
    for ref in data:
        if not isinstance(ref, dict) or not isinstance(ref.get('id'), str) or not KEY.fullmatch(ref['id']):
            raise ValueError('Invalid reference ID in CSL JSON')
        if ref['id'] in seen:
            raise ValueError('Duplicate reference ID: ' + ref['id'])
        seen.add(ref['id'])
        if not isinstance(ref.get('title'), str):
            raise ValueError('Reference title missing: ' + ref['id'])
        item = {k: ref[k] for k in ('id', 'title', 'type', 'author', 'editor', 'issued') if k in ref}
        items.append(item)
    items.sort(key=lambda x: x['id'].casefold())
    return json.dumps({'version': 1, 'source_sha256': hashlib.sha256(source).hexdigest(), 'entries': items},
                      ensure_ascii=False, indent=2) + '\n'

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--library', type=Path, default=Path('data/references.json'))
    parser.add_argument('--output', type=Path, default=Path('static/admin/references-index.json'))
    parser.add_argument('--check', action='store_true', help='Fail if browser index is stale; do not write')
    args = parser.parse_args()
    try:
        target = create_index(args.library)
        old = args.output.read_text(encoding='utf-8') if args.output.exists() else None
        if args.check:
            if old != target:
                sys.exit('STALE reference index. Run: python3 tools/sync-reference-index-a6-3r2.py')
            print('Reference index is current.')
            return
        if old == target:
            print('Reference index already current.')
            return
        args.output.parent.mkdir(parents=True, exist_ok=True)
        fd, tmp = tempfile.mkstemp(prefix='.references-index-', suffix='.json', dir=args.output.parent)
        try:
            with os.fdopen(fd, 'w', encoding='utf-8') as handle:
                handle.write(target)
            os.replace(tmp, args.output)
        finally:
            if os.path.exists(tmp): os.unlink(tmp)
        print('Updated', args.output)
    except (OSError, ValueError, UnicodeError, json.JSONDecodeError) as exc:
        sys.exit('Reference index failed: ' + str(exc))

if __name__ == '__main__':
    main()
