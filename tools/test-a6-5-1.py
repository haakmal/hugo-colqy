#!/usr/bin/env python3
"""Read-only regression checks for Colqy A6.5.1 repository binding."""
from pathlib import Path
import os
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
BINDER = ROOT / 'tools/bind-cms-repository.py'
CONFIG = ROOT / 'static/admin/config.yml'
WORKFLOW = ROOT / '.github/workflows/colqy-pages.yml'


class BindingTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.site = Path(self.tmp.name) / 'public'
        (self.site / 'admin').mkdir(parents=True)
        self.target = self.site / 'admin/config.yml'
        self.target.write_text(CONFIG.read_text(encoding='utf-8'), encoding='utf-8')
        self.source_before = CONFIG.read_bytes()

    def run_bind(self, *arguments, github=None, colqy=None):
        env = os.environ.copy()
        env.pop('GITHUB_REPOSITORY', None)
        env.pop('COLQY_REPOSITORY', None)
        if github:
            env['GITHUB_REPOSITORY'] = github
        if colqy:
            env['COLQY_REPOSITORY'] = colqy
        return subprocess.run([sys.executable, str(BINDER), '--site', str(self.site), *arguments],
                              cwd=ROOT, env=env, capture_output=True, text=True)

    def test_fork_auto_binding_and_idempotence(self):
        run = self.run_bind('--apply', github='academic/my-site')
        self.assertEqual(run.returncode, 0, run.stderr)
        self.assertIn('repo: academic/my-site', self.target.read_text())
        self.assertEqual(self.run_bind('--check', github='academic/my-site').returncode, 0)
        previous = self.target.read_bytes()
        self.assertEqual(self.run_bind('--apply', github='academic/my-site').returncode, 0)
        self.assertEqual(self.target.read_bytes(), previous)
        self.assertEqual(CONFIG.read_bytes(), self.source_before)

    def test_public_and_alternative_host(self):
        self.assertEqual(self.run_bind('--apply', github='haakmal/hugo-colqy').returncode, 0)
        self.assertEqual(self.run_bind('--apply', '--repo', 'designer/portfolio').returncode, 0)
        self.assertIn('repo: designer/portfolio', self.target.read_text())
        self.assertEqual(self.run_bind('--check', colqy='designer/portfolio').returncode, 0)
        self.assertEqual(CONFIG.read_bytes(), self.source_before)

    def test_refuses_mismatch_and_placeholder(self):
        initial = self.target.read_bytes()
        self.assertNotEqual(self.run_bind('--apply', '--repo', 'haakmal/hugo-colqy', github='academic/my-site').returncode, 0)
        self.assertNotEqual(self.run_bind('--apply', '--repo', 'YOUR_ACCOUNT/YOUR_REPOSITORY').returncode, 0)
        self.assertNotEqual(self.run_bind('--check', github='academic/my-site').returncode, 0)
        self.assertEqual(self.target.read_bytes(), initial)

    def test_never_writes_source(self):
        self.assertNotEqual(self.run_bind('--apply', '--repo', 'academic/my-site', '--site', 'static').returncode, 0)
        self.assertEqual(CONFIG.read_bytes(), self.source_before)

    def test_workflow_orders_binding_after_build_before_upload(self):
        workflow = WORKFLOW.read_text(encoding='utf-8')
        self.assertLess(workflow.index('python3 tools/build-colqy.py --build'),
                        workflow.index('python3 tools/bind-cms-repository.py --site public --apply'))
        self.assertLess(workflow.index('python3 tools/bind-cms-repository.py --site public --check'),
                        workflow.index('actions/upload-pages-artifact@v4'))
        self.assertIn("vars.COLQY_PUBLISH == 'true'", workflow)


if __name__ == '__main__':
    unittest.main(verbosity=2)
