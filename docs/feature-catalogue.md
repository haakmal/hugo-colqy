# Feature catalogue and demonstration map

The fictional Mira Vale site is a working academic publishing scenario, not a list of disconnected widgets. Each entry should demonstrate a meaningful authoring use case and also act as a regression test.

| Capability | Mira Vale example | Editorial test |
|---|---|---|
| Root-level homepage | `/` | Site identity, authored homepage, featured material and navigation. |
| Academic profile | `/about/` | Page URL override, supporting content, utility-page exclusion. |
| Creative projects | Field Atlas and Material Protocols | Project metadata, figures, galleries, split image/text, local media and external embeds. |
| Research article | Designing with Situated Evidence | CSL citation keys, bibliography, native footnotes and dated writing. |
| Long-form Book | Mapping Relations | Book overview, two Chapters, hierarchical TOC and Previous/Next. |
| Journal/blog | `/journal/` | Timeline of dated Articles/Pages, including an undated entry. |
| Research catalogue | `/research/` | List presentation and mixed content types. |
| Practice portfolio | `/practice/` | Grid presentation and optional thumbnails. |
| Markdown reference | `/markdown/` | H1–H6, emphasis, links, nested lists, tasks, quotes, tables, code, images, footnotes, citations, media shortcodes. |
| References | Sveltia → References | BibTeX paste, manual entry, duplicate handling and citation picker. |
| Statuses and announcements | Site data and source statuses | Neutral, positive, caution and critical treatments. |
| Draft regression fixtures | `demo-fixtures/` and draft content | Edge cases without adding noise to public navigation. |

## Supported Markdown and media

The public reference page demonstrates supported syntax and shortcodes; the [Content guide](content-guide.md) documents their parameters. Unsupported or unverified extensions (raw HTML, Mermaid, arbitrary JavaScript and general mathematical rendering) should not be advertised as built-in capabilities.

## Release acceptance matrix

Test every source type, List/Grid/Timeline, automatic/hand-picked Index selection, local and global statuses, citation rendering, Sveltia local and GitHub saves, responsive Left/Right regions, Book TOC, image lightbox and both CMS colour schemes. A feature is not considered release-ready merely because a YAML or unit test passes.
