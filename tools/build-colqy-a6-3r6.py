#!/usr/bin/env python3
"""Colqy A6.3r.6: citation-aware static build entry point.

This does not change hosting settings, deployment workflows, or source Markdown.
It refreshes derived citation data before Hugo builds, and fails closed if a
required processor is unavailable.
"""
from pathlib import Path
import argparse
import os
import shutil
import subprocess
import sys


def executable(value):
    path = shutil.which(value)
    if not path:
        raise ValueError(f"Executable not found: {value}. Install it in the build environment or pass its full path.")
    return path


def run(command):
    print('RUN', ' '.join(command), flush=True)
    subprocess.run(command, check=True)


def main():
    parser = argparse.ArgumentParser(description='Refresh Colqy CSL citations before Hugo publishing')
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--build', action='store_true', help='Regenerate citations then build the site')
    mode.add_argument('--check', action='store_true', help='Check citation cache freshness without writing')
    mode.add_argument('--preflight', action='store_true', help='Verify local build prerequisites without writing')
    parser.add_argument('--pandoc', default='pandoc', help='Pandoc executable or absolute path')
    parser.add_argument('--hugo', default='hugo', help='Hugo executable or absolute path')
    parser.add_argument('--theme', default='colqy-spatial', help='Hugo theme (default: colqy-spatial)')
    parser.add_argument('--base-url', default=None, help='Hugo baseURL override; defaults to CF_PAGES_URL if set')
    parser.add_argument('--drafts', action='store_true', help='Include draft demonstration content')
    args = parser.parse_args()

    root = Path.cwd()
    generator = root / 'tools/build-citations-a6-3r3.py'
    theme = root / 'themes' / args.theme
    library = root / 'data/references.json'
    if not generator.is_file() or not theme.is_dir() or not library.is_file():
        sys.exit('Run from Colqy repository root after A6.3r.5; citation generator, theme or library missing.')

    try:
        pandoc = executable(args.pandoc)
        hugo = executable(args.hugo)
        if args.preflight:
            run([pandoc, '--version'])
            run([hugo, 'version'])
            print('Preflight passed. No content or cache files modified.')
            return
        run([sys.executable, str(generator), '--apply' if args.build else '--check', '--pandoc', pandoc])
        # The CMS citation picker reads this derived index on deployed sites.
        # Refresh it in the SAME build that processes citations; no author action required.
        indexer = root / 'tools/sync-reference-index-a6-3r2.py'
        if not indexer.is_file():
            raise ValueError('Reference index generator missing: tools/sync-reference-index-a6-3r2.py')
        index_command = [sys.executable, str(indexer)]
        if args.check:
            index_command.append('--check')
        run(index_command)
        if args.check:
            print('Citation cache current; no files modified.')
            return
        command = [hugo, '--theme', args.theme, '--minify']
        if args.drafts:
            command.append('--buildDrafts')
        base_url = args.base_url if args.base_url is not None else os.environ.get('CF_PAGES_URL', '')
        if base_url:
            if not (base_url.startswith('https://') or base_url.startswith('http://')):
                raise ValueError('base URL must begin with https:// or http://')
            command.extend(['--baseURL', base_url.rstrip('/') + '/'])
        run(command)
        print('Colqy build complete. Publish the generated public/ directory.')
    except ValueError as exc:
        sys.exit(f'Colqy build stopped: {exc}')
    except subprocess.CalledProcessError as exc:
        sys.exit(f'Colqy build stopped: command returned exit code {exc.returncode}')
    except OSError as exc:
        sys.exit(f'Colqy build stopped: {exc}')


if __name__ == '__main__':
    main()
