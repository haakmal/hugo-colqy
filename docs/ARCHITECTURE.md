# Architecture and content contract (draft v0.2)

## Pipeline

Editor or direct file edit -> GitHub repository -> Hugo build -> static HTML/CSS/JS -> Cloudflare Pages (or another static host).

A CMS is a **file editing interface**, not an always-running backend. The repository remains the canonical source of truth.

## Canonical sources

All publishable works live below `content/sources/<slug>/index.md` as Hugo leaf bundles. Files such as images may live alongside the Markdown in that bundle. This intentionally retains Hugo's native page/resource handling rather than building a custom parser.

Example:

```text
content/sources/an-example/
  index.md
  figure-01.jpg
```

Current front matter fields:

| Field | Meaning | Required |
| --- | --- | --- |
| `title` | Human-facing document title | yes |
| `date` | Published date | recommended |
| `description` | Summary used in index and metadata | recommended |
| `kind` | Semantic classification, freely chosen | optional |
| `collections` | Names of groups to which the source belongs | optional |
| `tags` | Descriptive taxonomy terms | optional |
| `featured` | Whether the homepage lists the item | optional |
| `weight` | Manual sort weight for index | optional |
| `draft` | Hugo draft state | optional |

The `kind` field is intentionally **not** Hugo's reserved `type`. This keeps storage semantics separate from an author's classification.

## Public URLs

The canonical files are in `/sources/` but default URLs are `/work/<slug>/`, using Hugo page permalinks. `/sources/` is the index. Do not include the storage directory name in public-facing links by hand; always use `.RelPermalink` in templates.

## Planned book model

Books are composites, not copies of existing documents. We will test native Hugo branch bundles containing ordered chapters, then confirm whether one unified `sources` structure can represent them without brittle custom routing.

## Collections versus sections

`content/sources` is the physical Hugo section. `collections` is a metadata field and taxonomy. Increment 02 exposes Hugo-generated collection term pages and one shared source-results partial for both list and grid views. A source keeps a single location. Curated manual ordering is intentionally deferred.

## Theme interface

The theme may read standard Hugo Page properties and the documented front matter fields. Theme code must not assume any fixed `kind`, mandatory gallery, academic discipline or number of collections.

Default theme lives in `themes/academic-default/`. No external Git submodule. A fork can edit it directly or replace it with another theme that understands this contract.

## CMS strategy

Defer CMS until content fields, books and views are validated. Configure the CMS to edit existing front matter and Markdown, avoiding parallel copies or CMS-only canonical data.

## Increment 02 deployment boundary

Each fork owner provisions their own hosting account, repository, custom domain (if desired), and later optional credentials. Cloudflare Pages is a suggested reference deployment, never a core dependency. See `docs/DEPLOYMENT.md` and `docs/CONTENT_MODEL.md`.

## Open decisions

- Books: source bundle structure and chapter ordering.
- Collections: taxonomy-driven and manually curated ordering.
- Structured content blocks: stable schema and shortcode strategy.
- CMS authentication and media storage choices.
- Exact location of status controls and external integrations.
