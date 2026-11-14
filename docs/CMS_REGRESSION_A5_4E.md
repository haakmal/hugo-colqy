# Colqy — A5.4e CMS regression protocol

Use **Sveltia Work with Local Repository** in Chromium and `hugo server -D`. Test on disposable entries and inspect changes before committing.

## Content
- [ ] Create Page, Project and Article; verify the controlled content-type selector.
- [ ] Edit title, summary, Markdown, Collections and Tags; save and reopen.
- [ ] Set a root-level Page address such as `/teaching/`.
- [ ] Test Draft and Exclude from automatic listings.

## Books
- [ ] Create a Book and two nested Chapters.
- [ ] Confirm chapter paths are `<book>/<chapter>/index.md`.
- [ ] Test chapter order, table of contents and previous/next navigation.
- [ ] Verify Book tags and grouped Chapter listings.

## Indexes
- [ ] Automatic Index with no filters includes eligible content.
- [ ] Filter by content type, Collection and Tag.
- [ ] Hand-pick multiple Sources and Books; verify selection is exclusive.
- [ ] Verify introduction, list/grid view and save/reopen.

## Media
- [ ] Figure: image, alt text, caption.
- [ ] Image + Text: left/right, Markdown content.
- [ ] Gallery: several images, reorder, preview, alt text and captions.

## Statuses and Site
- [ ] Two local statuses on one source.
- [ ] Reusable status referenced from two sources and updated centrally.
- [ ] Global announcement displayed and removed.
- [ ] Homepage and Navigation edited through Site Settings.
- [ ] Collections, Tags and reusable status registries remain editable.

## Completion
Run `python3 tools/audit-cms-a5-4e.py`, `hugo --minify` and `git diff --check`.
Classify findings as **Blocking**, **Usability** or **Accepted Sveltia limitation**. Do not close A5 while core publishing tests fail.
