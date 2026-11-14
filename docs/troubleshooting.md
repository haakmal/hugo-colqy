# Troubleshooting

| Symptom | Check |
|---|---|
| Sveltia cannot save / 403 | `backend.repo`, `backend.branch`, account write access and token/OAuth permissions. The original Colqy repo is not your editing account. |
| Sveltia opens but entries are missing | Collection paths, branch, front matter, filters and browser console. |
| `[@key]` appears as literal Markdown | Confirm key exists in `data/references.json`, then use the citation-aware server or rebuild with Pandoc. |
| Old bibliography persists | Regenerate citation cache and reference index; inspect build logs for failed citeproc. |
| New BibTeX references missing from picker | Save the library, refresh index, then reload after deployment if in GitHub mode. |
| GitHub Pages returns 404 or assets break | Verify Actions deployment, project subpath and final `--base-url`. |
| Actions validation passes but publishing is skipped | Check repository variable `COLQY_PUBLISH=true` and Pages configured for GitHub Actions. |
| Hugo build fails on a shortcode | Check shortcode name and required parameters; `embed` needs HTTPS and title. |
| Book TOC misses a chapter | Confirm parent Book, Chapter location, `book_chapter` metadata and ordering weight. |
| Index omits entries | Verify selection mode, content type, collection/tag filters, draft state and utility exclusion. |
| Sveltia dark mode labels disappear | Confirm current custom admin styles are loaded; clear cache and inspect browser console. |
| Git push rejected after CMS edits | Fetch remote changes, inspect divergence, merge/rebase with care and rerun checks; do not force-push. |

## Useful checks

```sh
python3 tools/build-colqy.py --preflight
python3 tools/build-colqy.py --check
python3 tools/sync-reference-index-a6-3r2.py --check
hugo --theme colqy-spatial --minify
git status --short
git diff --check
```

A plain Hugo build does not refresh citations. For authoritative publication output, use the citation-aware build.
