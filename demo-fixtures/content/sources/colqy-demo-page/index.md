---
draft: true
tags:
- methods
- systems
collections:
- research
title: Colqy Demo / Page
description: Markdown and spatial presentation test page.
content_type: page
date: '2026-02-10'
url: /colqy-demo/page/
utility_page: true
thumbnail: study-a.svg
statuses:
- mode: local
  heading: Demo status
  value: Available
  note: Positive state example.
  appearance: positive
supporting_content: '## Supporting notes


  This is a **secondary Markdown** region.


  - A supporting list

  - A contextual link to [the project](/colqy-demo/project/)'
---

This is a draft test of the **Page** content type, with *emphasis*, [links](https://example.org), `inline code`, and a manually overridden root-level URL.

## Text hierarchy

### A third-level heading

A paragraph with a [footnote](#fn-demo-page) and a native Markdown footnote.[^demo-page]

> Blockquotes should remain distinct from ordinary body copy.

1. Ordered item
2. Another item
   - Nested unordered item
   - Second nested item

| Element | Expected behaviour |
|:--|:--|
| Table | Horizontal overflow on narrow screens |
| Link | Keyboard focus |
| Footnote | Link and return navigation |

```text
CODE BLOCK: long lines should scroll, not clip.
```

## Figure

{{< figure src="study-a.svg" alt="Grid diagram with a circular element" caption="An original diagram for figure testing." width="wide" >}}

## Image and text

{{< split src="study-b.svg" alt="Three black geometric forms" side="right" caption="Right-aligned image composition." >}}
### A text block alongside an image

The **image sits to the right on desktop**, and stacks in the reading sequence on mobile.

- This content supports Markdown.
- The shortcode remains in the primary region.
{{< /split >}}

## Gallery

{{< gallery columns="2" label="Abstract spatial studies" >}}
{{< gallery-item src="study-a.svg" alt="A geometric grid and circle" caption="Study one" >}}
{{< gallery-item src="study-b.svg" alt="Three geometric forms" caption="Study two" >}}
{{< /gallery >}}

[^demo-page]: This footnote tests standard Markdown footnote rendering. A full CSL citation processor is not yet implemented.
