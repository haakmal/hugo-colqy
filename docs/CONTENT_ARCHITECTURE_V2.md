# Colqy — Content Architecture v2

This is the target contract, not an instruction to rewrite existing content.

## Canonical sources

- Page, Project, Article: `content/sources/<slug>/index.md`.
- Book overview: `content/sources/<book>/_index.md` (Hugo branch bundle).
- Book chapter: `content/sources/<book>/<chapter>/index.md` (leaf bundle).
- Index: proposed `content/indexes/<slug>/index.md`; an editorial landing page and query of existing sources, not duplicated copies.

`kind` is editorial classification; `layout` controls Hugo presentation.
Shared fields include title, summary, body, metadata, optional statuses and advanced overrides.
Keep existing URLs and media paths during migration.

## Index versus Collection

Collections and tags describe taxonomy membership and remain registered by the existing 09B system.
Indexes are authored landing pages, optionally containing Markdown and media, with:
automatic (all of one content type), filtered (by collection/tag), or curated (ordered references) selection.
Presentation can be list, grid or gallery, independently of content type.

## Statuses

Move from fixed operational categories to modular status assignments:
`heading`, `value`, optional `note`, optional `appearance`.
Support local statuses on any page, reusable shared statuses, and global site announcements.
A global sabbatical notice is an example; mentorship and supervision on the About page are separate local statuses.
`draft` remains a Hugo publishing control, not an editorial status.
Retain `data/site-status.yaml` and `status_key` until compatible migration is tested.

## Migration safeguards

Do not replace existing CMS `config.yml`: preserve GitHub backend, media settings, custom components and organisation registries.
Do not change the three existing flat chapters or their public URLs until the dedicated book-migration patch.
Test Sveltia in Local Repository mode; confirm Hugo rendering; commit only after verification.
