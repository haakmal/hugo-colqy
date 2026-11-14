# Colqy A5.5 — Current status architecture

The old Operational Settings mechanism is retired.

- `statuses: []` (or absent `statuses`) means no source status.
- A local status is stored in the source's `statuses` list.
- A reusable status is defined in `data/shared_statuses/` and referenced by ID.
- Site-wide announcements are assigned in `data/global_statuses.yaml` through Site Settings.
- `draft: true` remains independent of editorial statuses.
- `status_key` and `data/site-status.yaml` are no longer supported.

The renderer retains compatibility with early A4.1 reusable definitions in
`data/statuses.yaml`; this is independent of the retired Operational Settings.

Earlier increment documents are historical and may describe the removed system.
