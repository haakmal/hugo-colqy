# Colqy CMS — visibility and redundancy audit backlog

This is a **design checkpoint for A5/A6**, not a request to modify Sveltia's
internal DOM or maintain a fork. Review each editing section with actual
screenshots before agreeing on implementation.

For every field or control, decide whether it is:

- **Visible**: required in normal authoring.
- **Contextual**: visible only when the chosen format or mode requires it.
- **Collapsed**: useful occasionally but secondary to the body editor.
- **Hidden**: derived automatically from the content structure or type.
- **Removed**: redundant, unused or superseded by a better control.

Review the Sources, Books, Chapters, Indexes, Organisation, Statuses, Site Pages,
Media and global creation controls separately. Preserve the flat Markdown/YAML
contract, existing page URLs, local Git workflow and CMS portability.

Specific items already identified:

- Avoid exposing the same status through old Operational Settings and new status
  collections without explaining the compatibility boundary.
- Avoid duplicated labels or identifiers in Relation field displays.
- Reduce the number of CMS fields that repeat information already implied by
  the content type or folder hierarchy.
- Review default global `+` behaviour versus contextual New actions.
- Review redundant image toolbar controls when Insert already offers native
  image upload and custom Colqy components.
- Keep metadata and advanced properties from dominating the writing interface.

**Do not remove old Operational Settings in A4.3.** Their deprecation and any
migration must be separately designed and tested against existing references.
