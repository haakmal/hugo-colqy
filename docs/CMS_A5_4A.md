# Colqy — A5.4a Content editor

## Scope
Only the `sources` collection's field order, labels and hints are changed.
The uploaded `config.yml` is the baseline. All field names, widgets,
defaults, media components, statuses, collections, tags, book editing,
Indexes and backend settings are preserved.

## Field order
1. Title
2. Content type
3. Page address (visible, optional)
4. Summary
5. Markdown content
6. Collections
7. Tags
8. Draft
9. Statuses
10. Publication date
11. Featured
12. Exclude from automatic listings
13. Advanced layout override
14. Advanced sort weight

This checkpoint does **not** create fake collapsible sections or alter YAML
nesting. A5.4b will examine Sveltia's native List/Object containers.

## Apply
From `colqy/`:

```sh
git status --short
unzip -o ~/Downloads/colqy_increment-A5.4a.zip -d .
python3 tools/apply-increment-a5-4a.py --dry-run
python3 tools/apply-increment-a5-4a.py --apply
hugo server -D
```

If the script reports a field inventory mismatch, stop: your CMS configuration
has changed since the uploaded file. Do not overwrite it with a sample.

## Acceptance
- Content editor shows Title, Content type, Page address, Summary and Body first.
- Page address is optional and supports `/about/`.
- Collections, Tags and Draft follow the body.
- Statuses, Date, Featured and technical properties remain editable.
- Existing Content entries reopen and save with unchanged metadata.
- Book, Chapter, Index and Site Settings editors remain unaffected.
- `hugo --minify` and `git diff --check` pass.

## Commit
```sh
git add static/admin/config.yml tools/apply-increment-a5-4a.py docs/CMS_A5_4A.md INCREMENT-A5.4a.md
git commit -m "refactor: simplify Content editor field hierarchy (A5.4a)"
git push origin main
```

## Troubleshooting
- Old editor still shown: refresh Sveltia in Local Repository mode.
- Page URL unexpectedly changes: inspect the `url` front-matter field.
- CMS configuration error: run YAML validation, and share the exact message.
- Push rejected: `git fetch origin`; compare `HEAD...origin/main` before rebasing.
- Rebase already active: resolve unmerged files before another pull.
