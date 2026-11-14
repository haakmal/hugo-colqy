# Colqy A5.1 — CMS Navigation and Discovery

This checkpoint changes only Sveltia's collection configuration. It preserves all Markdown content, Hugo templates, GitHub settings, book paths, indexes and status data.

## Editorial navigation

- Content: one canonical collection, with Pages, Articles and Projects filters and a Content type grouping.
- Books: book overviews.
- Book Chapters: chapters, grouped by their parent book field.
- Indexes: unchanged publishing functionality.
- Site - Pages: homepage and About remain until A5.2.
- Site - Collections / Tags: taxonomy registries.
- Site - Reusable statuses / Announcements: existing status editors.
- Legacy - Operational settings: retained until A5.3.

The single divider separates publishing from site configuration. Sveltia does not provide arbitrary nested sidebar groups through its native configuration. The word 'Collections' in Sveltia's own UI is unrelated to Colqy's taxonomy.

## Apply

From colqy/:

```sh
git status --short
unzip -o ~/Downloads/colqy_increment-A5.1.zip -d .
python3 tools/apply-increment-a5-1.py --dry-run
python3 tools/apply-increment-a5-1.py --apply
hugo server -D
```

Reload Sveltia in Chromium using **Work with Local Repository**.

## Test

1. Content shows all sources and offers Pages, Articles and Projects filters.
2. Changing the filter doesn't change the content's classification or file.
3. New content still uses the controlled content_type selector.
4. Book Chapters offers grouping by book; chapter creation and ordering still work.
5. Books, Indexes, tags, collections, statuses and site pages remain editable.
6. Site sections appear after the divider and legacy operational settings are clearly labelled.

## Verify and commit

```sh
hugo --minify
git diff --check
git diff -- static/admin/config.yml
git add static/admin/config.yml tools/apply-increment-a5-1.py docs/CMS_A5_1.md INCREMENT-A5.1.md
git commit -m "refactor: improve CMS navigation and discovery (A5.1)"
git push origin main
```

## Troubleshooting

- **CMS config error:** check the exact YAML error; script stops on unknown collection structure.
- **Filters not showing:** reload /admin/ after applying, and confirm the selected local repository.
- **Content missing in a filter:** inspect its content_type and return to unfiltered view.
- **Chapter grouping incomplete:** inspect the chapter's book field; do not move files to fix grouping.
- **Push rejected:** git fetch origin; inspect `git log --left-right --oneline HEAD...origin/main` before integrating.
- **Unmerged paths:** resolve an existing rebase or merge before pulling again.
