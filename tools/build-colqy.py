#!/usr/bin/env python3
"""Stable public entrypoint for the host-independent Colqy publishing pipeline.

The versioned builder remains the tested implementation until the public
release cleanup consolidates historical tools. CLI options pass through.
"""
from pathlib import Path
import runpy
import sys

script = Path(__file__).with_name('build-colqy-a6-3r6.py')
if not script.is_file():
    sys.exit('Colqy build entrypoint missing: tools/build-colqy-a6-3r6.py')
runpy.run_path(str(script), run_name='__main__')
