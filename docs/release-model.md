# Repository and release model

Colqy is intended to have **two separate Git repositories**:

1. **Development repository:** internal experiments, incremental patches and regression history. It can remain private.
2. **Public repository:** a fresh Git history containing only supported source files, documentation, the Mira Vale starter, demo fixtures and release workflows.

GitHub **releases and tags** such as `v1.0.0-rc.1` and `v1.0.0` belong to the **public repository**. A release under the development repository would not remove its historical files or sensitive commits. Do not push the development `.git` directory or use `git push --mirror` to create the public project.

## First publication sequence

1. Export a clean candidate with the validated release exporter.
2. Review personal data, third-party media licences, `LICENSE`, CMS repository ownership, demo content and Actions opt-in.
3. Rehearse a clean Hugo/Pandoc build and browser/CMS tests.
4. Create a **new** GitHub repository. Copy the clean candidate into a new local directory, initialise Git and make the first commit there. Do not copy `.git` from development.
5. Connect the new public remote and push. Keep `COLQY_PUBLISH` unset until the public-site review is complete.
6. Configure GitHub Pages and verify that the public CMS points to the new repository; enable publishing deliberately.
7. Tag a release candidate; after acceptance testing, tag the stable public release.

## Subsequent updates

The exporter is a one-way release-preparation tool, **not a sync engine**. For updates, generate a fresh candidate and review its changes against the public repository. Preserve public issue history, tags and user-facing compatibility. Avoid replacing the public repository with a new Git history for every version.

## Individual academic sites

Users create their **own fork or template-derived repository**, configure Sveltia's backend for it, and choose their own site identity and theme. They should not be expected to commit into the Colqy public repository. A bespoke personal skin can be maintained separately from the public default skin.

## Release blockers

A missing or placeholder licence, unreviewed personal details, unlicensed media, broken first-run authentication, stale citations, or failing clean builds block a public release. The release candidate is not automatically production-ready simply because it exports successfully.
