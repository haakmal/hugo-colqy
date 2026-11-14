# Books and Chapters

Colqy supports long-form publications through Hugo branch bundles.

## Create a Book

Use Sveltia **Books** to create an overview. The source lives at `content/sources/BOOK-SLUG/_index.md`. Supply a title, optional description, collections, tags, date and optional PDF attachment. The Book overview is always a navigation destination.

## Add Chapters

Use **Book Chapters**, select the parent Book and set the order (weight). Chapters are stored under the Book directory and use a page bundle with `index.md`. Example:

```text
content/sources/mapping-relations/
  _index.md
  chapter-one/index.md
  chapter-two/index.md
```

The Book's Right region contains a hierarchical table of contents: Book overview, ordered Chapters and headings from the current Chapter. Previous/Next navigation appears in the Right region on desktop and after the chapter on mobile. Internal Markdown headings should form a meaningful hierarchy.

## Formatting and editorial settings

Book and Chapter eyebrow visibility and the `BOOK / CONTENTS` label have independent theme controls. Hiding the label does not remove the TOC. Book navigation is distinct from Index List/Grid/Timeline presentation. Chapters can include ordinary Markdown, figures and explanatory footnotes.

## Test

Open the Mira Vale *Mapping Relations* Book, follow its chapters, test heading links and Previous/Next navigation, and repeat on mobile. The public demo should not require a manually authored TOC list for each chapter.
