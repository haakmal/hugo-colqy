# Content: Pages, Projects and Articles

All three use Markdown stored under `content/sources/`. Use the Sveltia **Content** collection and choose a content type. A typical source is a page bundle (`content/sources/your-slug/index.md`) with images alongside it.

## Page

A flexible document for About, teaching, contact, publications or other standalone content. Primary and optional supporting content can be authored independently. A root-level `url: /about/` is supported; `utility_page: true` keeps it out of automatic listings.

## Project

A creative-practice entry. Use figures, galleries, image/text splits, audio or video to document work. The Right region can carry context, methods, credits or supplementary information. A Grid Index can use the optional `thumbnail` field.

## Article

A dated or undated scholarly text. The primary Markdown field accepts Pandoc-style citations such as `[@colqyVale2025]`; the bibliography is generated into the Right region by the citation-aware build. Native Markdown footnotes are separate from bibliographic references. The Right region is not an ordinary Article Markdown editor.

## Front matter example

```yaml
---
title: A field observation
content_type: article
description: A short abstract or index summary.
date: 2026-10-02
collections: [research]
tags: [methods]
draft: true
---
```

Use CMS controls to set fields wherever possible; the YAML is shown for portability. Dates, collections and tags are optional. Avoid inventing custom `content_type` values without extending the theme.

## Markdown coverage

Colqy uses Hugo Goldmark. The public Markdown reference page at `/markdown/` demonstrates headings H1–H6, emphasis, links, nested lists, task lists, blockquotes, tables, fenced code, inline code, Unicode, images, footnotes and citation clusters.

**Shortcodes** (put page-bundle assets next to `index.md`):

```go-html-template
{{< figure src="diagram.svg" alt="Description" caption="Caption" width="wide" >}}
{{< split src="diagram.svg" side="right" alt="Description" >}}Text alongside the image.{{< /split >}}
{{< gallery columns="2" label="Process photographs" >}}
{{< gallery-item src="image-a.jpg" alt="First photograph" caption="Study A" >}}
{{< gallery-item src="image-b.jpg" alt="Second photograph" caption="Study B" >}}
{{< /gallery >}}
{{< media kind="audio" src="recording.mp3" title="Field recording" >}}
{{< embed src="https://example.org/embedded-content" title="Descriptive title" >}}
```

Gallery columns accept 2 or 3. Image/Text `side` accepts `left` or `right`. `media` supports `audio` and `video`. `embed` requires an HTTPS URL and a descriptive title; third-party sites may prohibit embedding. All images need meaningful alternative text unless decorative. Linked images retain normal link behaviour rather than opening the lightbox.

Raw HTML, Mermaid, mathematical typesetting and arbitrary JavaScript are **not guaranteed** by the default theme. Do not assume they are enabled because standard Markdown works.

See [Appearance](appearance.md) for Left/Right behaviour and [References](references.md) for scholarly citations.
