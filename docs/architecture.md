# Architecture and extension contracts

Colqy separates **content**, **editorial interface**, **presentation** and **hosting**.

| Layer | Files | Responsibility |
|---|---|---|
| Content | `content/sources/`, `content/indexes/` | Markdown, page bundles, Book/Chapter structure and Index selection. |
| Site data | `data/` | Navigation, identity, statuses, theme settings and canonical CSL references. |
| CMS | `static/admin/` | Sveltia collections and custom Markdown/reference components. |
| Rendering | `themes/colqy-spatial/` | Hugo templates, CSS and client-side media behaviour. |
| Citations | `tools/build-citations-a6-3r3.py` | Pandoc/citeproc conversion and derived citation cache. |
| Publishing | `tools/build-colqy.py`, `.github/workflows/` | Host-independent build and GitHub Pages deployment. |

## Canonical vs generated data

- **Canonical:** Markdown, source front matter, site YAML and `data/references.json` (CSL JSON array).
- **Generated:** `data/citation_cache.json`, `static/admin/references-index.json`, `public/` and Hugo resource caches.
- Generated files should be refreshed by the build pipeline; don't treat them as separate author-managed bibliographies.

## Extending safely

Keep the existing `content_type` semantics (`page`, `project`, `article`, `book`, `chapter`, `index`) unless extending both CMS and theme. Preserve independent collection/tag filters, Book/Chapter relationships and source URLs. Do not make a theme change that silently hides authored data. Keep theme settings independent of Hugo and CMS configuration while exposing safe editorial controls through Sveltia.

## Hosting contract

The host needs Python, Pandoc and Hugo Extended, then runs `python3 tools/build-colqy.py --build --base-url <PUBLIC_URL>` and publishes `public/`. GitHub Pages is the default but not a content dependency. See [Hosting contract](hosting-contract.md).

## Authentication boundary

Sveltia's GitHub backend requires repository ownership/write access and a supported authentication method. Hosting a public `/admin/` page does not grant editing permissions. Never put credentials in public site data.
