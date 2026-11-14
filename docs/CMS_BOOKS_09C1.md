# Colqy Increment 09C.1 — Book hierarchy correction

09C.1 corrects a confusing division between book overviews and chapters.
It does **not** introduce a custom CMS, a new content database or new public URLs.

## Apply

Commit or stash any existing work before pulling GitHub CMS changes.
From the Colqy repository root:

```sh
unzip -o ~/Downloads/colqy_increment-09C1.zip -d .
python3 tools/apply-increment-09c1.py
python3 tools/validate-book-links.py
python3 tools/validate-organisation.py
hugo --minify
```

The script changes `static/admin/config.yml` and adds a `book:` front-matter
reference to existing chapters, because the CMS needs that field to place
chapters in a chosen book. It does **not** change chapter body text, ordering,
filenames or existing URLs. Inspect `git diff` before committing.

## What editors see

- **Books · overviews:** all books, including books without chapters.
- **Books · chapters:** one chapter editor. Every chapter has a required
  **Belongs to book** picker, populated by existing book overviews.
- **Title**, **Content**, editorial metadata, then advanced options in both
  editors, consistent with the ordering adopted for Sources in 09A.

The two sections remain distinct because Sveltia does not support per-book
mixed overview/chapter schemas in this Hugo file structure. This is a
working native-CMS compromise, not a custom sidebar.

## Test an empty book (critical regression)

1. Create a book called Demo Book in Books · overviews.
2. Save. If the CMS uses the GitHub backend, the `_index.md` is committed there.
3. Create a chapter from Books · chapters. Set **Belongs to book** to Demo Book.
4. Save and confirm the new chapter is written at
   `content/sources/demo-book/<chapter>.md` — not at the content root.
5. Confirm it is visible in the chapter list and Hugo book table of contents.
6. Edit/reopen an old chapter; its parent book must already be selected.
7. Check the Title / Content-first field order in book and chapter editors.

### Local testing without touching main commits

In a **clean** secondary directory, check out the latest GitHub state with:

```sh
git fetch origin
git worktree add --detach ../colqy-test origin/main
cd ../colqy-test
unzip -o ~/Downloads/colqy_increment-09C1.zip -d .
python3 tools/apply-increment-09c1.py
hugo server -D --port 1314
```

This worktree isolates your *local* development tree; Sveltia still commits to
GitHub when configured with the production backend. Test the CMS at the URL
running the new config or push the patch to GitHub before using the hosted CMS.
To remove the worktree, first discard only its known disposable modifications.

## Quick troubleshooting

- **Demo Book missing from selector:** confirm its `_index.md` is on the same
  GitHub branch as the CMS; reload `/admin/`.
- **New chapter saved at wrong location:** inspect the `book` field value and
  verify the path follows `{{fields.book}}/{{slug}}`.
- **Old chapter has no selected book:** run the migration on up-to-date local
  files, then push migrated chapter front matter; don't hand-copy it elsewhere.
- **Push rejected:** `git fetch origin`, `git rebase origin/main`, then push.
- **Rebase conflict:** resolve the YAML/Markdown values, `git add <file>`,
  `git rebase --continue`. Do not `git rebase --skip` reflexively.
- **Hugo missing chapter:** run `hugo server -D`; inspect its `layout`,
  `book_chapter`, `book`, `weight`, and actual file path.
- **Unexpected Sveltia configuration:** stop, inspect `config.yml` changes
  and keep backend credentials intact rather than replacing the whole file.

## Commit

```sh
git diff --check
git add -A
git commit -m "fix: correct book and chapter editing (increment 09C.1)"
git fetch origin
git rebase origin/main
git push origin main
```

Do not force-push.
