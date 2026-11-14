# Architecture decision — Content block interface

The canonical source remains `content/sources/<slug>/index.md` with YAML front matter and associated page-bundle resources.

Optional shortcodes render media-rich compositions directly from that document. The CMS, when added, is a file editor, not the source of truth. Collections and views reference the same content and are not duplicated.

The functional CSS for reusable blocks is intentionally isolated in `themes/academic-default/static/css/blocks.css`. The distributed product's final default visual skin is a **separate later design milestone**, distinct from the author's personal portfolio.

The site remains static, without any requirement for Cloudflare credentials, external media services, or JavaScript to render these content blocks.
