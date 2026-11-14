# Colqy — Increment 09C

This patch replaces the hard-coded one-book CMS arrangement with two native
Sveltia sections. It deliberately does not change Hugo content files.

## Installation

From the Colqy repository root, after synchronising your GitHub CMS changes:

```sh
python3 tools/apply-increment-09c.py
python3 tools/validate-books.py
python3 tools/validate-organisation.py
hugo server -D
```

## Expected CMS experience

**Books · create and edit:** Create and edit any book overview at
`content/sources/<book-slug>/_index.md`. Existing book overviews continue to work.
Book front matter keeps the existing collection selector and defaults.

**Books · chapters by folder:** Browse a book's folder and use New to create
`content/sources/<book-slug>/<chapter-slug>.md`. Select the correct parent
folder before saving. The section filters to `book_chapter: true`. Its reorder
control writes Hugo's existing `weight` field.

## Limitations

Sveltia cannot natively give `_index.md` book overviews and sibling ordinary
chapter files distinct schemas within one unified collection. They therefore
appear as two clearly labelled sections, without custom UI code.

Because books and ordinary sources both reside under `content/sources/`, the
chapter folder picker may also display regular source directories. Only create
chapters in folders containing a book `_index.md`; do not use source folders
containing `index.md`.

The existing optional `chapter_number` is a display label independent from
`weight`: update it if chapter numbering changes. PDFs remain filename references
relative to their book bundle. A newly created book or chapter may receive a
Hugo default URL; set an explicit URL if a `/work/.../` URL is needed.

## Acceptance checks

1. Open the CMS and confirm both new Books sections appear.
2. Create a new book. Confirm GitHub gains `<slug>/_index.md` with `kind: book`
   and `layout: book`.
3. Open the chapter folder tree and create two chapters in the new book.
4. Reorder chapters; confirm their numeric `weight` values update.
5. Confirm the published book table of contents, pagination and PDF links.
6. Confirm the existing example book, its chapters, ordinary sources, collections,
   tags, custom media components and site configuration remain intact.
7. Run `hugo --minify` and the two validation scripts.

Authenticated Sveltia operations must be verified in your browser. Local tests
cover the migration configuration, compatibility and idempotence.

## Quick troubleshooting

- **Book not shown locally:** CMS commits to GitHub; run `git fetch origin`,
  then `git pull --ff-only origin main` when the working tree is clean.
- **Git push rejected:** `git fetch origin`, `git rebase origin/main`,
  resolve any conflicts, then `git push origin main`. Never routinely force-push.
- **Rebase conflict:** edit conflicted file, preserve intended CMS data, remove
  conflict markers, `git add <file>`, `git rebase --continue`.
- **Chapter missing:** check correct folder, `book_chapter: true`, and
  `layout: chapter`; run `hugo server -D` to include drafts.
- **Chapters out of order:** check for missing or duplicated `weight` values;
  run `python3 tools/validate-books.py`.
- **Patch refuses to run:** check the collection names in
  `static/admin/config.yml`; do not overwrite your CMS credentials with a sample.
- **Rollback:** before committing, use `git restore static/admin/config.yml`
  to restore the pre-patch CMS configuration.

## Commit

```sh
git diff --check
git add -A
git commit -m "feat: add dynamic books and chapter navigation (increment 09C)"
git fetch origin
git rebase origin/main
git push origin main
```
