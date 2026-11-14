# Development and testing

## Prerequisites

Python 3.12+, Hugo Extended, Pandoc with citeproc and PyYAML. `bibtexparser` is optional for the CLI importer. Use the repository's GitHub Actions workflow as the reference for CI dependencies.

## Common commands

```sh
python3 tools/build-colqy.py --preflight
python3 tools/serve-colqy-citations.py
python3 tools/build-colqy.py --check
python3 tools/build-colqy.py --build --drafts --base-url http://localhost:1313/
python3 tools/build-colqy.py --build --base-url https://example.org/
python3 tools/sync-reference-index-a6-3r2.py --check
```

Use `--drafts` only for local testing. Avoid running another Hugo server on port 1313 while the citation-aware server is active.

## Development and public repositories

The development repository contains historical increments and experimental material. The public repository is created from a validated, sanitised release export with **fresh Git history**. Do not use `git push --mirror` from the development repository to publish it. See [Release model](release-model.md).

For future versions, maintain a controlled promotion process: develop and test in the development repository, export a release candidate, run build/browser checks, review the diff against the public repository and publish a tagged version. The current exporter is not a bidirectional synchronisation tool.

## Regression testing

Use the public Mira Vale example for editorial acceptance and `demo-fixtures/` for draft regression cases. Test every source type, Markdown shortcodes, reference rendering, List/Grid/Timeline, status appearances, desktop/mobile and Sveltia light/dark modes. Do not remove fixtures just because they are absent from the public navigation.

## Git troubleshooting

- **Divergent CMS commits:** `git fetch origin`, inspect `git status` and `git log --oneline --graph --all -12`, then merge/rebase deliberately. Don't force-push.
- **Merge conflict:** resolve affected YAML/Markdown carefully, `git add` the resolved files, then continue the chosen merge/rebase; rerun Hugo and YAML validation.
- **Missing CMS entry:** check the file's path, front matter, branch, `draft` state and Sveltia collection filters.
- **Stale citations:** use the citation-aware server or rebuild before concluding the reference key is invalid.

## Clean checkout smoke test

1. Clone the public candidate into a fresh directory.
2. Install dependencies; run preflight.
3. Run a citation-aware build; inspect `public/index.html` and `public/admin/index.html`.
4. Preview locally, test CMS Local Repository mode and verify that saves update the intended folder.
5. Configure a disposable GitHub repository and test GitHub-backed CMS saves and Actions deployment separately.
