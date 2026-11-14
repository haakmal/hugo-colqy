# Books and ordered chapters — Increment 04

## Purpose

A **book** is an ordered, hierarchical source. It is not a regular collection: chapters belong to one book and have an intended reading sequence. Typical uses include theses, open textbooks, field journals and long-form documentation.

The canonical source is a directory in `content/sources/` with `_index.md` as its entry point. This is a Hugo *branch bundle*. Chapters are ordinary Markdown documents immediately inside it.

```text
content/sources/my-book/
  _index.md
  01-introduction.md
  02-background.md
  03-conclusion.md
  complete.pdf          # optional; authors supply this file
```

## Create a book

1. Copy `content/sources/example-thesis/` to a new folder.
2. Replace metadata and text in `_index.md`. Keep `layout: book`.
3. Set `url: /work/my-book/` for a predictable public URL (book sections are not affected by the source-page permalink rule).
4. Add chapter Markdown files with `layout: chapter`, `book_chapter: true`, and an ascending numeric `weight`. Give each chapter a unique `url` such as `/work/my-book/introduction/`.
5. Run `hugo server -D` and check the contents list and previous/next links.

Keep book chapter content under one canonical folder. Do not separately publish copies as articles. The book appears as one top-level Work entry because the index selects immediate children of `content/sources/`.

## Optional PDF attachment

Add a PDF such as `complete.pdf` alongside `_index.md`, then add this field to the book's front matter:

```yaml
pdf: "complete.pdf"
```

The book template will expose a download link **only if the named file is found**. Do not enable the field without adding the file. The repository does not include a placeholder PDF.

This feature does not generate PDFs, EPUBs or print-ready documents. A standalone thesis PDF can also be linked from an ordinary Page without using the Book structure.

## Book metadata and indexing

A book is a Hugo section page, not a regular page. It can have `collections`, `tags`, `featured` and `kind` in its front matter. Its chapters should generally **not** repeat the book's collection tags: otherwise those chapter pages may appear as independent entries in taxonomy views.

Avoid reusing book URLs, because Hugo requires unique output paths. The folder names under `content/sources/` are canonical storage locations, while explicit `url` fields are the public reading paths.

## Current limits

- One level of chapters (no nested parts or subchapters in this increment).
- Ordering by `weight`, not filename.
- No transclusion of articles into chapters; link to canonical articles instead.
- Single-author Markdown editing for now; browser CMS integration is planned for Increment 05.
- Optional externally prepared PDF files, not automatic document compilation.

## Theme compatibility contract

A compatible Colqy theme must render book landing pages (`layout: book`), chapter pages (`layout: chapter`) and ordered chapter links. Presentation and motion can change without altering canonical chapter files.
