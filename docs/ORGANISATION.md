# Organisation — Increment 09B

Colqy keeps one canonical Markdown source for each item. Collections and tags remain arrays of stable identifiers in front matter:

```yaml
collections: [research, selected-work]
tags: [methods, systems]
```

## Registries

`data/organisation/collections/<id>.yaml` defines a collection's ID, display name, description and default view (`index` or `grid`). `order` is reserved for a future ordering feature.

`data/organisation/tags/<id>.yaml` defines a tag's ID, display name and optional description.

These files define terms, not copies of source content. Hugo's taxonomy is still authoritative for membership. Unused collection definitions do not generate empty collection pages.

## Sveltia

The Sources editor uses searchable Relation fields for collections and tags. Tags can be created during editing; the CMS saves the new tag and source together. Organisation has separate Collections and Tags management sections.

Sveltia currently also allows creating new collections from a Relation field. It does not expose a separate per-field setting to suppress that Add action while retaining creation in the target collection. Prefer creating curated collections through Organisation.

Display names can change without changing source references. Avoid renaming identifiers once published.

## Validation

Run:

```sh
python3 tools/apply-increment-09b.py
python3 tools/validate-organisation.py
hugo --minify
```

The setup script registers the terms already present in your own source documents. It is idempotent and does not modify canonical source Markdown or GitHub credentials.

Unsupported complex YAML arrays require manual review. The CMS may commit remotely; synchronise local Git before verifying changes.
