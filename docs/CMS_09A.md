# Increment 09A — Editorial workflow and composition

The public-facing site and canonical Markdown schema are unchanged. This is a CMS experience improvement, not a migration.

## Editing a source

The *Sources* editor places **Title** and **Content** first. Descriptive metadata follows, and technical fields (**Advanced · layout**, **Advanced · URL**, **Advanced · sorting**) appear last. Metadata is excluded from the preview pane so the preview gives priority to article content. These are still flat YAML front-matter keys.

**Why not collapsible Properties / Advanced panels?** Sveltia's Object widget collapses nested data, but wrapping existing flat front-matter keys would alter the canonical YAML. 09A deliberately avoids that migration. The technical fields are labelled and de-emphasised, not hidden in a fake panel.

## Image + Text

The `Image + text` shortcode now uses a nested RichText/Markdown field. Authors can use headings, paragraphs, bullets, numbered lists, quotations, bold/italic text and links in the accompanying text. The component preview renders that Markdown using Sveltia's supported `CMS.renderRichText` API. Components remain collapsible. Existing shortcode source syntax is preserved.

Nested custom components are disabled within the split's text area in this increment to avoid ambiguous shortcode nesting. Insert another Figure or Gallery in the **main** article content instead.

## What stays unchanged

- Figure and Gallery upload interfaces from Increment 08.
- Sveltia's built-in single-image insertion and media browser.
- Canonical YAML keys, book/chapter structure, tags, collections and status data.
- Backend credentials and media settings.

The native `image` toolbar/Insert entry is **not forcibly removed**: Sveltia exposes the built-in image as an editor component, and disabling it would also remove native insertion. It will be revisited in the broader Sveltia interface audit rather than hidden with brittle CSS.

## Browser checks

1. Open a source. Content should be near the top; technical settings near the bottom.
2. Insert or reopen an Image + Text block; add `**bold**`, a bulleted list, a Markdown blockquote and a link using the rich-text controls.
3. Confirm the split preview shows formatted text alongside the chosen image.
4. Save through GitHub-authenticated CMS, then reopen and verify the same formatting.
5. `git pull --rebase origin main` after first committing local patch, and run Hugo locally.
6. Existing figures, split blocks and galleries should remain intact.

## Increment 09B

Before implementing central tags and collections, map their authoring and maintenance workflow, as agreed. 09C separately evaluates books and chapters. The public default skin remains a later design phase.
