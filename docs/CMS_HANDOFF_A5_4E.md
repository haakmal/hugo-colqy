# Colqy — CMS to default-theme handoff

## Architecture contract
- Hugo owns rendering; Markdown/YAML remains canonical; Sveltia is an optional editor.
- Page, Project, Article: `content/sources/<slug>/index.md`.
- Book: `content/sources/<book>/_index.md`; Chapter: `<book>/<chapter>/index.md`.
- Index: `content/indexes/<slug>/index.md`; selects existing content without duplication.
- Collections and Tags organise sources independently of their presentation.
- Local, reusable and global statuses have separate responsibilities.
- Curated navigation comes from site data; explicit Page address overrides remain supported.
- Existing Figure, Image + Text and Gallery shortcode formats remain stable.

## Default-skin requirements
Create a discipline-neutral academic publishing aesthetic, with responsive editorial layouts, accessible typography, media handling, book navigation, Index views, status placement and restrained motion. Support reduced-motion preferences and keyboard navigation. Do not couple the theme to Sveltia or require additional hosting services.

## Known CMS constraints
Sveltia's native List/Object roots may remain collapsible; some nested controls cannot be removed by configuration. Manual Index selection uses separate Source and Book pickers. Legacy Operational Settings remain until their references are migrated.

Proceed to visual design only after the audit has no blocking errors and the editorial regression tests pass.
