#!/usr/bin/env python3
"""Safely point Sveltia at the user's own GitHub repository, preserving YAML formatting."""
from pathlib import Path
import argparse
import difflib
import re
import sys
try:
    import yaml
except ImportError:
    sys.exit('PyYAML required: python3 -m pip install "PyYAML>=6,<7"')

CONFIG = Path('static/admin/config.yml')
REPO = re.compile(r'^[A-Za-z0-9][A-Za-z0-9_.-]*/[A-Za-z0-9][A-Za-z0-9_.-]*$')


def configure(raw, repository, branch):
    if not REPO.fullmatch(repository):
        raise ValueError('Expected GitHub OWNER/REPOSITORY (not a URL).')
    if not re.fullmatch(r'[A-Za-z0-9._/-]+', branch):
        raise ValueError('Invalid branch name.')
    parsed = yaml.safe_load(raw)
    if not isinstance(parsed, dict) or parsed.get('backend', {}).get('name') != 'github':
        raise ValueError('This helper only supports the GitHub backend.')
    if 'repo' not in parsed['backend'] or 'branch' not in parsed['backend']:
        raise ValueError('Missing backend.repo or backend.branch.')
    match = re.search(r'(?m)^backend:\s*$', raw)
    end = re.search(r'(?m)^[A-Za-z_][A-Za-z0-9_-]*:\s*', raw[match.end():]) if match else None
    if not match:
        raise ValueError('Missing backend YAML block.')
    stop = match.end() + end.start() if end else len(raw)
    block = raw[match.start():stop]
    def replace(key, value, text):
        pattern = re.compile(r'(?m)^(\s{2}' + key + r':\s*)([^\n#]*)(\s*(?:#.*)?)$')
        if len(pattern.findall(text)) != 1:
            raise ValueError(f'Unexpected backend.{key} formatting; edit manually.')
        return pattern.sub(lambda m: m.group(1) + value + m.group(3), text, count=1)
    updated = replace('branch', branch, replace('repo', repository, block))
    result = raw[:match.start()] + updated + raw[stop:]
    new = yaml.safe_load(result)
    if new['backend']['repo'] != repository or new['backend']['branch'] != branch:
        raise ValueError('Backend configuration did not validate.')
    for k in ('repo', 'branch'):
        new['backend'][k] = parsed['backend'][k]
    if new != parsed:
        raise ValueError('Unexpected configuration changes outside backend ownership.')
    return result


def main():
    p = argparse.ArgumentParser(description='Configure your own GitHub repository for Sveltia.')
    p.add_argument('--repo', required=True, help='GitHub OWNER/REPOSITORY')
    p.add_argument('--branch', default='main')
    mode = p.add_mutually_exclusive_group(required=True)
    mode.add_argument('--dry-run', action='store_true')
    mode.add_argument('--apply', action='store_true')
    args = p.parse_args()
    try:
        old = CONFIG.read_text(encoding='utf-8')
        new = configure(old, args.repo, args.branch)
    except (OSError, ValueError, yaml.YAMLError) as exc:
        sys.exit('CMS repository setup stopped: ' + str(exc))
    if old == new:
        print('CMS already points to', args.repo, args.branch)
    elif args.dry_run:
        print(''.join(difflib.unified_diff(old.splitlines(True), new.splitlines(True), fromfile=str(CONFIG), tofile=str(CONFIG)+' (new)')))
        print('Dry run only. No files changed.')
    else:
        CONFIG.write_text(new, encoding='utf-8')
        print('Updated Sveltia backend to', args.repo, 'branch', args.branch)
        print('No authentication token has been created or stored.')


if __name__ == '__main__':
    main()
