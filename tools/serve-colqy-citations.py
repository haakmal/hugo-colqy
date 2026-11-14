#!/usr/bin/env python3
"""Run Hugo's development server with automatic Colqy citation-cache updates.

A6.3r.7e: stdlib-only development tool; never modifies Markdown or CSL library.
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path
import shutil
import signal
import subprocess
import sys
import time


def source_files(root: Path) -> list[Path]:
    candidates = list((root / 'content').rglob('*.md'))
    candidates += [root / 'data/references.json', root / 'data/citation-settings.yaml']
    candidates += list((root / 'assets/csl').glob('*.csl'))
    candidates += [root / 'tools/build-citations-a6-3r3.py']
    return sorted(p for p in candidates if p.is_file())


def signature(root: Path) -> tuple[tuple[str, int, int, int], ...]:
    """Capture file existence, size and nanosecond modification/change times."""
    items = []
    for path in source_files(root):
        try:
            stat = path.stat()
            items.append((path.relative_to(root).as_posix(), stat.st_mtime_ns, stat.st_ctime_ns, stat.st_size))
        except FileNotFoundError:
            continue  # Atomic editor writes can briefly replace files.
    return tuple(items)


def generate(root: Path, pandoc: str) -> bool:
    cmd = [sys.executable, str(root / 'tools/build-citations-a6-3r3.py'), '--apply', '--pandoc', pandoc]
    print('COLQY citations: processing content and references...', flush=True)
    try:
        proc = subprocess.run(cmd, cwd=root, check=False)
    except OSError as exc:
        print(f'COLQY citation error: {exc}', file=sys.stderr, flush=True)
        return False
    if proc.returncode:
        print('COLQY citation error: generation failed; existing cache preserved. '
              'Fix the error above and save again to retry.', file=sys.stderr, flush=True)
        return False
    print('COLQY citations: cache updated. Hugo will rebuild.', flush=True)
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description='Hugo server with automatic Pandoc citation regeneration')
    parser.add_argument('--hugo', default='hugo', help='Hugo executable')
    parser.add_argument('--pandoc', default='pandoc', help='Pandoc executable')
    parser.add_argument('--theme', default='colqy-spatial')
    parser.add_argument('--port', type=int, default=1313)
    parser.add_argument('--bind', default='127.0.0.1')
    parser.add_argument('--no-drafts', action='store_true', help='Hide draft demonstrations')
    parser.add_argument('--interval', type=float, default=0.5, help='Polling interval in seconds')
    parser.add_argument('--debounce', type=float, default=0.7, help='Quiet period after edits in seconds')
    parser.add_argument('--preflight', action='store_true', help='Validate prerequisites without running Hugo')
    args = parser.parse_args()
    root = Path.cwd()
    if args.interval < 0.1 or args.debounce < 0:
        parser.error('interval must be >= 0.1 seconds; debounce must be >= 0')
    if not (root / 'tools/build-citations-a6-3r3.py').is_file():
        parser.error('Run from the Colqy repository root; citation generator missing')
    if not (root / 'data/references.json').is_file():
        parser.error('Missing data/references.json')
    if not (root / 'themes' / args.theme).is_dir():
        parser.error(f'Missing theme: {args.theme}')
    hugo = shutil.which(args.hugo)
    pandoc = shutil.which(args.pandoc)
    if not hugo or not pandoc:
        parser.error('Hugo and Pandoc must be installed and available on PATH (or pass --hugo/--pandoc)')
    if args.preflight:
        print(f'Colqy prerequisites OK: Hugo={hugo}; Pandoc={pandoc}')
        return 0

    # Establish the baseline BEFORE generating. Edits made during initial
    # processing/startup must not disappear into a later snapshot.
    last = signature(root)
    # Fail closed at startup rather than displaying old citations as if current.
    if not generate(root, pandoc):
        return 1
    command = [hugo, 'server', '--theme', args.theme, '--port', str(args.port), '--bind', args.bind]
    if not args.no_drafts:
        command.append('--buildDrafts')
    print('COLQY starting Hugo:', ' '.join(command), flush=True)
    try:
        server = subprocess.Popen(command, cwd=root)
    except OSError as exc:
        print(f'Unable to start Hugo: {exc}', file=sys.stderr)
        return 1

    print("COLQY watcher: ready", flush=True)
    pending = None
    stop_requested = False
    def stop_on_term(signum, frame):
        nonlocal stop_requested
        stop_requested = True
    signal.signal(signal.SIGTERM, stop_on_term)
    try:
        while server.poll() is None and not stop_requested:
            time.sleep(args.interval)
            now = signature(root)
            if now != last:
                last = now
                pending = time.monotonic()
            if pending is not None and time.monotonic() - pending >= args.debounce:
                pending = None
                # Recheck after generating: changes made during processing need another pass.
                before = signature(root)
                generate(root, pandoc)
                after = signature(root)
                if after != before:
                    last = after
                    pending = time.monotonic()
    except KeyboardInterrupt:
        print('\nCOLQY stopping Hugo...', flush=True)
    finally:
        if server.poll() is None:
            server.terminate()
            try:
                server.wait(timeout=8)
            except subprocess.TimeoutExpired:
                server.kill()
                server.wait()
    return 0 if server.returncode in (0, -signal.SIGTERM) else server.returncode


if __name__ == '__main__':
    sys.exit(main())
