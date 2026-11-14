# Colqy — Increment A5.3: Site Settings consolidation

A5.3 merges the three **single-document CMS collections** into one Sveltia file collection called **Site Settings**. The underlying content and YAML files remain in their existing locations.

| Site Settings entry | Existing file |
|---|---|
| Homepage | `content/_index.md` |
| Navigation | `data/navigation.yaml` |
| Announcements | `data/global_statuses.yaml` |

Collections, Tags and Reusable Statuses remain independent registries because their entries can be created or deleted. Legacy Operational Settings remain visible until the remaining `status_key` references have been migrated. The separate CMS list screen is retained: selecting Site Settings shows the three documents, which can then be edited.

## Apply

In the existing `colqy/` repository, with Sveltia in **Work with Local Repository** mode:

```sh
git status --short
unzip -o ~/Downloads/colqy_increment-A5.3.zip -d .
python3 tools/apply-increment-a5-3.py --dry-run
python3 tools/apply-increment-a5-3.py --apply
python3 tools/audit-legacy-statuses-a5-3.py
hugo server -D
```

Reload `/admin/` after applying the CMS configuration.

## Acceptance tests

1. **Site Settings** appears as one sidebar entry containing Homepage, Navigation and Announcements.
2. Homepage edits still save to `content/_index.md`.
3. Navigation edits still save to `data/navigation.yaml` and update the header.
4. Announcement edits still save to `data/global_statuses.yaml` and update the footer.
5. Collections, Tags and Reusable Statuses still permit creating and editing registry entries.
6. Source and Book shared-status selectors still work.
7. Legacy Operational Settings remain available and the audit reports any `status_key` references.
8. Books, Book Chapters, Content and Indexes continue working.

## Verify and commit

```sh
hugo --minify
git diff --check
git diff -- static/admin/config.yml
git add static/admin/config.yml tools/apply-increment-a5-3.py tools/audit-legacy-statuses-a5-3.py docs/CMS_A5_3.md INCREMENT-A5.3.md
git commit -m "refactor: consolidate site settings editors (A5.3)"
git push origin main
```

## Troubleshooting

- **Site Settings absent:** reload Sveltia and confirm its Local Repository points to `colqy/`.
- **An editor is empty:** check that the underlying file exists; the patch doesn't recreate or modify data files.
- **Invalid CMS configuration:** inspect the script's preflight message and `git diff` before changing anything manually.
- **Legacy Operational Settings still visible:** intentional until all legacy references are migrated.
- **Push rejected:** `git fetch origin`, then inspect `git log --left-right --oneline HEAD...origin/main` before integrating.
- **Pull refuses due to unmerged files:** complete the existing rebase or merge first.

**Do not rerun the historical A5.1 or A5.2 installer after A5.3**; those scripts refer to the older collection names.
