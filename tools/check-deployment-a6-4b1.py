#!/usr/bin/env python3
"""Read-only structural preflight for the GitHub Pages default.

Does not deploy, publish, or modify repository files. Checks only structure;
GitHub Pages settings, account permissions and browser CMS login are manual.
"""
from pathlib import Path
import argparse
import os
import re
import sys

REQUIRED = (
    'hugo.toml', 'static/admin/index.html', 'static/admin/config.yml',
    'themes/colqy-spatial/layouts', 'tools/build-colqy.py',
    'tools/build-colqy-a6-3r6.py', 'tools/build-citations-a6-3r3.py',
    'tools/sync-reference-index-a6-3r2.py', 'data/references.json',
    '.github/workflows/colqy-pages.yml',
)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--ci', action='store_true', help='CI mode; same read-only checks')
    args = parser.parse_args()
    missing = [p for p in REQUIRED if not Path(p).exists()]
    for p in missing:
        print('ERROR missing:', p)
    if missing:
        sys.exit(1)
    try:
        import json
        refs = json.loads(Path('data/references.json').read_text(encoding='utf-8'))
        if not isinstance(refs, list):
            raise ValueError('expected CSL JSON array')
        keys = [r.get('id') for r in refs if isinstance(r, dict)]
        if len(keys) != len(refs) or any(not isinstance(k, str) or not k for k in keys) or len(set(keys)) != len(keys):
            raise ValueError('missing or duplicated citation IDs')
    except (ValueError, OSError) as exc:
        sys.exit('ERROR references.json: ' + str(exc))
    if '/admin/' in Path('static/admin/index.html').read_text(encoding='utf-8'):
        sys.exit('ERROR admin/index.html uses root-absolute /admin/ paths; GitHub Pages project URLs will fail')
    repository = os.environ.get('GITHUB_REPOSITORY') if args.ci else None
    if repository:
        config = Path('static/admin/config.yml').read_text(encoding='utf-8')
        match = re.search(r'(?m)^\s{2}repo:\s*([^#\s]+)', config)
        if not match or match.group(1).strip("'\"").lower() != repository.lower():
            sys.exit('ERROR Sveltia backend.repo must match this GitHub repository: '+repository)
    print('PASS: Colqy publishing file structure, CMS asset paths and reference IDs.')
    print('NOTE: CI preflight does not enable GitHub Pages or verify CMS authentication.')
    if not args.ci:
        print('NOTE: Before publishing, review public content and set repository variable COLQY_PUBLISH=true.')

if __name__ == '__main__':
    main()
