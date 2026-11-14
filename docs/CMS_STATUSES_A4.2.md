# A4.2 — Editing statuses in Sveltia

This increment adds native status editors without changing canonical content or the existing operational settings. Use **Work with Local Repository** while developing Colqy.

## Editing a source

The optional **Statuses** list is available in Sources, Book overviews, Chapters, Indexes and the About page. Add as many items as needed. Choose **Local status** for free-form Heading, Current state, Note and Appearance; choose **Reuse shared status** to select a centrally managed entry. Both modes save in the existing `statuses` front matter used by Hugo A4.1. Appearance is semantic, not a fixed vocabulary for the status value.

## Shared status definitions

Use **Site · shared statuses** to create an entry such as `sabbatical` with heading, value, note and appearance. The CMS writes `data/shared_statuses/sabbatical.yaml`. Reference it from any source or from global announcements. Editing it updates every reference on the next Hugo build. Stable IDs are important; changing an ID requires updating references.

## Global announcements

Use **Site · global announcements** to edit `data/global_statuses.yaml`. Add a Local status for an announcement used only site-wide, or select Reuse shared status. The theme currently displays these in the footer. Clearing the list hides all global announcements.

## Compatibility and migration

The existing `data/site-status.yaml`, `status_key` references and **Site · operational settings** remain intact for now. A source with a nonempty `statuses` list uses the new statuses instead of `status_key`. Existing A4.1 `data/statuses.yaml` shared entries are copied into the new shared-status registry when A4.2 is applied, without deleting the originals. Existing A4.1 global entries are copied into `data/global_statuses.yaml` if it doesn't exist yet. The installer needs PyYAML **only if** A4.1 shared/global values are nonempty; otherwise Python's standard library is sufficient.

The new CMS fields are not an arbitrary layout designer. The theme determines placement. A future CMS checkpoint will also replace the free-text `content_type` field with a controlled selector.

## Verification

1. Add two Local statuses to a Source and confirm both appear in Hugo.
2. Save, reopen and edit the status fields; verify Markdown front matter round-trips.
3. Create a Shared status and reference it from two sources. Change its value; both update.
4. Add a Global announcement; confirm it appears in the footer on two pages, then clear it.
5. Verify existing `status_key` notices and Operational Settings still work.
6. Verify Book, Chapter and Index editors expose the same Statuses controls.
7. Run `hugo --minify`, `git diff --check`, and review changed files.

### Troubleshooting

- **Status not visible:** inspect `statuses:` front matter, shared-status ID and the Hugo terminal for unknown-status warnings.
- **CMS controls missing:** reload `/admin/` after applying the config change, using Local Repository mode.
- **Global announcement persists:** check `data/global_statuses.yaml`; legacy global values are ignored once this file exists.
- **Installer requests PyYAML:** install it in a virtual environment for migration of nonempty A4.1 data; do not overwrite legacy data.
- **Git push rejected:** fetch and inspect remote divergence; do not pull over uncommitted local changes.
