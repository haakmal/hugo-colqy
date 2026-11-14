# Scholarly references and citations

Colqy stores one canonical bibliography at `data/references.json`, a CSL JSON **array**. The site does not maintain separate bibliographies per Article. Citations are written as portable Markdown keys and processed by Pandoc's citeproc.

## Import references in Sveltia

1. Open **References → Reference library** in Sveltia.
2. Paste BibTeX exported from Zotero or another reference manager, or add a reference manually.
3. Review parsed records and duplicate-key warnings. Existing keys are skipped rather than merged or silently renamed.
4. Confirm the import and use Sveltia's **Save** operation. A successful save updates the canonical library.
5. Open an Article's **Primary content** editor, choose **Insert → Citation**, search the library and insert one or more keys.

Example:

```markdown
Situated evidence informs design practice [@colqyVale2025].
Two studies can be cited together [@colqyVale2025; @colqyElian2024].
```

The keys must exist in `data/references.json`. Footnotes use Markdown's `[^note]` syntax and are separate from bibliographic citations.

## Rendering and styles

The citation-aware build regenerates `data/citation_cache.json`, synchronises the browser-searchable `static/admin/references-index.json`, and builds Hugo. The formatted bibliography appears in the Article's Right region. Citation styles are controlled by `data/citation-settings.yaml`: the default uses Pandoc's built-in style; a custom CSL file can be placed under `assets/csl/` and selected in that configuration.

Use the **citation-aware** server locally:

```sh
python3 tools/serve-colqy-citations.py
```

A plain `hugo server` does not itself rerun Pandoc after Markdown or reference changes and may display raw `[@key]` text. For production use `python3 tools/build-colqy.py --build`; GitHub Actions uses this same entrypoint.

## CLI importer (optional)

```sh
python3 -m pip install -r tools/requirements-references.txt
python3 tools/import-bibtex-a6-3r.py --file examples/references/sample.bib
python3 tools/import-bibtex-a6-3r.py --file examples/references/sample.bib --apply
```

The CLI importer is a developer alternative, **not required for ordinary Sveltia authors**. Direct JSON edits require refreshing the index with `python3 tools/sync-reference-index-a6-3r2.py` or running the citation-aware build.

## Cautions

- Changing a citation key can break citations in other Articles and Chapters.
- Sveltia's GitHub-backed reference picker may briefly show an older published index until the new deployment completes; test after saving.
- The rich-text editor offers the custom citation picker; plain Markdown remains editable directly.
- A failed citeproc build must be resolved rather than publishing an old cache.
