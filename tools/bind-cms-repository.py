#!/usr/bin/env python3
"""Bind Sveltia to the publishing repository in generated Hugo output only.

Never writes static/admin/config.yml or any other tracked source file.
"""
import argparse
import os
from pathlib import Path
import re
import sys

REPOSITORY = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})/[A-Za-z0-9_.-]{1,100}$")
PLACEHOLDER = 'YOUR_ACCOUNT/YOUR_REPOSITORY'


def valid_repository(value):
    return bool(value and REPOSITORY.fullmatch(value) and value != PLACEHOLDER)


def resolve_repository(argument, environment):
    repo = argument or environment.get('COLQY_REPOSITORY') or environment.get('GITHUB_REPOSITORY')
    if not valid_repository(repo):
        raise ValueError('Supply a real GitHub owner/repository using --repo or COLQY_REPOSITORY; GitHub Actions supplies GITHUB_REPOSITORY automatically.')
    if environment.get('GITHUB_REPOSITORY') and repo.lower() != environment['GITHUB_REPOSITORY'].lower():
        raise ValueError('Refusing repository binding that differs from GITHUB_REPOSITORY.')
    if environment.get('COLQY_REPOSITORY') and repo.lower() != environment['COLQY_REPOSITORY'].lower():
        raise ValueError('Conflicting --repo and COLQY_REPOSITORY values.')
    return repo


def replace_repo(source, repository):
    try:
        import yaml
    except ImportError as exc:
        raise ValueError('PyYAML is required: python3 -m pip install "PyYAML>=6,<7"') from exc
    before = yaml.safe_load(source)
    if not isinstance(before, dict) or not isinstance(before.get('backend'), dict):
        raise ValueError('Missing Sveltia backend configuration.')
    if before['backend'].get('name') != 'github' or not isinstance(before['backend'].get('repo'), str):
        raise ValueError('Expected a GitHub backend with a repository field.')
    # The repository field in this Colqy configuration is a top-level backend child.
    pattern = re.compile(r'(?m)^(  repo:\s*)([^\n#]+?)(\s*(?:#.*)?)$')
    matches = list(pattern.finditer(source))
    if len(matches) != 1:
        raise ValueError('Expected exactly one two-space-indented backend.repo entry.')
    original = matches[0].group(2).strip().strip("'\"")
    if original != before['backend']['repo']:
        raise ValueError('Repository text does not match the parsed backend.repo field.')
    after = source[:matches[0].start(2)] + repository + source[matches[0].end(2):]
    parsed = yaml.safe_load(after)
    if parsed['backend']['repo'] != repository:
        raise ValueError('Repository binding did not validate.')
    parsed['backend']['repo'] = before['backend']['repo']
    if parsed != before:
        raise ValueError('Unexpected changes outside backend.repo.')
    return after


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', type=Path, default=Path('public'), help='Generated Hugo output directory (default: public)')
    parser.add_argument('--repo', help='GitHub owner/repository; otherwise uses COLQY_REPOSITORY or GITHUB_REPOSITORY')
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument('--apply', action='store_true', help='Write generated admin/config.yml')
    action.add_argument('--check', action='store_true', help='Verify generated admin/config.yml without changing it')
    args = parser.parse_args()
    try:
        repo = resolve_repository(args.repo, os.environ)
        path = args.site / 'admin' / 'config.yml'
        source_path = Path('static/admin/config.yml').resolve()
        if path.resolve() == source_path:
            raise ValueError('Refusing to modify tracked source static/admin/config.yml.')
        if not path.is_file() or path.is_symlink():
            raise ValueError(f'Generated CMS configuration is missing or is a symlink: {path}; build Hugo first.')
        current = path.read_text(encoding='utf-8')
        desired = replace_repo(current, repo)
        if args.check:
            if current != desired:
                raise ValueError(f'Generated CMS repository is not bound to {repo}; run with --apply after building.')
            print(f'PASS: generated Sveltia backend.repo is {repo}; tracked source untouched.')
            return
        if current == desired:
            print(f'Already bound: {repo}')
            return
        # Write the generated file only; Hugo has already copied it from static/.
        import tempfile
        import os as _os
        fd, temp = tempfile.mkstemp(prefix='.colqy-admin-', suffix='.yml', dir=path.parent)
        try:
            with _os.fdopen(fd, 'w', encoding='utf-8') as out:
                out.write(desired)
            _os.replace(temp, path)
        finally:
            if _os.path.exists(temp):
                _os.unlink(temp)
        print(f'Bound generated Sveltia configuration to {repo}: {path}')
    except (OSError, ValueError) as exc:
        sys.exit('ERROR: ' + str(exc))


if __name__ == '__main__':
    main()
