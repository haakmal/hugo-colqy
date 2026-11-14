#!/usr/bin/env python3
"""Read-only Colqy deployment preflight. Neutral source config is expected.

Generated admin/config.yml is separately bound and validated after Hugo builds.
"""
from pathlib import Path
import argparse
import json
import sys

REQUIRED = (
    'hugo.toml', 'static/admin/index.html', 'static/admin/config.yml',
    'themes/colqy-spatial/layouts', 'tools/build-colqy.py',
    'tools/build-colqy-a6-3r6.py', 'tools/build-citations-a6-3r3.py',
    'tools/sync-reference-index-a6-3r2.py', 'tools/bind-cms-repository.py',
    'data/references.json', '.github/workflows/colqy-pages.yml',
)
PLACEHOLDER = 'YOUR_ACCOUNT/YOUR_REPOSITORY'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--ci', action='store_true', help='Validate a portable source tree in CI')
    parser.parse_args()
    missing = [p for p in REQUIRED if not Path(p).exists()]
    for path in missing:
        print('ERROR missing:', path)
    if missing:
        sys.exit(1)
    try:
        import yaml
        config = yaml.safe_load(Path('static/admin/config.yml').read_text(encoding='utf-8'))
        backend = config.get('backend') if isinstance(config, dict) else None
        if not isinstance(backend, dict) or backend.get('name') != 'github' or backend.get('repo') != PLACEHOLDER:
            raise ValueError('static/admin/config.yml must use the neutral YOUR_ACCOUNT/YOUR_REPOSITORY placeholder; the generated file is bound during deployment.')
        refs = json.loads(Path('data/references.json').read_text(encoding='utf-8'))
        if not isinstance(refs, list):
            raise ValueError('references.json must be a CSL JSON array')
        keys = [r.get('id') for r in refs if isinstance(r, dict)]
        if len(keys) != len(refs) or any(not isinstance(k, str) or not k for k in keys) or len(set(keys)) != len(keys):
            raise ValueError('Missing or duplicate citation IDs')
    except (ValueError, OSError, ImportError) as exc:
        sys.exit('ERROR configuration: ' + str(exc))
    if '/admin/' in Path('static/admin/index.html').read_text(encoding='utf-8'):
        sys.exit('ERROR admin/index.html uses root-absolute /admin/ paths; GitHub Pages project URLs will fail')
    print('PASS: Colqy source is portable, reference IDs are valid, and generated CMS binding is available.')
    print('NOTE: Publishing requires COLQY_PUBLISH=true and GitHub Pages enabled. This does not verify CMS login.')


if __name__ == '__main__':
    main()
